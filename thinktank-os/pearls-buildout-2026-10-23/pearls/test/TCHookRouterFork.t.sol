// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolModifyLiquidityTest} from "@uniswap/v4-core/src/test/PoolModifyLiquidityTest.sol";

import {TCHook} from "../src/TCHook.sol";
import {TCCore} from "../src/TCCore.sol";
import {HookMiner} from "../src/HookMiner.sol";
import {TC_HOOK_FLAGS, BASE_SEPOLIA_POOL_MANAGER} from "../src/PearlsConstants.sol";
import {ForkTestERC20} from "./TCHook.t.sol";

interface IV4Quoter {
    struct QuoteExactSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 exactAmount;
        bytes hookData;
    }

    function quoteExactInputSingle(QuoteExactSingleParams memory params)
        external
        returns (uint256 amountOut, uint256 gasEstimate);

    function quoteExactOutputSingle(QuoteExactSingleParams memory params)
        external
        returns (uint256 amountIn, uint256 gasEstimate);
}

interface IUniversalRouter {
    function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable;
}

interface IPermit2 {
    function approve(address token, address spender, uint160 amount, uint48 expiration) external;
}

/// @notice Router-path fork test suite: proves quotability and swap execution
///         through official Uniswap v4 Quoter and Universal Router on Base Sepolia.
contract TCHookRouterForkTest is Test {
    IV4Quoter constant QUOTER = IV4Quoter(0x4A6513c898fe1B2d0E78d3b0e0A4a151589B1cBa);
    IUniversalRouter constant UNIVERSAL_ROUTER = IUniversalRouter(0x8702463e73f74d0b6765aBceb314Ef07aCb92650);
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    IPoolManager constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);
    PoolModifyLiquidityTest constant MODIFY_LIQUIDITY_ROUTER =
        PoolModifyLiquidityTest(0x37429cD17Cb1454C34E7F50b09725202Fd533039);

    uint256 constant FORK_BLOCK = 49_250_000;
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336; // 1:1 price
    uint24 constant POOL_FEE = 0; // 0 LP fee to isolate hook fee
    int24 constant TICK_SPACING = 60;
    uint256 constant GATE_THRESHOLD = 10_000e18;

    address treasury = makeAddr("treasury");
    address trader = makeAddr("trader");

    struct UniversalRouterExactInputSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 amountIn;
        uint128 amountOutMinimum;
        uint256 minHopPriceX36;
        bytes hookData;
    }

    struct UniversalRouterExactOutputSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 amountOut;
        uint128 amountInMaximum;
        uint256 minHopPriceX36;
        bytes hookData;
    }

    struct RouterPoolEnv {
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

    function _setupPool(
        bool quoteIsCurrency0,
        uint256 threshold,
        uint256 maxSwapQuote,
        uint256 maxSwapBlocks
    ) internal returns (RouterPoolEnv memory env) {
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

        // Seed liquidity
        low.mint(address(this), 50_000_000e18);
        high.mint(address(this), 50_000_000e18);
        low.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        high.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);

        MODIFY_LIQUIDITY_ROUTER.modifyLiquidity(
            env.key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 10_000_000e18,
                salt: bytes32(0)
            }),
            ""
        );

        // Fund trader and set approvals
        env.token.mint(trader, 20_000_000e18);
        env.quote.mint(trader, 20_000_000e18);

        vm.startPrank(trader);
        env.token.approve(PERMIT2, type(uint256).max);
        env.quote.approve(PERMIT2, type(uint256).max);
        IPermit2(PERMIT2).approve(address(env.token), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        IPermit2(PERMIT2).approve(address(env.quote), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        vm.stopPrank();
    }

    function _setupVanillaPool(
        ForkTestERC20 low,
        ForkTestERC20 high,
        uint24 feeTier,
        int24 tickSpacing
    ) internal returns (PoolKey memory key) {
        key = PoolKey({
            currency0: Currency.wrap(address(low)),
            currency1: Currency.wrap(address(high)),
            fee: feeTier,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0))
        });
        POOL_MANAGER.initialize(key, SQRT_PRICE_1_1);

        low.mint(address(this), 50_000_000e18);
        high.mint(address(this), 50_000_000e18);
        low.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        high.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);

        MODIFY_LIQUIDITY_ROUTER.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -600,
                tickUpper: 600,
                liquidityDelta: 10_000_000e18,
                salt: bytes32(0)
            }),
            ""
        );
    }

    function _quoteExactIn(PoolKey memory key, bool zeroForOne, uint128 amountIn) internal returns (uint256) {
        (uint256 amountOut,) = QUOTER.quoteExactInputSingle(
            IV4Quoter.QuoteExactSingleParams({
                poolKey: key,
                zeroForOne: zeroForOne,
                exactAmount: amountIn,
                hookData: ""
            })
        );
        return amountOut;
    }

    function _quoteExactOut(PoolKey memory key, bool zeroForOne, uint128 amountOut) internal returns (uint256) {
        (uint256 amountIn,) = QUOTER.quoteExactOutputSingle(
            IV4Quoter.QuoteExactSingleParams({
                poolKey: key,
                zeroForOne: zeroForOne,
                exactAmount: amountOut,
                hookData: ""
            })
        );
        return amountIn;
    }

    function _swapExactInRouter(PoolKey memory key, bool zeroForOne, uint128 amountIn) internal returns (uint256 outReceived) {
        Currency inCurrency = zeroForOne ? key.currency0 : key.currency1;
        Currency outCurrency = zeroForOne ? key.currency1 : key.currency0;
        IERC20 outToken = IERC20(Currency.unwrap(outCurrency));
        uint256 balanceBefore = outToken.balanceOf(trader);

        bytes memory actions = abi.encodePacked(uint8(0x06), uint8(0x0c), uint8(0x0f));
        bytes[] memory params = new bytes[](3);
        params[0] = abi.encode(
            UniversalRouterExactInputSingleParams({
                poolKey: key,
                zeroForOne: zeroForOne,
                amountIn: amountIn,
                amountOutMinimum: 0,
                minHopPriceX36: 0,
                hookData: ""
            })
        );
        params[1] = abi.encode(inCurrency, uint256(amountIn));
        params[2] = abi.encode(outCurrency, uint256(0));

        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(actions, params);

        vm.prank(trader);
        UNIVERSAL_ROUTER.execute(hex"10", inputs, block.timestamp + 60);

        outReceived = outToken.balanceOf(trader) - balanceBefore;
    }

    function _swapExactOutRouter(PoolKey memory key, bool zeroForOne, uint128 amountOut) internal returns (uint256 inSpent) {
        Currency inCurrency = zeroForOne ? key.currency0 : key.currency1;
        Currency outCurrency = zeroForOne ? key.currency1 : key.currency0;
        IERC20 inToken = IERC20(Currency.unwrap(inCurrency));
        uint256 balanceBefore = inToken.balanceOf(trader);

        bytes memory actions = abi.encodePacked(uint8(0x08), uint8(0x0c), uint8(0x0f));
        bytes[] memory params = new bytes[](3);
        params[0] = abi.encode(
            UniversalRouterExactOutputSingleParams({
                poolKey: key,
                zeroForOne: zeroForOne,
                amountOut: amountOut,
                amountInMaximum: type(uint128).max,
                minHopPriceX36: 0,
                hookData: ""
            })
        );
        params[1] = abi.encode(inCurrency, uint256(type(uint128).max));
        params[2] = abi.encode(outCurrency, uint256(amountOut));

        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(actions, params);

        vm.prank(trader);
        UNIVERSAL_ROUTER.execute(hex"10", inputs, block.timestamp + 60);

        inSpent = balanceBefore - inToken.balanceOf(trader);
    }

    // ---------------------------------------------------------------------
    // Item 1: Router Matrix — Case 1: Buy exact-in (quote -> token)
    // ---------------------------------------------------------------------

    function test_fork_router_case1_buy_exact_in_pre_cross_and_post_gate() public {
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: 6,000 quote in -> 0 fee. Quoter matches router swap.
        uint128 quoteIn1 = 6_000e18;
        uint256 quotedOut1 = _quoteExactIn(env.key, false, quoteIn1);
        uint256 execOut1 = _swapExactInRouter(env.key, false, quoteIn1);
        assertEq(quotedOut1, execOut1, "Case 1 pre-gate: quote must equal executed output");
        assertFalse(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0, "0 fee pre-gate");

        // 2. Gate-crossing swap: 5,000 quote in (cum = 11,000 >= 10,000). Crossing swap fee-free.
        uint128 quoteIn2 = 5_000e18;
        uint256 quotedOut2 = _quoteExactIn(env.key, false, quoteIn2);
        uint256 execOut2 = _swapExactInRouter(env.key, false, quoteIn2);
        assertEq(quotedOut2, execOut2, "Case 1 crossing: quote must equal executed output");
        assertTrue(env.core.feeActive(), "gate flipped active");
        assertEq(env.quote.balanceOf(treasury), 0, "crossing swap fee-free");

        // 3. Post-gate swap: 1,000 quote in -> 30 bps (3e18) quote fee to treasury.
        uint128 quoteIn3 = 1_000e18;
        uint256 quotedOut3 = _quoteExactIn(env.key, false, quoteIn3);
        uint256 treasuryBefore = env.quote.balanceOf(treasury);
        uint256 execOut3 = _swapExactInRouter(env.key, false, quoteIn3);
        assertEq(quotedOut3, execOut3, "Case 1 post-gate: quote must equal executed output");
        uint256 feePaid = env.quote.balanceOf(treasury) - treasuryBefore;
        assertEq(feePaid, (uint256(quoteIn3) * 30) / 10_000, "exact 30 bps fee paid to treasury");
        assertEq(env.token.balanceOf(treasury), 0, "never takes launched token");
    }

    // ---------------------------------------------------------------------
    // Item 1: Router Matrix — Case 2: Sell exact-in (token -> quote)
    // ---------------------------------------------------------------------

    function test_fork_router_case2_sell_exact_in_pre_cross_and_post_gate() public {
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate swap: sell 6,000 token in
        uint128 tokenIn1 = 6_000e18;
        uint256 quotedOut1 = _quoteExactIn(env.key, true, tokenIn1);
        uint256 execOut1 = _swapExactInRouter(env.key, true, tokenIn1);
        assertEq(quotedOut1, execOut1, "Case 2 pre-gate: quote must equal executed output");
        assertFalse(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 2. Crossing swap: sell 5,000 token in
        uint128 tokenIn2 = 5_000e18;
        uint256 quotedOut2 = _quoteExactIn(env.key, true, tokenIn2);
        uint256 execOut2 = _swapExactInRouter(env.key, true, tokenIn2);
        assertEq(quotedOut2, execOut2, "Case 2 crossing: quote must equal executed output");
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 3. Post-gate swap: sell 1,000 token in -> 30 bps on quote output deducted
        uint128 tokenIn3 = 1_000e18;
        uint256 quotedOut3 = _quoteExactIn(env.key, true, tokenIn3);
        uint256 treasuryBefore = env.quote.balanceOf(treasury);
        uint256 execOut3 = _swapExactInRouter(env.key, true, tokenIn3);
        assertEq(quotedOut3, execOut3, "Case 2 post-gate: quote must equal executed output");
        uint256 feePaid = env.quote.balanceOf(treasury) - treasuryBefore;
        assertTrue(feePaid > 0, "treasury received fee");
        assertEq(env.token.balanceOf(treasury), 0);
    }

    // ---------------------------------------------------------------------
    // Item 1: Router Matrix — Case 3: Buy exact-out (quote in for exact token out)
    // ---------------------------------------------------------------------

    function test_fork_router_case3_buy_exact_out_pre_cross_and_post_gate() public {
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate: buy 5,000 token out
        uint128 tokenOut1 = 5_000e18;
        uint256 quotedIn1 = _quoteExactOut(env.key, false, tokenOut1);
        uint256 execIn1 = _swapExactOutRouter(env.key, false, tokenOut1);
        assertEq(quotedIn1, execIn1, "Case 3 pre-gate: quote must equal executed input");
        assertFalse(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 2. Crossing: buy 6,000 token out
        uint128 tokenOut2 = 6_000e18;
        uint256 quotedIn2 = _quoteExactOut(env.key, false, tokenOut2);
        uint256 execIn2 = _swapExactOutRouter(env.key, false, tokenOut2);
        assertEq(quotedIn2, execIn2, "Case 3 crossing: quote must equal executed input");
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 3. Post-gate: buy 1,000 token out -> fee added to quote in
        uint128 tokenOut3 = 1_000e18;
        uint256 quotedIn3 = _quoteExactOut(env.key, false, tokenOut3);
        uint256 treasuryBefore = env.quote.balanceOf(treasury);
        uint256 execIn3 = _swapExactOutRouter(env.key, false, tokenOut3);
        assertEq(quotedIn3, execIn3, "Case 3 post-gate: quote must equal executed input");
        uint256 feePaid = env.quote.balanceOf(treasury) - treasuryBefore;
        assertTrue(feePaid > 0, "post-gate exact-out collected quote fee");
        assertEq(env.token.balanceOf(treasury), 0);
    }

    // ---------------------------------------------------------------------
    // Item 1: Router Matrix — Case 4: Sell exact-out (token in for exact quote out)
    // ---------------------------------------------------------------------

    function test_fork_router_case4_sell_exact_out_pre_cross_and_post_gate() public {
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, 0, 0);

        // 1. Pre-gate: exact 5,000 quote out
        uint128 quoteOut1 = 5_000e18;
        uint256 quotedIn1 = _quoteExactOut(env.key, true, quoteOut1);
        uint256 execIn1 = _swapExactOutRouter(env.key, true, quoteOut1);
        assertEq(quotedIn1, execIn1, "Case 4 pre-gate: quote must equal executed input");
        assertFalse(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 2. Crossing: exact 6,000 quote out
        uint128 quoteOut2 = 6_000e18;
        uint256 quotedIn2 = _quoteExactOut(env.key, true, quoteOut2);
        uint256 execIn2 = _swapExactOutRouter(env.key, true, quoteOut2);
        assertEq(quotedIn2, execIn2, "Case 4 crossing: quote must equal executed input");
        assertTrue(env.core.feeActive());
        assertEq(env.quote.balanceOf(treasury), 0);

        // 3. Post-gate: exact 1,000 quote out
        uint128 quoteOut3 = 1_000e18;
        uint256 quotedIn3 = _quoteExactOut(env.key, true, quoteOut3);
        uint256 treasuryBefore = env.quote.balanceOf(treasury);
        uint256 execIn3 = _swapExactOutRouter(env.key, true, quoteOut3);
        assertEq(quotedIn3, execIn3, "Case 4 post-gate: quote must equal executed input");
        uint256 feePaid = env.quote.balanceOf(treasury) - treasuryBefore;
        assertEq(feePaid, (uint256(quoteOut3) * 30) / 10_000, "Case 4 post-gate: 30 bps fee on quote");
        assertEq(env.token.balanceOf(treasury), 0);
    }

    // ---------------------------------------------------------------------
    // Item 1: Quote is Currency 0 across all 4 directions on Router
    // ---------------------------------------------------------------------

    function test_fork_router_all_four_directions_when_quote_is_currency0() public {
        RouterPoolEnv memory env = _setupPool(true, GATE_THRESHOLD, 0, 0);

        // Case 1: Buy exact-in (quote=c0 in, token=c1 out => zeroForOne = true)
        uint256 q1 = _quoteExactIn(env.key, true, 2_000e18);
        uint256 e1 = _swapExactInRouter(env.key, true, 2_000e18);
        assertEq(q1, e1);

        // Case 2: Sell exact-in (token=c1 in, quote=c0 out => zeroForOne = false)
        uint256 q2 = _quoteExactIn(env.key, false, 2_000e18);
        uint256 e2 = _swapExactInRouter(env.key, false, 2_000e18);
        assertEq(q2, e2);

        // Case 3: Buy exact-out (exact token=c1 out, quote=c0 in => zeroForOne = true)
        uint256 q3 = _quoteExactOut(env.key, true, 1_000e18);
        uint256 e3 = _swapExactOutRouter(env.key, true, 1_000e18);
        assertEq(q3, e3);

        // Case 4: Sell exact-out (exact quote=c0 out, token=c1 in => zeroForOne = false)
        uint256 q4 = _quoteExactOut(env.key, false, 1_000e18);
        uint256 e4 = _swapExactOutRouter(env.key, false, 1_000e18);
        assertEq(q4, e4);

        assertEq(env.quote.balanceOf(treasury), 0, "pre-gate fee is 0");
    }

    // ---------------------------------------------------------------------
    // Item 2: Guard Window Routing Behavior
    // ---------------------------------------------------------------------

    function test_fork_router_guard_window_under_cap_succeeds_and_over_cap_reverts() public {
        uint256 maxSwap = 100e18; // 100 quote units max swap
        uint256 guardBlocks = 10;
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, maxSwap, guardBlocks);

        // 1. Swap at/under cap (50 quote in) quotes cleanly and executes via Universal Router
        uint128 underCapAmount = 50e18;
        uint256 quotedOut = _quoteExactIn(env.key, false, underCapAmount);
        uint256 execOut = _swapExactInRouter(env.key, false, underCapAmount);
        assertEq(quotedOut, execOut, "under-cap swap quotes and executes without error");

        // 2. Oversize swap (200 quote in) causes Quoter and Universal Router to revert by design
        uint128 overCapAmount = 200e18;
        vm.expectRevert();
        QUOTER.quoteExactInputSingle(
            IV4Quoter.QuoteExactSingleParams({
                poolKey: env.key,
                zeroForOne: false,
                exactAmount: overCapAmount,
                hookData: ""
            })
        );

        bytes memory actions = abi.encodePacked(uint8(0x06), uint8(0x0c), uint8(0x0f));
        bytes[] memory params = new bytes[](3);
        params[0] = abi.encode(
            UniversalRouterExactInputSingleParams({
                poolKey: env.key,
                zeroForOne: false,
                amountIn: overCapAmount,
                amountOutMinimum: 0,
                minHopPriceX36: 0,
                hookData: ""
            })
        );
        params[1] = abi.encode(env.key.currency1, uint256(overCapAmount));
        params[2] = abi.encode(env.key.currency0, uint256(0));
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(actions, params);

        vm.prank(trader);
        vm.expectRevert();
        UNIVERSAL_ROUTER.execute(hex"10", inputs, block.timestamp + 60);

        // 3. Roll past guard window: oversize swap quotes and executes cleanly!
        vm.roll(block.number + guardBlocks + 1);
        uint256 postGuardQuoted = _quoteExactIn(env.key, false, overCapAmount);
        uint256 postGuardExec = _swapExactInRouter(env.key, false, overCapAmount);
        assertEq(postGuardQuoted, postGuardExec, "post-guard oversize swap succeeds");
    }

    // ---------------------------------------------------------------------
    // Item 3: Quote-Competitiveness Benchmark
    // ---------------------------------------------------------------------

    function test_fork_benchmark_pearls_vs_vanilla_pre_and_post_gate() public {
        RouterPoolEnv memory env = _setupPool(false, GATE_THRESHOLD, 0, 0);

        // Setup identical vanilla pool (same assets, fee tier 0, same tick bounds and liquidity)
        ForkTestERC20 low = ForkTestERC20(Currency.unwrap(env.key.currency0));
        ForkTestERC20 high = ForkTestERC20(Currency.unwrap(env.key.currency1));
        PoolKey memory vanillaKey = _setupVanillaPool(low, high, POOL_FEE, TICK_SPACING);

        uint128[3] memory sizes = [uint128(100e18), uint128(1_000e18), uint128(10_000e18)];

        emit log("=== PRE-GATE BENCHMARK (Pearls vs Vanilla) ===");
        for (uint256 i = 0; i < sizes.length; i++) {
            uint128 amountIn = sizes[i];
            uint256 pearlsOut = _quoteExactIn(env.key, false, amountIn);
            uint256 vanillaOut = _quoteExactIn(vanillaKey, false, amountIn);
            assertEq(pearlsOut, vanillaOut, "Pre-gate parity: Pearls quote must equal Vanilla quote");
            emit log_named_uint("Swap Size USD", amountIn / 1e18);
            emit log_named_uint("Pearls Out (raw)", pearlsOut);
            emit log_named_uint("Vanilla Out (raw)", vanillaOut);
            emit log_named_uint("Pre-gate Diff (bps)", 0);
        }

        // Setup dedicated post-gate Pearls pool at price 1:1 (threshold = 1 with 1 wei crossing swap)
        RouterPoolEnv memory postGateEnv = _setupPool(false, 1, 0, 0);
        _swapExactInRouter(postGateEnv.key, false, 1);
        assertTrue(postGateEnv.core.feeActive(), "gate must be active");

        emit log("=== POST-GATE BENCHMARK (Pearls vs Vanilla) ===");
        for (uint256 i = 0; i < sizes.length; i++) {
            uint128 amountIn = sizes[i];
            uint256 pearlsOut = _quoteExactIn(postGateEnv.key, false, amountIn);

            // On vanilla, with exact 30 bps fee applied to quote input:
            uint128 netVanillaIn = amountIn - uint128((uint256(amountIn) * 30) / 10_000);
            uint256 vanillaEquivalentOut = _quoteExactIn(vanillaKey, false, netVanillaIn);
            assertEq(pearlsOut, vanillaEquivalentOut, "Post-gate: Pearls quote must match net 30 bps vanilla quote");

            uint256 vanillaGrossOut = _quoteExactIn(vanillaKey, false, amountIn);
            uint256 diffBps = ((vanillaGrossOut - pearlsOut) * 10_000) / vanillaGrossOut;
            emit log_named_uint("Swap Size USD", amountIn / 1e18);
            emit log_named_uint("Pearls Out (raw)", pearlsOut);
            emit log_named_uint("Vanilla Gross Out (raw)", vanillaGrossOut);
            emit log_named_uint("Exact Diff (bps)", diffBps);
        }
    }
}
