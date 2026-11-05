// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta, toBalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolModifyLiquidityTest} from "@uniswap/v4-core/src/test/PoolModifyLiquidityTest.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";

import {TCHook} from "../src/TCHook.sol";
import {TCCore} from "../src/TCCore.sol";
import {HookMiner} from "../src/HookMiner.sol";
import {LaunchFactory} from "../src/LaunchFactory.sol";
import {LaunchToken} from "../src/LaunchToken.sol";
import {LaunchCertificate} from "../src/LaunchCertificate.sol";
import {LaunchLocker} from "../src/LaunchLocker.sol";
import {TC_HOOK_FLAGS, BASE_SEPOLIA_POOL_MANAGER} from "../src/PearlsConstants.sol";
import {ForkTestERC20} from "./TCHook.t.sol";
import {MockQuoteAsset, MockLPPosition} from "./Mocks.sol";

/// @title PearlAdversarialForkTest
/// @notice Comprehensive adversarial attack-perspective test suite on Base Sepolia fork:
///         Proves that fee bypass, guard evasion, locker drainage, and callback spoofing
///         attacks fail cleanly and cannot compromise platform security invariants.
contract PearlAdversarialForkTest is Test {
    IPoolManager constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);
    PoolModifyLiquidityTest constant MODIFY_LIQUIDITY_ROUTER =
        PoolModifyLiquidityTest(0x37429cD17Cb1454C34E7F50b09725202Fd533039);
    PoolSwapTest constant SWAP_ROUTER = PoolSwapTest(0x8B5bcC363ddE2614281aD875bad385E0A785D3B9);

    uint256 constant FORK_BLOCK = 49_250_000;
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336;
    uint24 constant POOL_FEE = 0;
    int24 constant TICK_SPACING = 60;
    uint256 constant GATE_THRESHOLD = 10_000e18;

    address treasury = makeAddr("treasury");
    address attacker = makeAddr("attacker");
    address creator = makeAddr("creator");

    struct AdversarialPoolEnv {
        ForkTestERC20 token;
        ForkTestERC20 quote;
        TCHook hook;
        TCCore core;
        PoolKey key;
    }

    function setUp() public {
        string memory rpc = vm.envOr("BASE_SEPOLIA_RPC_URL", string("https://sepolia.base.org"));
        vm.createSelectFork(rpc, FORK_BLOCK);
    }

    function _setupAdversarialPool(
        bool quoteIsCurrency0,
        uint256 threshold,
        uint256 maxSwapQuote,
        uint256 maxSwapBlocks
    ) internal returns (AdversarialPoolEnv memory env) {
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

        env.token.mint(attacker, 5_000_000e18);
        env.quote.mint(attacker, 5_000_000e18);
        vm.startPrank(attacker);
        env.token.approve(address(SWAP_ROUTER), type(uint256).max);
        env.quote.approve(address(SWAP_ROUTER), type(uint256).max);
        vm.stopPrank();
    }

    function _swapAttacker(PoolKey memory key, bool zeroForOne, int256 amountSpecified) internal returns (BalanceDelta delta) {
        uint160 priceLimit = zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1;
        vm.prank(attacker);
        delta = SWAP_ROUTER.swap(
            key,
            IPoolManager.SwapParams({zeroForOne: zeroForOne, amountSpecified: amountSpecified, sqrtPriceLimitX96: priceLimit}),
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}),
            ""
        );
    }

    // =====================================================================
    // 1. Fee Bypass Attacks
    // =====================================================================

    /// @notice Attack: Attacker tries to manipulate swap flow to extract or trigger
    ///         premature fees below the $10M gate.
    /// @dev Result: Below the gate, feeActive remains false, treasury quote balance is 0.
    function test_adversarial_fee_bypass_below_gate_cannot_extract_fees() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 0, 0);

        // Execute multiple sub-gate swaps
        _swapAttacker(env.key, false, -int256(3_000e18));
        _swapAttacker(env.key, true, -int256(2_000e18));
        _swapAttacker(env.key, false, int256(1_000e18));

        assertFalse(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0, "No fee can be extracted below gate");
        assertEq(env.token.balanceOf(treasury), 0, "Launched token never touched");
    }

    /// @notice Attack: Attacker attempts to double-count volume or trigger fee on the crossing swap.
    /// @dev Result: The gate crossing swap itself is strictly fee-free.
    function test_adversarial_crossing_swap_not_double_counted() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 0, 0);

        // Swap 1: 8,000 quote
        _swapAttacker(env.key, false, -int256(8_000e18));
        assertFalse(env.core.feeActive());

        // Swap 2: 4,000 quote crosses the 10,000 gate to 12,000
        _swapAttacker(env.key, false, -int256(4_000e18));
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0, "Crossing swap must be completely fee-free");

        // Swap 3: 1,000 quote (taxed at exactly 30 bps = 3e18)
        _swapAttacker(env.key, false, -int256(1_000e18));
        assertEq(env.quote.balanceOf(treasury), 3e18, "Only post-gate swap pays fee");
    }

    /// @notice Attack: Attacker sets up a pool with quote as currency0 and attempts to
    ///         confuse the hook into taxing the token instead of the quote.
    /// @dev Result: Fee is taken strictly in quote currency (currency0) and 0 in token.
    function test_adversarial_quote_orientation_confusion() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(true, GATE_THRESHOLD, 0, 0);

        // Cross gate
        _swapAttacker(env.key, true, -int256(11_000e18));
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // Post-gate swap with quote as currency0
        uint256 treasuryQuoteBefore = env.quote.balanceOf(treasury);
        _swapAttacker(env.key, true, -int256(1_000e18));

        assertEq(env.quote.balanceOf(treasury) - treasuryQuoteBefore, 3e18, "Fee paid in quote currency");
        assertEq(env.token.balanceOf(treasury), 0, "Launched token balance is strictly zero");
    }

    /// @notice Attack: Attacker tries to substitute launched token for quote asset fee.
    /// @dev Result: PoolManager.take always extracts key.currency1 (quote) to treasury Safe.
    function test_adversarial_fee_asset_substitution() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 0, 0);

        _swapAttacker(env.key, false, -int256(11_000e18));
        _swapAttacker(env.key, true, -int256(1_000e18));

        assertGt(env.quote.balanceOf(treasury), 0, "Treasury received quote asset");
        assertEq(env.token.balanceOf(treasury), 0, "Treasury never receives launched token");
    }

    // =====================================================================
    // 2. Guard Window Attacks
    // =====================================================================

    /// @notice Attack: Attacker attempts to bypass launch guard by swapping more than maxSwapQuoteAmount.
    /// @dev Result: Reverts with TCCore.SwapTooLarge.
    function test_adversarial_max_swap_guard_blocks_whale_buy() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 100e18, 10);

        // Within guard window: swap 101e18 quote (> 100e18 cap)
        vm.expectRevert();
        _swapAttacker(env.key, false, -int256(101e18));
    }

    /// @notice Attack: Attacker attempts to exploit guard window after expiration.
    /// @dev Result: Once block.number > launchBlock + maxSwapBlocks, guard dissolves cleanly.
    function test_adversarial_max_swap_guard_expires_cleanly() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 100e18, 10);

        vm.roll(block.number + 11);
        // Now 101e18 swap succeeds
        _swapAttacker(env.key, false, -int256(101e18));
        assertEq(env.core.cumulativeVolumeQuote(), 101e18);
    }

    /// @notice Attack: Attacker attempts to bypass LaunchToken per-wallet holding cap during cap window.
    /// @dev Result: Reverts with WalletCapExceeded.
    function test_adversarial_token_cap_bypass_blocked() public {
        address[] memory exempt = new address[](1);
        exempt[0] = address(this);
        uint256 cap = 20_000e18; // 2% cap
        // Total supply 1,000,000; 2% cap = 20,000 tokens for 100 blocks
        LaunchToken token = new LaunchToken("Token", "TKN", 1_000_000e18, address(this), cap, 100, exempt);

        address pool = makeAddr("pool");
        token.transfer(pool, 50_000e18); // from factory (address(this)) is exempt

        // Attacker gets 20,000 tokens from pool (non-factory, at the cap)
        vm.prank(pool);
        token.transfer(attacker, cap);

        // Attacker attempts to receive 1 more token (> 2% cap)
        vm.prank(pool);
        vm.expectRevert(abi.encodeWithSelector(LaunchToken.WalletCapExceeded.selector, attacker, cap + 1e18, cap));
        token.transfer(attacker, 1e18);
    }

    /// @notice Attack: Attacker tests boundary conditions on max-swap guard at launchBlock + maxSwapBlocks.
    /// @dev Result: Still enforced at exactly launchBlock + maxSwapBlocks; dissolves at +1 block.
    function test_adversarial_guard_boundary_enforcement() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 100e18, 5);

        // At exactly launchBlock + 5
        vm.roll(env.core.launchBlock() + 5);
        vm.expectRevert();
        _swapAttacker(env.key, false, -int256(101e18));

        // At launchBlock + 6 (expired)
        vm.roll(env.core.launchBlock() + 6);
        _swapAttacker(env.key, false, -int256(101e18));
        assertEq(env.core.cumulativeVolumeQuote(), 101e18);
    }

    // =====================================================================
    // 3. Locker Attacks
    // =====================================================================

    /// @notice Attack: Attacker attempts to withdraw principal from an Abyssal locker.
    /// @dev Result: Reverts with AbyssalNeverUnlocks.
    function test_adversarial_locker_abyssal_principal_withdrawal_fails() public {
        LaunchLocker locker = new LaunchLocker(
            creator,
            LaunchCertificate.LockMode.Abyssal,
            LaunchCertificate.LpFeeMode.CreatorClaimable,
            type(uint256).max
        );

        vm.prank(attacker);
        vm.expectRevert(LaunchLocker.AbyssalNeverUnlocks.selector);
        locker.withdrawPrincipal();

        vm.prank(creator);
        vm.expectRevert(LaunchLocker.AbyssalNeverUnlocks.selector);
        locker.withdrawPrincipal();
    }

    /// @notice Attack: Attacker attempts early withdrawal from a Timed locker before unlock.
    /// @dev Result: Reverts with StillLocked.
    function test_adversarial_locker_timed_early_withdrawal_fails() public {
        uint256 unlock = block.timestamp + 180 days;
        LaunchLocker locker = new LaunchLocker(
            creator,
            LaunchCertificate.LockMode.Timed,
            LaunchCertificate.LpFeeMode.CreatorClaimable,
            unlock
        );

        // Before deposit: reverts with NoPosition
        vm.prank(creator);
        vm.expectRevert(LaunchLocker.NoPosition.selector);
        locker.withdrawPrincipal();

        // Deposit mock position NFT
        MockQuoteAsset feeA = new MockQuoteAsset();
        MockQuoteAsset feeB = new MockQuoteAsset();
        MockLPPosition pos = new MockLPPosition(feeA, feeB);
        uint256 tid = pos.mint(address(locker));
        locker.deposit(address(pos), tid);

        // After deposit, before unlock: reverts with StillLocked
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(LaunchLocker.StillLocked.selector, unlock));
        locker.withdrawPrincipal();
    }

    /// @notice Attack: Attacker attempts withdrawal from a Timed locker after unlock (not creator).
    /// @dev Result: Reverts with NotCreator.
    function test_adversarial_locker_timed_non_creator_cannot_withdraw() public {
        uint256 unlock = block.timestamp + 180 days;
        LaunchLocker locker = new LaunchLocker(
            creator,
            LaunchCertificate.LockMode.Timed,
            LaunchCertificate.LpFeeMode.CreatorClaimable,
            unlock
        );
        MockQuoteAsset feeA = new MockQuoteAsset();
        MockQuoteAsset feeB = new MockQuoteAsset();
        MockLPPosition pos = new MockLPPosition(feeA, feeB);
        uint256 tid = pos.mint(address(locker));
        locker.deposit(address(pos), tid);

        vm.warp(unlock + 1 days);
        vm.prank(attacker);
        vm.expectRevert(LaunchLocker.NotCreator.selector);
        locker.withdrawPrincipal();
    }

    /// @notice Attack: Attacker attempts to re-enter deposit on a locker with an active position.
    /// @dev Result: Reverts with AlreadyHasPosition.
    function test_adversarial_locker_deposit_reentry_blocked() public {
        LaunchLocker locker = new LaunchLocker(
            creator,
            LaunchCertificate.LockMode.Abyssal,
            LaunchCertificate.LpFeeMode.CreatorClaimable,
            type(uint256).max
        );
        MockQuoteAsset feeA = new MockQuoteAsset();
        MockQuoteAsset feeB = new MockQuoteAsset();
        MockLPPosition pos = new MockLPPosition(feeA, feeB);
        uint256 tid = pos.mint(address(locker));
        locker.deposit(address(pos), tid);

        vm.expectRevert(LaunchLocker.AlreadyHasPosition.selector);
        locker.deposit(address(pos), tid);
    }

    /// @notice Attack: Attacker attempts to call collectFees on DeadCompounded locker.
    /// @dev Result: Reverts with FeesAreDeadCompounded.
    function test_adversarial_locker_compounded_fee_collection_blocked() public {
        LaunchLocker locker = new LaunchLocker(
            creator,
            LaunchCertificate.LockMode.Abyssal,
            LaunchCertificate.LpFeeMode.DeadCompounded,
            type(uint256).max
        );

        vm.prank(attacker);
        vm.expectRevert(LaunchLocker.FeesAreDeadCompounded.selector);
        locker.collectFees();
    }

    // =====================================================================
    // 4. Callback Abuse & Reentrancy
    // =====================================================================

    /// @notice Attack: Attacker tries to call hook callbacks directly.
    /// @dev Result: Reverts with NotPoolManager.
    function test_adversarial_direct_callbacks_not_from_pm_revert() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 0, 0);

        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: false,
            amountSpecified: -100,
            sqrtPriceLimitX96: 0
        });

        vm.prank(attacker);
        vm.expectRevert(TCHook.NotPoolManager.selector);
        env.hook.beforeSwap(attacker, env.key, params, "");

        vm.prank(attacker);
        vm.expectRevert(TCHook.NotPoolManager.selector);
        env.hook.afterSwap(attacker, env.key, params, toBalanceDelta(-100, 100), "");
    }

    /// @notice Attack: Attacker tries to deploy TCHook at an unmined address.
    /// @dev Result: Reverts with Hooks.HookAddressNotValid.
    function test_adversarial_unmined_hook_deployment_reverts() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                Hooks.HookAddressNotValid.selector,
                vm.computeCreateAddress(address(this), vm.getNonce(address(this)))
            )
        );
        new TCHook(POOL_MANAGER, treasury, false, GATE_THRESHOLD, 0, 0);
    }

    /// @notice Attack: Attacker calls recordSwap on TCCore directly.
    /// @dev Result: Reverts with TCCore.NotReporter.
    function test_adversarial_unauthorized_record_swap_on_core_reverts() public {
        AdversarialPoolEnv memory env = _setupAdversarialPool(false, GATE_THRESHOLD, 0, 0);

        vm.prank(attacker);
        vm.expectRevert(TCCore.NotReporter.selector);
        env.core.recordSwap(100e18);
    }
}
