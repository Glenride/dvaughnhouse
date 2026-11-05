// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta, toBalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "@uniswap/v4-core/src/test/PoolModifyLiquidityTest.sol";

import {BASE_SEPOLIA_POOL_MANAGER, TC_HOOK_FLAGS} from "../src/PearlsConstants.sol";
import {HookMiner} from "../src/HookMiner.sol";
import {TCCore} from "../src/TCCore.sol";
import {TCHook} from "../src/TCHook.sol";
import {LaunchFactory} from "../src/LaunchFactory.sol";
import {LaunchCertificate} from "../src/LaunchCertificate.sol";
import {LaunchToken} from "../src/LaunchToken.sol";

/// @dev Minimal mock PoolManager for direct adapter unit tests (tracks `take` calls).
contract MockPoolManagerForUnit {
    Currency public lastTakenCurrency;
    address public lastTakenTo;
    uint256 public lastTakenAmount;
    uint256 public totalTaken;

    function take(Currency currency, address to, uint256 amount) external {
        lastTakenCurrency = currency;
        lastTakenTo = to;
        lastTakenAmount = amount;
        totalTaken += amount;
    }
}

/// @dev Mintable 18-decimal ERC-20 for fork pool testing.
contract ForkTestERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @notice Hook unit suite: volume gate, fee maths, launch guard, CREATE2
///         permission mining, and adapter direction-resolution table
///         (spec §7.3 — all four direction cases pinned explicitly).
contract TCHookTest is Test {
    address treasury = makeAddr("treasury");
    address reporter = makeAddr("reporter");
    address stranger = makeAddr("stranger");

    uint256 constant THRESHOLD = 10_000_000e6; // $10M in 6-dec quote units

    TCCore core;
    MockPoolManagerForUnit mockPm;

    function setUp() public {
        core = new TCCore(treasury, reporter, false, THRESHOLD, 0, 0);
        mockPm = new MockPoolManagerForUnit();
    }

    /// @dev Deploy `TCHook` at a CREATE2-mined address whose low 14 bits
    ///      match `TC_HOOK_FLAGS` (`0x00CC`).
    function _deployMinedHook(
        IPoolManager pm,
        address treasury_,
        bool quoteIsCurrency0,
        uint256 threshold,
        uint256 maxSwapQuote,
        uint256 maxSwapBlocks
    ) internal returns (TCHook hook) {
        bytes memory constructorArgs =
            abi.encode(pm, treasury_, quoteIsCurrency0, threshold, maxSwapQuote, maxSwapBlocks);
        (address expectedAddr, bytes32 salt) =
            HookMiner.find(address(this), TC_HOOK_FLAGS, type(TCHook).creationCode, constructorArgs);
        hook = new TCHook{salt: salt}(pm, treasury_, quoteIsCurrency0, threshold, maxSwapQuote, maxSwapBlocks);
        assertEq(address(hook), expectedAddr);
    }

    /// Pack a v4-style BalanceDelta: amount0 high 128, amount1 low 128
    /// (two's-complement in each half).
    function _packDelta(int128 a0, int128 a1) internal pure returns (int256 packed) {
        uint256 hi = uint256(uint128(a0)) << 128;
        uint256 lo = uint256(uint128(a1));
        packed = int256(hi | lo);
    }

    function _dummyKey() internal pure returns (PoolKey memory key) {
        key = PoolKey({
            currency0: Currency.wrap(address(0x1000)),
            currency1: Currency.wrap(address(0x2000)),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });
    }

    // ---------------------------------------------------------------------
    // Fee maths + gate semantics
    // ---------------------------------------------------------------------

    function test_quoteFee_below_gate_is_zero() public view {
        assertEq(core.quoteFee(1_000_000e6, false), 0);
        assertEq(core.quoteFee(0, false), 0);
    }

    function test_quoteFee_above_gate_is_30bps_rounding_down() public view {
        assertEq(core.quoteFee(1_000_000e6, true), 3_000e6); // exactly 0.3%
        assertEq(core.quoteFee(333, true), 0); // 333*30/10000 = 0 (rounds down)
        assertEq(core.quoteFee(334, true), 1); // 334*30/10000 = 1
        assertEq(core.feeBps(), 30);
    }

    function test_gate_crossing_swap_pays_no_fee_then_fees_start() public {
        vm.prank(reporter);
        uint256 fee1 = core.recordSwap(9_000_000e6);
        assertEq(fee1, 0);
        assertFalse(core.feeActive());

        vm.prank(reporter);
        uint256 fee2 = core.recordSwap(2_000_000e6); // crosses: total 11M
        assertEq(fee2, 0, "the crossing swap itself is fee-free");
        assertTrue(core.feeActive());
        assertEq(core.cumulativeVolumeQuote(), 11_000_000e6);

        vm.prank(reporter);
        uint256 fee3 = core.recordSwap(1_000_000e6); // first taxed swap
        assertEq(fee3, 3_000e6);
        assertEq(core.totalFeesQuote(), 3_000e6);
    }

    function test_recordSwap_only_reporter() public {
        vm.prank(stranger);
        vm.expectRevert(TCCore.NotReporter.selector);
        core.recordSwap(1e6);
    }

    function test_fuzz_volume_monotonic_and_fee_only_post_gate(uint256[] calldata amounts) public {
        vm.assume(amounts.length > 0 && amounts.length <= 32);
        uint256 prevCum;
        uint256 prevFees;
        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 amt = bound(amounts[i], 0, 5_000_000e6);
            bool wasActive = core.feeActive();
            vm.prank(reporter);
            uint256 fee = core.recordSwap(amt);
            if (!wasActive) assertEq(fee, 0, "no fee before the gate");
            else assertEq(fee, (amt * 30) / 10_000);
            assertGe(core.cumulativeVolumeQuote(), prevCum);
            assertGe(core.totalFeesQuote(), prevFees);
            prevCum = core.cumulativeVolumeQuote();
            prevFees = core.totalFeesQuote();
        }
    }

    // ---------------------------------------------------------------------
    // Launch guard (max swap during window)
    // ---------------------------------------------------------------------

    function test_max_swap_guard_enforced_then_expires() public {
        TCCore guarded = new TCCore(treasury, reporter, false, THRESHOLD, 100_000e6, 5);
        vm.prank(reporter);
        guarded.recordSwap(100_000e6); // at the cap: ok
        vm.prank(reporter);
        vm.expectRevert(abi.encodeWithSelector(TCCore.SwapTooLarge.selector, 100_001e6, 100_000e6));
        guarded.recordSwap(100_001e6);

        vm.roll(block.number + 6); // window over
        vm.prank(reporter);
        guarded.recordSwap(100_001e6); // now fine
    }

    // ---------------------------------------------------------------------
    // CREATE2 salt mining + permission validation
    // ---------------------------------------------------------------------

    function test_hookMiner_mines_valid_permissions_and_rejects_unmined_address() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, false, THRESHOLD, 0, 0);
        assertEq(uint160(address(hook)) & Hooks.ALL_HOOK_MASK, TC_HOOK_FLAGS);
        Hooks.validateHookPermissions(IHooks(address(hook)), hook.getHookPermissions());

        // Deploying without mining at a regular CREATE address fails permission validation.
        vm.expectRevert(abi.encodeWithSelector(Hooks.HookAddressNotValid.selector, vm.computeCreateAddress(address(this), vm.getNonce(address(this)))));
        new TCHook(IPoolManager(address(mockPm)), treasury, false, THRESHOLD, 0, 0);
    }

    function test_callbacks_only_poolManager() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, false, THRESHOLD, 0, 0);
        PoolKey memory key = _dummyKey();
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({zeroForOne: true, amountSpecified: -100, sqrtPriceLimitX96: 0});

        vm.prank(stranger);
        vm.expectRevert(TCHook.NotPoolManager.selector);
        hook.beforeSwap(stranger, key, params, "");

        vm.prank(stranger);
        vm.expectRevert(TCHook.NotPoolManager.selector);
        hook.afterSwap(stranger, key, params, toBalanceDelta(-100, 100), "");
    }

    // ---------------------------------------------------------------------
    // Adapter: unpacking + direction resolution (spec §7.3 matrix)
    // ---------------------------------------------------------------------

    function test_unpack_delta_roundtrip() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, false, THRESHOLD, 0, 0);
        (int256 a0, int256 a1) = hook.unpackDelta(_packDelta(-500, 750));
        assertEq(a0, -500);
        assertEq(a1, 750);
        (a0, a1) = hook.unpackDelta(_packDelta(123_456, -987_654));
        assertEq(a0, 123_456);
        assertEq(a1, -987_654);
    }

    /// The four direction cases. Quote = currency1 in these tests
    /// (quoteIsCurrency0 = false), so the quote amount is always |amount1|
    /// whether the swapper paid quote (delta negative) or received it
    /// (delta positive). A naive "input amount" reader would tax the token
    /// on two of these four — these assertions pin the correct behaviour.
    function test_resolve_quote_amount_four_cases() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, false, THRESHOLD, 0, 0);
        // Case 1: buy, exact-in. zeroForOne=false (quote -> token).
        // Swapper pays 1,000 quote (delta1 = -1000), receives token (+X).
        assertEq(hook.resolveQuoteAmount(_packDelta(5000, -1000)), 1000);
        // Case 2: sell, exact-in. zeroForOne=true (token -> quote).
        // Swapper pays token (-X), receives 900 quote (delta1 = +900).
        assertEq(hook.resolveQuoteAmount(_packDelta(-5000, 900)), 900);
        // Case 3: buy, exact-out. Swapper specifies token out; pays 1,100
        // quote (delta1 = -1100).
        assertEq(hook.resolveQuoteAmount(_packDelta(5000, -1100)), 1100);
        // Case 4: sell, exact-out. Swapper specifies 950 quote out
        // (delta1 = +950), pays token (-X).
        assertEq(hook.resolveQuoteAmount(_packDelta(-5200, 950)), 950);
    }

    function test_resolve_quote_amount_when_quote_is_currency0() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, true, THRESHOLD, 0, 0);
        // Quote is amount0 now: pays 2,000 quote on a buy...
        assertEq(hook.resolveQuoteAmount(_packDelta(-2000, 7000)), 2000);
        // ...and receives 1,800 quote on a sell.
        assertEq(hook.resolveQuoteAmount(_packDelta(1800, -7000)), 1800);
    }

    function test_adapter_afterSwap_records_and_returns_fee() public {
        TCHook hook = _deployMinedHook(IPoolManager(address(mockPm)), treasury, false, 1_000_000e6, 0, 0);
        TCCore c = hook.core();
        assertEq(c.poolReporter(), address(hook));

        PoolKey memory key = _dummyKey();
        IPoolManager.SwapParams memory buyExactIn = IPoolManager.SwapParams({zeroForOne: false, amountSpecified: -900_000e6, sqrtPriceLimitX96: 0});
        IPoolManager.SwapParams memory crossSwap = IPoolManager.SwapParams({zeroForOne: false, amountSpecified: -200_000e6, sqrtPriceLimitX96: 0});
        IPoolManager.SwapParams memory sellExactIn = IPoolManager.SwapParams({zeroForOne: true, amountSpecified: -10, sqrtPriceLimitX96: 0});

        // Below the gate: records volume, no fee claim.
        vm.prank(address(mockPm));
        (, int128 feeDelta) = hook.afterSwap(address(this), key, buyExactIn, toBalanceDelta(10, -900_000e6), "");
        assertEq(feeDelta, 0);
        assertEq(c.cumulativeVolumeQuote(), 900_000e6);

        // Cross the gate (still no fee on the crossing swap)...
        vm.prank(address(mockPm));
        hook.afterSwap(address(this), key, crossSwap, toBalanceDelta(10, -200_000e6), "");
        assertTrue(c.feeActive());

        // ...then the next swap's fee claim equals 0.3% of its quote side and settles to treasury via take().
        vm.prank(address(mockPm));
        (, feeDelta) = hook.afterSwap(address(this), key, sellExactIn, toBalanceDelta(-10, 1_000_000e6), "");
        assertEq(feeDelta, 3_000e6);
        assertEq(c.totalFeesQuote(), 3_000e6);
        assertEq(mockPm.lastTakenTo(), treasury);
        assertEq(mockPm.lastTakenAmount(), 3_000e6);
        assertEq(Currency.unwrap(mockPm.lastTakenCurrency()), Currency.unwrap(key.currency1));
    }

    function test_core_callbacks_revert_by_design() public {
        PoolKey memory key = _dummyKey();
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({zeroForOne: true, amountSpecified: -1, sqrtPriceLimitX96: 0});
        vm.expectRevert();
        core.beforeSwap(address(this), key, params, "");
    }
}

