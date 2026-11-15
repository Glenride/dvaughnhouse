// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolModifyLiquidityTest} from "@uniswap/v4-core/src/test/PoolModifyLiquidityTest.sol";

import {DistributionFactory} from "../src/DistributionFactory.sol";
import {HookCertificateFactory} from "../src/HookCertificateFactory.sol";
import {LaunchParams, LaunchResult} from "../src/LaunchTypes.sol";
import {LaunchToken} from "../src/LaunchToken.sol";
import {LaunchCertificate} from "../src/LaunchCertificate.sol";
import {LaunchLocker} from "../src/LaunchLocker.sol";
import {TCHook} from "../src/TCHook.sol";
import {TCCore} from "../src/TCCore.sol";
import {HookMiner} from "../src/HookMiner.sol";
import {TC_HOOK_FLAGS, BASE_SEPOLIA_POOL_MANAGER} from "../src/PearlsConstants.sol";
import {ForkTestERC20} from "./TCHook.t.sol";
import {MockLPPosition} from "./Mocks.sol";

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
}

interface IUniversalRouter {
    function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable;
}

interface IPermit2 {
    function approve(address token, address spender, uint160 amount, uint48 expiration) external;
}

/// @title TerminalAndOpsConsoleForkTest
/// @notice End-to-end Base Sepolia fork verification (pinned to block 49,250,000)
///         for Trading Terminal (Work Order 2026-11-02 Task 2) and
///         Back-Office Ops Console (Work Order 2026-11-02 Task 2), using the
///         Part 1 (DistributionFactory) + Part 2 (HookCertificateFactory) split
///         and TCHook / TCCore contracts.
contract TerminalAndOpsConsoleForkTest is Test {
    IV4Quoter constant QUOTER = IV4Quoter(0x4A6513c898fe1B2d0E78d3b0e0A4a151589B1cBa);
    IUniversalRouter constant UNIVERSAL_ROUTER = IUniversalRouter(0x8702463e73f74d0b6765aBceb314Ef07aCb92650);
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    IPoolManager constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);
    PoolModifyLiquidityTest constant MODIFY_LIQUIDITY_ROUTER =
        PoolModifyLiquidityTest(0x37429cD17Cb1454C34E7F50b09725202Fd533039);

    uint256 constant FORK_BLOCK = 49_250_000;
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336;
    uint24 constant POOL_FEE = 0;
    int24 constant TICK_SPACING = 60;
    uint256 constant GATE_THRESHOLD = 10_000e18;

    address treasury = makeAddr("treasury");
    address creator = makeAddr("creator");
    address team = makeAddr("team");
    address liquidity = makeAddr("liquidity");
    address trader = makeAddr("trader");
    address staff = makeAddr("staff");

    struct UniversalRouterExactInputSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 amountIn;
        uint128 amountOutMinimum;
        uint256 minHopPriceX36;
        bytes hookData;
    }

    function setUp() public {
        string memory rpc = vm.envOr("BASE_SEPOLIA_RPC_URL", string("https://sepolia.base.org"));
        vm.createSelectFork(rpc, FORK_BLOCK);
        vm.deal(address(this), 100 ether);
    }

    function _executeUniversalRouterExactIn(PoolKey memory key, bool zeroForOne, uint128 amountIn) internal {
        Currency inputCurrency = zeroForOne ? key.currency0 : key.currency1;
        Currency outputCurrency = zeroForOne ? key.currency1 : key.currency0;

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
        params[1] = abi.encode(inputCurrency, uint256(amountIn), true);
        params[2] = abi.encode(outputCurrency, uint256(0));

        bytes memory commands = abi.encodePacked(uint8(0x10));
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(actions, params);

        vm.prank(trader);
        UNIVERSAL_ROUTER.execute(commands, inputs, block.timestamp + 300);
    }

    /// @notice Trading Terminal Task 2:
    ///         - Test wallet connects, reads quote via v4 Quoter, signs Permit2, executes swap via UniversalRouter
    ///         - Pre-gate swap = 0 platform fee
    ///         - Crossing swap = 0 platform fee
    ///         - Post-gate swap = 30 bps in quote asset, 0 in launched token, 0 additional terminal fee
    ///         - Certificate link resolves to on-chain LaunchCertificate record
    function test_trading_terminal_fork_verification_at_block_49250000() public {
        assertEq(block.number, FORK_BLOCK, "Must be pinned to verification block 49,250,000");

        // 1. Deploy Part 1 (DistributionFactory) + Part 2 (HookCertificateFactory) and launch a test token
        DistributionFactory part1 = new DistributionFactory(treasury);
        HookCertificateFactory part2 = new HookCertificateFactory(treasury);
        ForkTestERC20 a = new ForkTestERC20("AssetA", "A");
        ForkTestERC20 b = new ForkTestERC20("AssetB", "B");
        (ForkTestERC20 token, ForkTestERC20 quote) = address(a) < address(b) ? (a, b) : (b, a);

        LaunchParams memory p;
        p.name = "Terminal Verification Token";
        p.symbol = "TVT";
        p.totalSupply = 1_000_000_000e18;
        p.creator = creator;
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
        p.liquidityAllocation = liquidity;
        p.quoteIsCurrency0 = false;

        part1.deploy(p);
        LaunchResult memory launchRes = part2.launch(part1, p);

        // Verify certificate resolution from terminal
        LaunchCertificate cert = part2.certificate();
        assertEq(cert.ownerOf(launchRes.certificateId), creator);
        LaunchCertificate.CertificateRecord memory rec = cert.recordOf(launchRes.certificateId);
        assertEq(rec.token, launchRes.token);
        assertEq(rec.creator, creator);
        assertEq(rec.quoteAsset, address(quote));
        assertEq(rec.volumeThresholdQuote, GATE_THRESHOLD);
        assertEq(uint8(rec.lockMode), uint8(LaunchCertificate.LockMode.Abyssal));

        // 2. Initialize canonical v4 pool with TCHook on Base Sepolia PoolManager
        bytes memory constructorArgs =
            abi.encode(POOL_MANAGER, treasury, false, GATE_THRESHOLD, uint256(0), uint256(0));
        (, bytes32 salt) =
            HookMiner.find(address(this), TC_HOOK_FLAGS, type(TCHook).creationCode, constructorArgs);
        TCHook hook = new TCHook{salt: salt}(POOL_MANAGER, treasury, false, GATE_THRESHOLD, 0, 0);
        TCCore core = hook.core();

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(token)),
            currency1: Currency.wrap(address(quote)),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(hook))
        });
        POOL_MANAGER.initialize(key, SQRT_PRICE_1_1);

        token.mint(address(this), 50_000_000e18);
        quote.mint(address(this), 50_000_000e18);
        token.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        quote.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
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

        // Connect test wallet (trader), fund, and sign Permit2 approvals
        token.mint(trader, 10_000_000e18);
        quote.mint(trader, 10_000_000e18);
        vm.startPrank(trader);
        token.approve(PERMIT2, type(uint256).max);
        quote.approve(PERMIT2, type(uint256).max);
        IPermit2(PERMIT2).approve(address(token), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        IPermit2(PERMIT2).approve(address(quote), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        vm.stopPrank();

        // 3. Pre-gate quote & swap (8,000e18 quote in -> token out)
        (uint256 preGateQuotedOut,) = QUOTER.quoteExactInputSingle(
            IV4Quoter.QuoteExactSingleParams({poolKey: key, zeroForOne: false, exactAmount: 8_000e18, hookData: ""})
        );
        assertGt(preGateQuotedOut, 0, "Quoter must return valid quote on test pool");

        uint256 traderTokenBefore = token.balanceOf(trader);
        _executeUniversalRouterExactIn(key, false, 8_000e18);
        assertEq(token.balanceOf(trader) - traderTokenBefore, preGateQuotedOut, "Swap settles exact quoted amount");
        assertFalse(core.feeActive(), "Below gate: feeActive is false");
        assertEq(quote.balanceOf(treasury), 0, "Pre-gate swap shows 0 platform fee");
        assertEq(token.balanceOf(treasury), 0, "0 fee in launched token");

        // 4. Crossing swap (4,000e18 quote in -> crosses 10,000e18 gate to 12,000e18)
        _executeUniversalRouterExactIn(key, false, 4_000e18);
        assertTrue(core.feeActive(), "Crossing swap activates feeActive for subsequent swaps");
        assertEq(quote.balanceOf(treasury), 0, "Crossing swap shows 0 platform fee");
        assertEq(token.balanceOf(treasury), 0, "0 fee in launched token");

        // 5. Post-gate swap (1,000e18 quote in -> 30 bps = 3e18 quote fee to treasury)
        _executeUniversalRouterExactIn(key, false, 1_000e18);
        assertEq(quote.balanceOf(treasury), 3e18, "Post-gate swap pays 30 bps (3e18) in quote asset");
        assertEq(token.balanceOf(treasury), 0, "Post-gate swap pays 0 in launched token");
    }

    /// @notice Ops Console Task 2:
    ///         - Launch Monitoring reads both Abyssal and Timed LaunchLocker states
    ///         - Certificate Issuance surfaces LaunchCertificate token ID and field values (0 staff minting)
    ///         - Treasury-Fee Accounting reconciles strictly to on-chain receipts:
    ///           30 bps post-gate quote fee + 0.0194 ETH AirdropDistributor campaign fee, and nothing else
    function test_ops_console_fork_verification_at_block_49250000() public {
        assertEq(block.number, FORK_BLOCK, "Must be pinned to verification block 49,250,000");

        HookCertificateFactory part2 = new HookCertificateFactory(treasury);
        ForkTestERC20 a = new ForkTestERC20("AssetA", "A");
        ForkTestERC20 b = new ForkTestERC20("AssetB", "B");
        (ForkTestERC20 token, ForkTestERC20 quote) = address(a) < address(b) ? (a, b) : (b, a);

        // 1. Launch #1: Abyssal lock + Airdrop campaign (0.0194 ETH fee) via Part 1 + Part 2
        LaunchParams memory pAbyssal;
        pAbyssal.name = "Abyssal Launch";
        pAbyssal.symbol = "ABY";
        pAbyssal.totalSupply = 1_000_000_000e18;
        pAbyssal.creator = creator;
        pAbyssal.quoteAsset = address(quote);
        pAbyssal.poolFeeTier = 3000;
        pAbyssal.volumeThresholdQuote = GATE_THRESHOLD;
        pAbyssal.usdGate = 10_000_000e6;
        pAbyssal.lockMode = LaunchCertificate.LockMode.Abyssal;
        pAbyssal.lockDurationSeconds = 0;
        pAbyssal.lpFeeMode = LaunchCertificate.LpFeeMode.CreatorClaimable;
        pAbyssal.vestingBps = 1000;
        pAbyssal.airdropBps = 500;
        pAbyssal.liquidityBps = 8500;
        pAbyssal.vestingBeneficiary = team;
        pAbyssal.vestingCliffSeconds = 30 days;
        pAbyssal.vestingDurationSeconds = 365 days;
        pAbyssal.airdropMerkleRoot = bytes32(uint256(0xCAFE));
        pAbyssal.liquidityAllocation = liquidity;
        pAbyssal.quoteIsCurrency0 = false;

        DistributionFactory part1Abyssal = new DistributionFactory(treasury);
        part1Abyssal.deploy{value: 0.0194 ether}(pAbyssal);
        LaunchResult memory resAbyssal = part2.launch(part1Abyssal, pAbyssal);

        // 2. Launch #2: Timed lock (180 days floor) via Part 1 + Part 2
        LaunchParams memory pTimed = pAbyssal;
        pTimed.name = "Timed Launch";
        pTimed.symbol = "TMD";
        pTimed.lockMode = LaunchCertificate.LockMode.Timed;
        pTimed.lockDurationSeconds = 180 days;
        pTimed.airdropBps = 0;
        pTimed.liquidityBps = 9000;
        pTimed.airdropMerkleRoot = bytes32(0);

        DistributionFactory part1Timed = new DistributionFactory(treasury);
        part1Timed.deploy(pTimed);
        LaunchResult memory resTimed = part2.launch(part1Timed, pTimed);

        // Verify Module 3: Launch Monitoring (Abyssal & Timed LaunchLocker states)
        LaunchLocker abyssalLocker = LaunchLocker(resAbyssal.locker);
        assertEq(uint8(abyssalLocker.lockMode()), uint8(LaunchCertificate.LockMode.Abyssal));
        assertEq(abyssalLocker.unlockTime(), type(uint256).max);
        vm.prank(creator);
        vm.expectRevert(LaunchLocker.AbyssalNeverUnlocks.selector);
        abyssalLocker.withdrawPrincipal();

        LaunchLocker timedLocker = LaunchLocker(resTimed.locker);
        MockLPPosition mockPos = new MockLPPosition(token, quote);
        uint256 posId = mockPos.mint(address(timedLocker));
        timedLocker.deposit(address(mockPos), posId);
        assertEq(uint8(timedLocker.lockMode()), uint8(LaunchCertificate.LockMode.Timed));
        assertEq(timedLocker.unlockTime(), block.timestamp + 180 days);
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(LaunchLocker.StillLocked.selector, block.timestamp + 180 days));
        timedLocker.withdrawPrincipal();

        // Verify Module 4: Certificate Issuance (read-only viewer, staff cannot mint)
        LaunchCertificate cert = part2.certificate();
        assertEq(resAbyssal.certificateId, 1);
        assertEq(resTimed.certificateId, 2);
        LaunchCertificate.CertificateRecord memory rec1 = cert.recordOf(1);
        assertEq(rec1.token, resAbyssal.token);
        assertEq(rec1.unlockTime, 0, "Abyssal certificate unlockTime == 0 (forever)");
        LaunchCertificate.CertificateRecord memory rec2 = cert.recordOf(2);
        assertEq(rec2.token, resTimed.token);
        assertEq(rec2.unlockTime, block.timestamp + 180 days);

        LaunchCertificate.CertificateRecord memory forgedRec;
        vm.prank(staff);
        vm.expectRevert(LaunchCertificate.NotFactory.selector);
        cert.mint(staff, forgedRec);

        // Verify Module 5: Treasury-Fee Accounting (strictly post-gate 30 bps quote fee + 0.0194 ETH airdrop fee)
        bytes memory constructorArgs =
            abi.encode(POOL_MANAGER, treasury, false, GATE_THRESHOLD, uint256(0), uint256(0));
        (, bytes32 salt) =
            HookMiner.find(address(this), TC_HOOK_FLAGS, type(TCHook).creationCode, constructorArgs);
        TCHook hook = new TCHook{salt: salt}(POOL_MANAGER, treasury, false, GATE_THRESHOLD, 0, 0);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(token)),
            currency1: Currency.wrap(address(quote)),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(hook))
        });
        POOL_MANAGER.initialize(key, SQRT_PRICE_1_1);

        token.mint(address(this), 50_000_000e18);
        quote.mint(address(this), 50_000_000e18);
        token.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
        quote.approve(address(MODIFY_LIQUIDITY_ROUTER), type(uint256).max);
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

        token.mint(trader, 10_000_000e18);
        quote.mint(trader, 10_000_000e18);
        vm.startPrank(trader);
        token.approve(PERMIT2, type(uint256).max);
        quote.approve(PERMIT2, type(uint256).max);
        IPermit2(PERMIT2).approve(address(token), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        IPermit2(PERMIT2).approve(address(quote), address(UNIVERSAL_ROUTER), type(uint160).max, type(uint48).max);
        vm.stopPrank();

        // Cross gate (11,000e18 quote in) -> 0 fee
        _executeUniversalRouterExactIn(key, false, 11_000e18);
        assertEq(quote.balanceOf(treasury), 0);

        // Post-gate swap (2,000e18 quote in) -> 30 bps = 6e18 quote fee
        _executeUniversalRouterExactIn(key, false, 2_000e18);

        // Treasury holds strictly the two on-chain fee streams and nothing else
        assertEq(treasury.balance, 0.0194 ether, "On-chain ETH receipt == 0.0194 ETH from AirdropDistributor");
        assertEq(quote.balanceOf(treasury), 6e18, "On-chain quote receipt == 30 bps post-gate swap fee");
        assertEq(token.balanceOf(treasury), 0, "Treasury holds 0 launched tokens");
    }
}