/// @notice Spec §7.3 Base Sepolia Fork-Test Matrix:
///         Tests `TCHook` against the canonical Uniswap v4 `PoolManager`,
///         `PoolModifyLiquidityTest`, and `PoolSwapTest` deployed on Base Sepolia
///         (chain ID 84532) across all 4 swap directions, pre-gate, crossing swap,
///         post-gate, both `quoteIsCurrency0` orientations, launch guard window,
///         and end-to-end `LaunchFactory.launch()`.
contract TCHookForkTest is Test {
    // Canonical Base Sepolia Uniswap v4 deployments
    IPoolManager constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);
    PoolModifyLiquidityTest constant MODIFY_LIQUIDITY_ROUTER =
        PoolModifyLiquidityTest(0x37429cD17Cb1454C34E7F50b09725202Fd533039);
    PoolSwapTest constant SWAP_ROUTER = PoolSwapTest(0x8B5bcC363ddE2614281aD875bad385E0A785D3B9);

    uint256 constant FORK_BLOCK = 49_250_000;
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336; // 1:1 price (tick 0)
    uint24 constant POOL_FEE = 0; // 0 LP fee to isolate exact 30 bps TCHook fee math in tests
    int24 constant TICK_SPACING = 60;

    uint256 constant GATE_THRESHOLD = 10_000e18; // 10,000 quote units for fast multi-swap gate testing

    address treasury = makeAddr("treasury");
    address trader = makeAddr("trader");

    function setUp() public {
        string memory rpc = vm.envOr("BASE_SEPOLIA_RPC_URL", string("https://sepolia.base.org"));
        vm.createSelectFork(rpc, FORK_BLOCK);
        assertEq(block.chainid, 84532);
    }

    struct ForkPoolEnv {
        ForkTestERC20 token;
        ForkTestERC20 quote;
        TCHook hook;
        TCCore core;
        PoolKey key;
    }

    /// @dev Deploy sorted token + quote ERC-20s, mine + deploy `TCHook`,
    ///      initialize the pool on the forked Base Sepolia `PoolManager`,
    ///      and seed deep full-range liquidity.
    function _setupForkPool(
        bool quoteIsCurrency0,
        uint256 threshold,
        uint256 maxSwapQuote,
        uint256 maxSwapBlocks
    ) internal returns (ForkPoolEnv memory env) {
        ForkTestERC20 a = new ForkTestERC20("AssetA", "A");
        ForkTestERC20 b = new ForkTestERC20("AssetB", "B");
        (ForkTestERC20 low, ForkTestERC20 high) = address(a) < address(b) ? (a, b) : (b, a);

        if (quoteIsCurrency0) {
            env.quote = low;
            env.token = high;
        } else {
            env.token = low;
            env.quote = high;
        }

        bytes memory constructorArgs =
            abi.encode(POOL_MANAGER, treasury, quoteIsCurrency0, threshold, maxSwapQuote, maxSwapBlocks);
        (, bytes32 salt) =
            HookMiner.find(address(this), TC_HOOK_FLAGS, type(TCHook).creationCode, constructorArgs);
        env.hook = new TCHook{salt: salt}(
            POOL_MANAGER, treasury, quoteIsCurrency0, threshold, maxSwapQuote, maxSwapBlocks
        );
        env.core = env.hook.core();

        env.key = PoolKey({
            currency0: Currency.wrap(address(low)),
            currency1: Currency.wrap(address(high)),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(env.hook))
        });

        POOL_MANAGER.initialize(env.key, SQRT_PRICE_1_1);

        // Mint and approve deep liquidity (10,000,000e18 of each side)
        low.mint(address(this), 10_000_000e18);
        high.mint(address(this), 10_000_000e18);
        low.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        high.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);

        MODIFY_LIQUIDITY_ROUTER.modifyLiquidity(
            env.key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 5_000_000e18,
                salt: bytes32(0)
            }),
            ""
        );

        // Fund trader and approve SWAP_ROUTER
        env.token.mint(trader, 5_000_000e18);
        env.quote.mint(trader, 5_000_000e18);
        vm.startPrank(trader);
        env.token.approve(address(SWAP_ROUTER), type(uint256).max);
        env.quote.approve(address(SWAP_ROUTER), type(uint256).max);
        vm.stopPrank();
    }

    function _swap(PoolKey memory key, bool zeroForOne, int256 amountSpecified)
        internal
        returns (BalanceDelta delta)
    {
        uint160 priceLimit = zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1;
        vm.prank(trader);
        delta = SWAP_ROUTER.swap(
            key,
            IPoolManager.SwapParams({zeroForOne: zeroForOne, amountSpecified: amountSpecified, sqrtPriceLimitX96: priceLimit}),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — Direction Case 1: Buy, exact-in
    // (quoteIsCurrency0 = false => zeroForOne = false, amountSpecified < 0)
    // ---------------------------------------------------------------------

    function test_fork_case1_buy_exact_in_pre_cross_and_post_gate() public {
        ForkPoolEnv memory env = _setupForkPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: 6,000 quote in -> 0 fee
        _swap(env.key, false, -int256(6_000e18));
        assertFalse(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), 6_000e18);
        assertEq(env.quote.balanceOf(treasury), 0, "no fee below gate");
        assertEq(env.token.balanceOf(treasury), 0, "never takes launched token");

        // 2. Gate-crossing swap: 5,000 quote in (cum = 11,000 >= 10,000) -> 0 fee on crossing swap
        _swap(env.key, false, -int256(5_000e18));
        assertTrue(env.core.feeActive(), "gate must flip active");
        assertEq(env.core.cumulativeVolumeQuote(), 11_000e18);
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap itself pays 0 fee");
        assertEq(env.token.balanceOf(treasury), 0);

        // 3. Post-gate swap: 1,000 quote in -> 30 bps = 3e18 quote to treasury
        uint256 traderQuoteBefore = env.quote.balanceOf(trader);
        _swap(env.key, false, -int256(1_000e18));
        uint256 expectedFee = (1_000e18 * 30) / 10_000; // 3e18
        assertEq(traderQuoteBefore - env.quote.balanceOf(trader), 1_000e18, "trader paid exact 1,000 quote");
        assertEq(env.quote.balanceOf(treasury), expectedFee, "treasury received exact 30 bps in quote");
        assertEq(env.token.balanceOf(treasury), 0, "treasury received 0 launched token");
        assertEq(env.core.totalFeesQuote(), expectedFee);
        assertEq(env.core.cumulativeVolumeQuote(), 12_000e18);
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — Direction Case 2: Sell, exact-in
    // (quoteIsCurrency0 = false => zeroForOne = true, amountSpecified < 0)
    // ---------------------------------------------------------------------

    function test_fork_case2_sell_exact_in_pre_cross_and_post_gate() public {
        ForkPoolEnv memory env = _setupForkPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: sell 6,000 token in -> 0 fee
        BalanceDelta d1 = _swap(env.key, true, -int256(6_000e18));
        uint256 q1 = uint256(int256(d1.amount1()));
        assertFalse(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), q1);
        assertEq(env.quote.balanceOf(treasury), 0);
        assertEq(env.token.balanceOf(treasury), 0);

        // 2. Gate-crossing swap: sell 6,000 token in -> crosses 10,000 quote gate, 0 fee
        BalanceDelta d2 = _swap(env.key, true, -int256(6_000e18));
        uint256 q2 = uint256(int256(d2.amount1()));
        assertTrue(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), q1 + q2);
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap pays 0 fee");
        assertEq(env.token.balanceOf(treasury), 0);

        // 3. Post-gate swap: sell 1,000 token in -> treasury gets 30 bps of pool quote output
        uint256 cumBefore = env.core.cumulativeVolumeQuote();
        uint256 traderQuoteBefore = env.quote.balanceOf(trader);
        BalanceDelta d3 = _swap(env.key, true, -int256(1_000e18));
        uint256 poolQuoteOut = env.core.cumulativeVolumeQuote() - cumBefore;
        uint256 expectedFee = (poolQuoteOut * 30) / 10_000;

        assertGt(expectedFee, 0);
        assertEq(env.quote.balanceOf(treasury), expectedFee, "treasury received exact 30 bps of quote output");
        assertEq(env.token.balanceOf(treasury), 0, "treasury received 0 launched token");
        assertEq(env.core.totalFeesQuote(), expectedFee);
        assertEq(
            env.quote.balanceOf(trader) - traderQuoteBefore,
            poolQuoteOut - expectedFee,
            "trader received pool quote output minus 30 bps fee"
        );
        assertEq(uint256(int256(d3.amount1())), poolQuoteOut - expectedFee);
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — Direction Case 3: Buy, exact-out
    // (quoteIsCurrency0 = false => zeroForOne = false, amountSpecified > 0)
    // ---------------------------------------------------------------------

    function test_fork_case3_buy_exact_out_pre_cross_and_post_gate() public {
        ForkPoolEnv memory env = _setupForkPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: buy exact 6,000 token out -> 0 fee
        BalanceDelta d1 = _swap(env.key, false, int256(6_000e18));
        uint256 q1 = uint256(-int256(d1.amount1()));
        assertFalse(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), q1);
        assertEq(env.quote.balanceOf(treasury), 0);
        assertEq(env.token.balanceOf(treasury), 0);

        // 2. Gate-crossing swap: buy exact 5,000 token out -> crosses gate, 0 fee
        BalanceDelta d2 = _swap(env.key, false, int256(5_000e18));
        uint256 q2 = uint256(-int256(d2.amount1()));
        assertTrue(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), q1 + q2);
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap pays 0 fee");
        assertEq(env.token.balanceOf(treasury), 0);

        // 3. Post-gate swap: buy exact 1,000 token out -> treasury gets 30 bps of pool quote input
        uint256 cumBefore = env.core.cumulativeVolumeQuote();
        uint256 traderTokenBefore = env.token.balanceOf(trader);
        uint256 traderQuoteBefore = env.quote.balanceOf(trader);
        BalanceDelta d3 = _swap(env.key, false, int256(1_000e18));
        uint256 poolQuoteIn = env.core.cumulativeVolumeQuote() - cumBefore;
        uint256 expectedFee = (poolQuoteIn * 30) / 10_000;

        assertGt(expectedFee, 0);
        assertEq(env.token.balanceOf(trader) - traderTokenBefore, 1_000e18, "trader received exact 1,000 token out");
        assertEq(
            traderQuoteBefore - env.quote.balanceOf(trader),
            poolQuoteIn + expectedFee,
            "trader paid pool quote input plus 30 bps fee"
        );
        assertEq(uint256(-int256(d3.amount1())), poolQuoteIn + expectedFee);
        assertEq(env.quote.balanceOf(treasury), expectedFee, "treasury received exact 30 bps in quote");
        assertEq(env.token.balanceOf(treasury), 0, "treasury received 0 launched token");
        assertEq(env.core.totalFeesQuote(), expectedFee);
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — Direction Case 4: Sell, exact-out
    // (quoteIsCurrency0 = false => zeroForOne = true, amountSpecified > 0)
    // ---------------------------------------------------------------------

    function test_fork_case4_sell_exact_out_pre_cross_and_post_gate() public {
        ForkPoolEnv memory env = _setupForkPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: sell token for exact 6,000 quote out -> 0 fee
        _swap(env.key, true, int256(6_000e18));
        assertFalse(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), 6_000e18);
        assertEq(env.quote.balanceOf(treasury), 0);
        assertEq(env.token.balanceOf(treasury), 0);

        // 2. Gate-crossing swap: sell token for exact 5,000 quote out -> crosses gate, 0 fee
        _swap(env.key, true, int256(5_000e18));
        assertTrue(env.core.feeActive());
        assertEq(env.core.cumulativeVolumeQuote(), 11_000e18);
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap pays 0 fee");
        assertEq(env.token.balanceOf(treasury), 0);

        // 3. Post-gate swap: sell token for exact 1,000 quote out -> treasury gets 30 bps (3e18 quote)
        uint256 traderQuoteBefore = env.quote.balanceOf(trader);
        _swap(env.key, true, int256(1_000e18));
        uint256 expectedFee = (1_000e18 * 30) / 10_000; // 3e18
        assertEq(env.quote.balanceOf(trader) - traderQuoteBefore, 1_000e18, "trader received exact 1,000 quote out");
        assertEq(env.quote.balanceOf(treasury), expectedFee, "treasury received exact 30 bps in quote");
        assertEq(env.token.balanceOf(treasury), 0, "treasury received 0 launched token");
        assertEq(env.core.totalFeesQuote(), expectedFee);
        assertEq(env.core.cumulativeVolumeQuote(), 12_000e18);
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — All 4 Direction Cases when quoteIsCurrency0 = true
    // (quote = currency0, token = currency1)
    // ---------------------------------------------------------------------

    function test_fork_all_four_directions_when_quote_is_currency0() public {
        ForkPoolEnv memory env = _setupForkPool(true, GATE_THRESHOLD, 0, 0);

        // Cross the gate with a single 11,000 quote exact-in buy (zeroForOne = true when quote is currency0)
        _swap(env.key, true, -int256(11_000e18));
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap pays 0 fee");

        // Case 1 (quoteIsCurrency0 = true): Buy, exact-in (zeroForOne = true, amountSpecified < 0)
        uint256 treasuryBefore = env.quote.balanceOf(treasury);
        _swap(env.key, true, -int256(1_000e18));
        assertEq(env.quote.balanceOf(treasury) - treasuryBefore, 3e18, "Case 1 (quote=c0) fee mismatch");
        assertEq(env.token.balanceOf(treasury), 0);

        // Case 2 (quoteIsCurrency0 = true): Sell, exact-in (zeroForOne = false, amountSpecified < 0)
        treasuryBefore = env.quote.balanceOf(treasury);
        uint256 cumBefore = env.core.cumulativeVolumeQuote();
        _swap(env.key, false, -int256(1_000e18));
        uint256 poolQuoteOut = env.core.cumulativeVolumeQuote() - cumBefore;
        assertEq(
            env.quote.balanceOf(treasury) - treasuryBefore,
            (poolQuoteOut * 30) / 10_000,
            "Case 2 (quote=c0) fee mismatch"
        );
        assertEq(env.token.balanceOf(treasury), 0);

        // Case 3 (quoteIsCurrency0 = true): Buy, exact-out (zeroForOne = true, amountSpecified > 0)
        treasuryBefore = env.quote.balanceOf(treasury);
        cumBefore = env.core.cumulativeVolumeQuote();
        _swap(env.key, true, int256(1_000e18));
        uint256 poolQuoteIn = env.core.cumulativeVolumeQuote() - cumBefore;
        assertEq(
            env.quote.balanceOf(treasury) - treasuryBefore,
            (poolQuoteIn * 30) / 10_000,
            "Case 3 (quote=c0) fee mismatch"
        );
        assertEq(env.token.balanceOf(treasury), 0);

        // Case 4 (quoteIsCurrency0 = true): Sell, exact-out (zeroForOne = false, amountSpecified > 0)
        treasuryBefore = env.quote.balanceOf(treasury);
        _swap(env.key, false, int256(1_000e18));
        assertEq(env.quote.balanceOf(treasury) - treasuryBefore, 3e18, "Case 4 (quote=c0) fee mismatch");
        assertEq(env.token.balanceOf(treasury), 0);
    }

    // ---------------------------------------------------------------------
    // Spec §7.3 Matrix — Launch Guard (maxSwapQuoteAmount × maxSwapBlocks)
    // across all 4 direction cases on forked PoolManager
    // ---------------------------------------------------------------------

    function test_fork_launch_guard_all_four_directions_and_expiry() public {
        uint256 maxSwapCap = 500e18;
        uint256 guardBlocks = 10;
        ForkPoolEnv memory env = _setupForkPool(false, GATE_THRESHOLD, maxSwapCap, guardBlocks);

        // During guard window: swaps within cap succeed
        _swap(env.key, false, -int256(500e18)); // Case 1 at cap: ok

        // During guard window: swaps above cap revert in all 4 directions
        // Case 1 (Buy exact-in): 501 quote in > 500 cap
        vm.expectRevert();
        _swap(env.key, false, -int256(501e18));

        // Case 2 (Sell exact-in): 600 token in produces > 500 quote out
        vm.expectRevert();
        _swap(env.key, true, -int256(600e18));

        // Case 3 (Buy exact-out): 600 token out costs > 500 quote in
        vm.expectRevert();
        _swap(env.key, false, int256(600e18));

        // Case 4 (Sell exact-out): 501 quote out > 500 cap
        vm.expectRevert();
        _swap(env.key, true, int256(501e18));

        // Advance past guard window: all 4 directions above cap now succeed
        vm.roll(block.number + guardBlocks + 1);
        _swap(env.key, false, -int256(1_000e18));
        _swap(env.key, true, -int256(1_000e18));
        _swap(env.key, false, int256(1_000e18));
        _swap(env.key, true, int256(1_000e18));
    }

    // ---------------------------------------------------------------------
    // End-to-End LaunchFactory.launch() -> Pool Init -> Liquidity -> Swaps
    // on Base Sepolia Fork
    // ---------------------------------------------------------------------

    function test_fork_end_to_end_factory_launch_and_swaps() public {
        LaunchFactory factory = new LaunchFactory(treasury);
        ForkTestERC20 quote = new ForkTestERC20("Mock USDC", "mUSDC");

        // Predict the LaunchToken address that factory.launch will deploy (after TCHook and LaunchLocker)
        address predictedToken = vm.computeCreateAddress(address(factory), vm.getNonce(address(factory)) + 2);
        bool quoteIsC0 = address(quote) < predictedToken;

        LaunchFactory.LaunchParams memory p;
        p.name = "Abyssal Pearl";
        p.symbol = "PEARL";
        p.totalSupply = 1_000_000_000e18;
        p.creator = makeAddr("creator");
        p.quoteAsset = address(quote);
        p.poolFeeTier = 3000;
        p.volumeThresholdQuote = GATE_THRESHOLD;
        p.usdGate = 10_000_000e6;
        p.lockMode = LaunchCertificate.LockMode.Abyssal;
        p.lockDurationSeconds = 0;
        p.lpFeeMode = LaunchCertificate.LpFeeMode.CreatorClaimable;
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        p.liquidityAllocation = address(this);
        p.quoteIsCurrency0 = quoteIsC0;
        p.walletCapAmount = 50_000_000e18; // 5% wallet cap active during launch
        p.walletCapBlocks = 20;
        p.maxSwapQuoteAmount = 0;
        p.maxSwapBlocks = 0;

        LaunchFactory.LaunchResult memory r = factory.launch(p);
        assertEq(r.token, predictedToken);
        assertTrue(LaunchToken(r.token).capExempt( address(POOL_MANAGER)), "PoolManager must be capExempt");

        // Initialize the v4 pool on Base Sepolia PoolManager with the factory-deployed TCHook
        (Currency c0, Currency c1) = quoteIsC0
            ? (Currency.wrap(address(quote)), Currency.wrap(r.token))
            : (Currency.wrap(r.token), Currency.wrap(address(quote)));

        PoolKey memory key = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(r.hook)
        });
        assertEq(PoolId.unwrap(r.poolId), PoolId.unwrap(key.toId()), "launch poolId must equal key.toId()");

        POOL_MANAGER.initialize(key, SQRT_PRICE_1_1);

        // Seed 200,000,000e18 liquidity (exceeds 5% wallet cap, proving PoolManager is capExempt!)
        quote.mint(address(this), 500_000_000e18);
        IERC20(r.token).approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        quote.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);

        MODIFY_LIQUIDITY_ROUTER.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 100_000_000e18,
                salt: bytes32(0)
            }),
            ""
        );

        // Fund trader with quote and swap across the gate, then verify post-gate fee to treasury
        quote.mint(trader, 50_000e18);
        vm.prank(trader);
        quote.approve(address(SWAP_ROUTER), type(uint256).max);

        bool buyZeroForOne = quoteIsC0;
        _swap(key, buyZeroForOne, -int256(11_000e18)); // crosses 10,000e18 gate
        assertTrue(TCCore(r.hookCore).feeActive());
        assertEq(quote.balanceOf(treasury), 0);

        _swap(key, buyZeroForOne, -int256(2_000e18)); // post-gate buy: 30 bps of 2,000 = 6e18
        assertEq(quote.balanceOf(treasury), 6e18);
        assertEq(IERC20(r.token).balanceOf(treasury), 0);
        assertEq(TCCore(r.hookCore).totalFeesQuote(), 6e18);
    }
}
