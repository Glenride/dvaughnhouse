// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {DistributionFactory} from "../src/DistributionFactory.sol";
import {HookCertificateFactory} from "../src/HookCertificateFactory.sol";
import {
    LaunchParams,
    LaunchResult,
    WrongLaunchValue,
    BadBpsSplit,
    TimedLockTooShort,
    AbyssalMustHaveNoDuration,
    AirdropNeedsRoot,
    InvalidPoolFeeTier
} from "../src/LaunchTypes.sol";
import {LaunchValidation} from "../src/LaunchValidation.sol";
import {LaunchToken} from "../src/LaunchToken.sol";
import {LaunchCertificate} from "../src/LaunchCertificate.sol";
import {LaunchLocker} from "../src/LaunchLocker.sol";
import {VestingVault} from "../src/VestingVault.sol";
import {AirdropDistributor} from "../src/AirdropDistributor.sol";
import {TCCore} from "../src/TCCore.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {MockQuoteAsset, MockLPPosition} from "./Mocks.sol";
import {LegacyLaunchFactory} from "./LegacyLaunchFactory.sol";

/// @notice Core suite: factory launches, distribution, certificate, token
///         guard, locker, vesting, airdrop distributor.
///
///         The launch under test is the SPLIT two-step flow: a fresh
///         DistributionFactory (Part 1) deploys the distribution modules,
///         then the shared HookCertificateFactory (Part 2) deploys the
///         hook pair, distributes, and mints the certificate. The legacy
///         one-step factory is kept as `LegacyLaunchFactory` and used
///         only by the equivalence test at the bottom.
contract PearlsTest is Test {
    DistributionFactory part1;
    HookCertificateFactory part2;
    LegacyLaunchFactory legacy;
    TickSpacingHarness tickHarness;
    MockQuoteAsset quote;

    address treasury = makeAddr("treasury");
    address creator = makeAddr("creator");
    address team = makeAddr("team");
    address liquidity = makeAddr("liquidity");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant SUPPLY = 1_000_000_000e18; // 1B tokens
    uint256 constant THRESHOLD = 10_000_000e6; // $10M in 6-dec quote units
    bytes32 constant ROOT = bytes32(uint256(0xBEEF));

    function setUp() public {
        part2 = new HookCertificateFactory(treasury);
        tickHarness = new TickSpacingHarness();
        quote = new MockQuoteAsset();
        vm.deal(address(this), 100 ether);
    }

    function _baseParams() internal view returns (LaunchParams memory p) {
        p.name = "Pearl Test Token";
        p.symbol = "PTT";
        p.totalSupply = SUPPLY;
        p.creator = creator;
        p.quoteAsset = address(quote);
        p.poolFeeTier = 3000;
        p.volumeThresholdQuote = THRESHOLD;
        p.usdGate = 10_000_000e6;
        p.lockMode = LaunchCertificate.LockMode.Abyssal;
        p.lockDurationSeconds = 0;
        p.lpFeeMode = LaunchCertificate.LpFeeMode.CreatorClaimable;
        p.vestingBps = 1000; // 10%
        p.airdropBps = 500; // 5%
        p.liquidityBps = 8500; // 85%
        p.vestingBeneficiary = team;
        p.vestingCliffSeconds = 30 days;
        p.vestingDurationSeconds = 365 days;
        p.airdropMerkleRoot = ROOT;
        p.liquidityAllocation = liquidity;
        p.quoteIsCurrency0 = false;
        p.walletCapAmount = 0;
        p.walletCapBlocks = 0;
        p.maxSwapQuoteAmount = 0;
        p.maxSwapBlocks = 0;
    }

    /// @notice The split launch: fresh Part 1 per call (deploy is
    ///         one-shot per factory), then Part 2 against it. `part1`
    ///         is left pointing at the Part 1 this launch used, so
    ///         tests can assert on it.
    function _launch(LaunchParams memory p, uint256 value) internal returns (LaunchResult memory) {
        part1 = new DistributionFactory(treasury);
        part1.deploy{value: value}(p);
        return part2.launch(part1, p);
    }

    /// @notice The legacy one-step launch, for the equivalence test only.
    function _launchLegacy(LaunchParams memory p, uint256 value) internal returns (LaunchResult memory) {
        legacy = new LegacyLaunchFactory(treasury);
        return legacy.launch{value: value}(p);
    }

    // ---------------------------------------------------------------------
    // Factory + distribution + certificate
    // ---------------------------------------------------------------------

    function test_launch_full_distribution_and_balances() public {
        LaunchParams memory p = _baseParams();
        LaunchResult memory r = _launch(p, 0.0194 ether);

        LaunchToken token = LaunchToken(r.token);
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(liquidity), (SUPPLY * 85) / 100);
        assertEq(token.balanceOf(r.vestingVault), (SUPPLY * 10) / 100);
        assertEq(token.balanceOf(r.airdropDistributor), (SUPPLY * 5) / 100);
        assertEq(token.balanceOf(address(part1)), 0, "part1 must distribute everything");
        // Airdrop fee reached the treasury.
        assertEq(treasury.balance, 0.0194 ether);
    }

    function test_launch_certificate_record_and_ownership() public {
        LaunchParams memory p = _baseParams();
        LaunchResult memory r = _launch(p, 0.0194 ether);

        LaunchCertificate cert = part2.certificate();
        assertEq(cert.ownerOf(r.certificateId), creator);
        LaunchCertificate.CertificateRecord memory rec = cert.recordOf(r.certificateId);
        assertEq(rec.token, r.token);
        assertEq(rec.creator, creator);
        assertEq(rec.totalSupply, SUPPLY);
        assertEq(rec.volumeThresholdQuote, THRESHOLD);
        assertEq(uint8(rec.lockMode), uint8(LaunchCertificate.LockMode.Abyssal));
        assertEq(rec.unlockTime, 0, "Abyssal renders as 0 = forever");
        assertEq(rec.locker, r.locker);
        assertEq(rec.vestingVault, r.vestingVault);
        assertEq(rec.airdropDistributor, r.airdropDistributor);
        assertEq(rec.hookCore, r.hookCore);
        assertEq(rec.vestingBps, 1000);
        assertEq(rec.liquidityBps, 8500);
    }

    function test_launch_pure_fair_no_modules() public {
        LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        LaunchResult memory r = _launch(p, 0);

        assertEq(r.vestingVault, address(0));
        assertEq(r.airdropDistributor, address(0));
        assertEq(LaunchToken(r.token).balanceOf(liquidity), SUPPLY);
        assertEq(treasury.balance, 0);
    }

    function test_launch_wrong_value_reverts() public {
        LaunchParams memory p = _baseParams();
        // The revert happens in Part 1's deploy, so the factory must
        // exist BEFORE expectRevert is set — otherwise the CREATE itself
        // consumes the expectation.
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(abi.encodeWithSelector(WrongLaunchValue.selector, 0, 0.0194 ether));
        fresh.deploy{value: 0}(p);
        // And: paying when no airdrop is configured also reverts.
        p.airdropBps = 0;
        p.liquidityBps = 9000;
        DistributionFactory fresh2 = new DistributionFactory(treasury);
        vm.expectRevert(abi.encodeWithSelector(WrongLaunchValue.selector, 0.0194 ether, 0));
        fresh2.deploy{value: 0.0194 ether}(p);
    }

    function test_launch_bad_bps_reverts() public {
        LaunchParams memory p = _baseParams();
        p.liquidityBps = 8000; // sums to 9500
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(abi.encodeWithSelector(BadBpsSplit.selector, 9500));
        fresh.deploy{value: 0.0194 ether}(p);
    }

    function test_launch_timed_lock_below_floor_reverts() public {
        LaunchParams memory p = _baseParams();
        p.lockMode = LaunchCertificate.LockMode.Timed;
        p.lockDurationSeconds = 179 days;
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(abi.encodeWithSelector(TimedLockTooShort.selector, 179 days, 180 days));
        fresh.deploy{value: 0.0194 ether}(p);
    }

    function test_launch_timed_lock_at_floor_ok_and_recorded() public {
        LaunchParams memory p = _baseParams();
        p.lockMode = LaunchCertificate.LockMode.Timed;
        p.lockDurationSeconds = 180 days;
        LaunchResult memory r = _launch(p, 0.0194 ether);
        LaunchCertificate.CertificateRecord memory rec = part2.certificate().recordOf(r.certificateId);
        assertEq(rec.unlockTime, block.timestamp + 180 days);
        assertEq(LaunchLocker(r.locker).unlockTime(), block.timestamp + 180 days);
    }

    function test_launch_abyssal_with_duration_reverts() public {
        LaunchParams memory p = _baseParams();
        p.lockDurationSeconds = 365 days;
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(AbyssalMustHaveNoDuration.selector);
        fresh.deploy{value: 0.0194 ether}(p);
    }

    function test_launch_airdrop_without_root_reverts() public {
        LaunchParams memory p = _baseParams();
        p.airdropMerkleRoot = bytes32(0);
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(AirdropNeedsRoot.selector);
        fresh.deploy{value: 0.0194 ether}(p);
    }

    function test_factory_hook_pair_wiring() public {
        LaunchParams memory p = _baseParams();
        LaunchResult memory r = _launch(p, 0.0194 ether);
        TCCore core = TCCore(r.hookCore);
        assertEq(core.poolReporter(), r.hook, "adapter must be the core's reporter");
        assertEq(core.treasury(), treasury);
        assertEq(core.volumeThresholdQuote(), THRESHOLD);
    }

    function test_certificate_mint_only_factory() public {
        LaunchCertificate cert = part2.certificate();
        LaunchCertificate.CertificateRecord memory rec;
        vm.prank(alice);
        vm.expectRevert(LaunchCertificate.NotFactory.selector);
        cert.mint(alice, rec);
    }

    function test_fee_tier_hygiene_and_validation() public {
        // Canonical tiers return expected canonical tick spacings
        assertEq(tickHarness.getTickSpacing(100), 1);
        assertEq(tickHarness.getTickSpacing(500), 10);
        assertEq(tickHarness.getTickSpacing(3000), 60);
        assertEq(tickHarness.getTickSpacing(10000), 200);

        // Invalid tiers revert
        vm.expectRevert(abi.encodeWithSelector(InvalidPoolFeeTier.selector, 0));
        tickHarness.getTickSpacing(0);

        vm.expectRevert(abi.encodeWithSelector(InvalidPoolFeeTier.selector, 2500));
        tickHarness.getTickSpacing(2500);

        // Launch with invalid fee tier reverts (in Part 1's deploy, so
        // the factory must exist before expectRevert is set).
        LaunchParams memory p = _baseParams();
        p.poolFeeTier = 2500;
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(abi.encodeWithSelector(InvalidPoolFeeTier.selector, 2500));
        fresh.deploy{value: 0.0194 ether}(p);

        // Launch with valid fee tier (500) succeeds and populates poolId
        p.poolFeeTier = 500;
        LaunchResult memory r = _launch(p, 0.0194 ether);
        assertTrue(PoolId.unwrap(r.poolId) != bytes32(0));
    }

    function test_single_canonical_pool_guarantee() public {
        LaunchParams memory p = _baseParams();
        p.poolFeeTier = 3000;
        LaunchResult memory r = _launch(p, 0.0194 ether);

        int24 expectedTickSpacing = tickHarness.getTickSpacing(3000);
        assertEq(expectedTickSpacing, 60);

        (Currency c0, Currency c1) = p.quoteIsCurrency0
            ? (Currency.wrap(p.quoteAsset), Currency.wrap(r.token))
            : (Currency.wrap(r.token), Currency.wrap(p.quoteAsset));

        PoolKey memory expectedKey = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(r.hook)
        });

        assertEq(PoolId.unwrap(r.poolId), PoolId.unwrap(expectedKey.toId()), "poolId must match canonical PoolKey");

        // Any attempt to create a different pool (e.g. different fee or different hook) has a different PoolId
        PoolKey memory nonCanonicalKey = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: 500,
            tickSpacing: 10,
            hooks: IHooks(r.hook)
        });
        assertTrue(PoolId.unwrap(r.poolId) != PoolId.unwrap(nonCanonicalKey.toId()), "alternate fee tier yields different poolId");
    }

    // ---------------------------------------------------------------------
    // LaunchToken wallet cap
    // ---------------------------------------------------------------------

    function test_token_cap_blocks_overbuy_during_window() public {
        LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        p.walletCapAmount = 1000e18;
        p.walletCapBlocks = 10;
        LaunchResult memory r = _launch(p, 0);
        LaunchToken token = LaunchToken(r.token);

        // Liquidity is exempt; it funds Alice below the cap (ok)...
        vm.prank(liquidity);
        token.transfer(alice, 600e18);
        // ...then Bob sends Alice over the cap (reverts).
        vm.prank(liquidity);
        token.transfer(bob, 600e18);
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(LaunchToken.WalletCapExceeded.selector, alice, 1200e18, 1000e18)
        );
        token.transfer(alice, 600e18);
    }

    function test_token_cap_expires_after_window() public {
        LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        p.walletCapAmount = 1000e18;
        p.walletCapBlocks = 10;
        LaunchResult memory r = _launch(p, 0);
        LaunchToken token = LaunchToken(r.token);
        assertTrue(token.capActive());

        vm.roll(block.number + 11);
        assertFalse(token.capActive());
        vm.prank(liquidity);
        token.transfer(alice, 5000e18); // way over the old cap: fine now
        assertEq(token.balanceOf(alice), 5000e18);
    }

    // ---------------------------------------------------------------------
    // LaunchLocker
    // ---------------------------------------------------------------------

    function _lockerWithPosition(LaunchCertificate.LpFeeMode feeMode, bool timed)
        internal
        returns (LaunchLocker locker, MockLPPosition position, uint256 tokenId, MockQuoteAsset feeA, MockQuoteAsset feeB)
    {
        feeA = new MockQuoteAsset();
        feeB = new MockQuoteAsset();
        position = new MockLPPosition(feeA, feeB);
        uint256 unlock = timed ? block.timestamp + 180 days : type(uint256).max;
        locker = new LaunchLocker(
            creator,
            timed ? LaunchCertificate.LockMode.Timed : LaunchCertificate.LockMode.Abyssal,
            feeMode,
            unlock
        );
        tokenId = position.mint(address(locker));
        locker.deposit(address(position), tokenId);
        feeA.mint(address(position), 10_000e6);
        feeB.mint(address(position), 10_000e18);
    }

    function test_locker_abyssal_principal_never_withdraws() public {
        (LaunchLocker locker,,,,) = _lockerWithPosition(LaunchCertificate.LpFeeMode.CreatorClaimable, false);
        vm.warp(block.timestamp + 3650 days); // 10 years later: still never
        vm.prank(creator);
        vm.expectRevert(LaunchLocker.AbyssalNeverUnlocks.selector);
        locker.withdrawPrincipal();
    }

    function test_locker_timed_withdraw_after_unlock_only_by_creator() public {
        (LaunchLocker locker, MockLPPosition position, uint256 tokenId,,) =
            _lockerWithPosition(LaunchCertificate.LpFeeMode.CreatorClaimable, true);
        uint256 unlock = locker.unlockTime();
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(LaunchLocker.StillLocked.selector, unlock));
        locker.withdrawPrincipal();

        vm.warp(block.timestamp + 180 days);
        vm.prank(alice);
        vm.expectRevert(LaunchLocker.NotCreator.selector);
        locker.withdrawPrincipal();

        vm.prank(creator);
        locker.withdrawPrincipal();
        assertEq(position.ownerOf(tokenId), creator);
    }

    function test_locker_claimable_fees_forward_to_creator() public {
        (LaunchLocker locker, MockLPPosition position,, MockQuoteAsset feeA, MockQuoteAsset feeB) =
            _lockerWithPosition(LaunchCertificate.LpFeeMode.CreatorClaimable, false);
        position.setAccrued(250e6, 7e18);
        locker.collectFees();
        assertEq(feeA.balanceOf(creator), 250e6);
        assertEq(feeB.balanceOf(creator), 7e18);
        // Principal untouched: position NFT still in the locker.
        assertTrue(locker.hasPosition());
    }

    function test_locker_dead_compounded_fees_cannot_be_collected() public {
        (LaunchLocker locker,,,,) = _lockerWithPosition(LaunchCertificate.LpFeeMode.DeadCompounded, false);
        vm.expectRevert(LaunchLocker.FeesAreDeadCompounded.selector);
        locker.collectFees();
    }

    function test_locker_deposit_is_one_shot() public {
        (LaunchLocker locker, MockLPPosition position,,,) =
            _lockerWithPosition(LaunchCertificate.LpFeeMode.CreatorClaimable, false);
        uint256 second = position.mint(address(locker));
        vm.expectRevert(LaunchLocker.AlreadyHasPosition.selector);
        locker.deposit(address(position), second);
    }

    // ---------------------------------------------------------------------
    // VestingVault
    // ---------------------------------------------------------------------

    function test_vesting_cliff_linear_full() public {
        LaunchToken token = new LaunchToken("V", "V", 1000e18, address(this), 0, 0, new address[](0));
        VestingVault vault = new VestingVault(IERC20(address(token)), team, 400e18, block.timestamp, 30 days, 365 days);
        token.transfer(address(vault), 400e18);

        uint256 alloc = 400e18;
        uint256 cliffRelease = (alloc * 30) / 365; // 30 days into a 365-day schedule
        assertEq(vault.releasable(), 0); // before cliff
        vm.warp(block.timestamp + 30 days);
        assertEq(vault.releasable(), cliffRelease);
        vault.release();
        assertEq(token.balanceOf(team), cliffRelease);

        vm.warp(block.timestamp + 365 days);
        assertEq(vault.releasable(), 400e18 - cliffRelease);
        vault.release();
        assertEq(token.balanceOf(team), 400e18);
        assertEq(vault.released(), 400e18);
    }

    function test_vesting_release_before_cliff_reverts() public {
        LaunchToken token = new LaunchToken("V", "V", 1000e18, address(this), 0, 0, new address[](0));
        VestingVault vault = new VestingVault(IERC20(address(token)), team, 400e18, block.timestamp, 30 days, 365 days);
        token.transfer(address(vault), 400e18);
        vm.expectRevert(VestingVault.NothingToRelease.selector);
        vault.release();
    }

    // ---------------------------------------------------------------------
    // AirdropDistributor
    // ---------------------------------------------------------------------

    function _merkleTree() internal pure returns (bytes32 root, bytes32[] memory proofAlice, bytes32[] memory proofBob) {
        // Two-leaf tree: leaves sorted-pair hashed (OZ MerkleProof semantics).
        bytes32 leafAlice = keccak256(abi.encodePacked(uint256(0), address(0xA11CE), uint256(100e18)));
        bytes32 leafBob = keccak256(abi.encodePacked(uint256(1), address(0xB0B), uint256(200e18)));
        root = leafAlice < leafBob ? keccak256(abi.encodePacked(leafAlice, leafBob)) : keccak256(abi.encodePacked(leafBob, leafAlice));
        proofAlice = new bytes32[](1);
        proofAlice[0] = leafBob;
        proofBob = new bytes32[](1);
        proofBob[0] = leafAlice;
    }

    function test_airdrop_claim_flow_and_double_claim() public {
        (bytes32 root, bytes32[] memory proofAlice, bytes32[] memory proofBob) = _merkleTree();
        address aliceAddr = address(0xA11CE);
        address bobAddr = address(0xB0B);

        LaunchToken token = new LaunchToken("A", "A", 1000e18, address(this), 0, 0, new address[](0));
        AirdropDistributor d = new AirdropDistributor{value: 0.0194 ether}(IERC20(address(token)), root, treasury);
        token.transfer(address(d), 300e18);
        assertEq(treasury.balance, 0.0194 ether);

        d.claim(0, aliceAddr, 100e18, proofAlice);
        assertEq(token.balanceOf(aliceAddr), 100e18);
        assertTrue(d.isClaimed(0));

        vm.expectRevert(abi.encodeWithSelector(AirdropDistributor.AlreadyClaimed.selector, 0));
        d.claim(0, aliceAddr, 100e18, proofAlice);

        d.claim(1, bobAddr, 200e18, proofBob);
        assertEq(token.balanceOf(bobAddr), 200e18);
    }

    function test_airdrop_wrong_proof_and_wrong_fee_revert() public {
        (bytes32 root, bytes32[] memory proofAlice,) = _merkleTree();
        LaunchToken token = new LaunchToken("A", "A", 1000e18, address(this), 0, 0, new address[](0));

        vm.expectRevert(abi.encodeWithSelector(AirdropDistributor.WrongFee.selector, 0.01 ether, 0.0194 ether));
        new AirdropDistributor{value: 0.01 ether}(IERC20(address(token)), root, treasury);

        AirdropDistributor d = new AirdropDistributor{value: 0.0194 ether}(IERC20(address(token)), root, treasury);
        token.transfer(address(d), 300e18);
        vm.expectRevert(AirdropDistributor.InvalidProof.selector);
        d.claim(0, address(0xA11CE), 999e18, proofAlice); // wrong amount => wrong leaf
    }

    // ---------------------------------------------------------------------
    // Split guards: Part 1 one-shot, Part 2 cross-checks, double launch
    // ---------------------------------------------------------------------

    function test_part1_deploy_is_one_shot() public {
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        vm.expectRevert(DistributionFactory.AlreadyDeployed.selector);
        fresh.deploy{value: 0.0194 ether}(p);
    }

    function test_part1_distribute_is_one_shot_and_needs_deploy() public {
        DistributionFactory fresh = new DistributionFactory(treasury);
        vm.expectRevert(DistributionFactory.NotDeployed.selector);
        fresh.distribute();

        LaunchParams memory p = _baseParams();
        fresh.deploy{value: 0.0194 ether}(p);
        fresh.distribute();
        assertTrue(fresh.distributed());
        vm.expectRevert(DistributionFactory.AlreadyDistributed.selector);
        fresh.distribute();
    }

    function test_part2_rejects_tampered_supply() public {
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        p.totalSupply = SUPPLY + 1;
        vm.expectRevert(HookCertificateFactory.Part1TokenMismatch.selector);
        part2.launch(fresh, p);
    }

    function test_part2_rejects_tampered_creator() public {
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        p.creator = alice;
        vm.expectRevert(HookCertificateFactory.Part1LockerMismatch.selector);
        part2.launch(fresh, p);
    }

    function test_part2_rejects_tampered_vesting_split() public {
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        p.vestingBps = 2000;
        p.liquidityBps = 7500; // sum still 10_000, so validation passes; cross-check must catch it
        vm.expectRevert(HookCertificateFactory.Part1AmountMismatch.selector);
        part2.launch(fresh, p);
    }

    function test_part2_rejects_double_launch() public {
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        part2.launch(fresh, p);
        vm.expectRevert(abi.encodeWithSelector(HookCertificateFactory.AlreadyLaunched.selector, address(fresh)));
        part2.launch(fresh, p);
    }

    function test_part2_launch_after_early_distribution() public {
        // Anyone may call Part 1's distribute() before Part 2 runs — the
        // destinations and amounts are frozen, so Part 2 verifies the
        // resulting balances instead of re-distributing.
        LaunchParams memory p = _baseParams();
        DistributionFactory fresh = new DistributionFactory(treasury);
        fresh.deploy{value: 0.0194 ether}(p);
        fresh.distribute();
        LaunchResult memory r = part2.launch(fresh, p);
        assertEq(LaunchToken(r.token).balanceOf(liquidity), (SUPPLY * 85) / 100);
        assertEq(LaunchToken(r.token).balanceOf(r.vestingVault), (SUPPLY * 10) / 100);
        assertEq(LaunchToken(r.token).balanceOf(r.airdropDistributor), (SUPPLY * 5) / 100);
        assertEq(LaunchToken(r.token).balanceOf(address(fresh)), 0);
    }

    // ---------------------------------------------------------------------
    // Equivalence: split two-step vs legacy one-step
    // ---------------------------------------------------------------------

    /// @notice The split changes deployment shape, not launch semantics.
    ///         Literal byte-identical deployment addresses are impossible
    ///         — the deployer differs (Part 1 / Part 2 vs one factory) —
    ///         so this test compares every param-derived and structural
    ///         field, plus the Launched event, and asserts internal
    ///         consistency on both sides. The ONE known observable
    ///         difference is asserted explicitly below: the legacy token
    ///         exempts the hook pair from the wallet cap (it could predict
    ///         their addresses); the split token cannot, because the hook
    ///         does not exist when Part 1 deploys the token.
    function test_two_step_launch_matches_legacy_one_step() public {
        LaunchParams memory p = _baseParams();

        vm.recordLogs();
        LaunchResult memory oldR = _launchLegacy(p, 0.0194 ether);
        Vm.Log[] memory oldLogs = vm.getRecordedLogs();

        vm.recordLogs();
        LaunchResult memory newR = _launch(p, 0.0194 ether);
        Vm.Log[] memory newLogs = vm.getRecordedLogs();

        // --- Token: same name/symbol/supply, same balances --------------
        LaunchToken oldToken = LaunchToken(oldR.token);
        LaunchToken newToken = LaunchToken(newR.token);
        assertEq(newToken.name(), oldToken.name());
        assertEq(newToken.symbol(), oldToken.symbol());
        assertEq(newToken.totalSupply(), oldToken.totalSupply());
        assertEq(newToken.balanceOf(liquidity), oldToken.balanceOf(liquidity));
        assertEq(newToken.balanceOf(newR.vestingVault), oldToken.balanceOf(oldR.vestingVault));
        assertEq(newToken.balanceOf(newR.airdropDistributor), oldToken.balanceOf(oldR.airdropDistributor));
        assertEq(newToken.factory(), address(part1), "new token's factory is Part 1");
        assertEq(oldToken.factory(), address(legacy), "legacy token's factory is the legacy factory");

        // --- Locker: same terms ------------------------------------------
        LaunchLocker oldLocker = LaunchLocker(oldR.locker);
        LaunchLocker newLocker = LaunchLocker(newR.locker);
        assertEq(newLocker.creator(), oldLocker.creator());
        assertEq(uint8(newLocker.lockMode()), uint8(oldLocker.lockMode()));
        assertEq(uint8(newLocker.lpFeeMode()), uint8(oldLocker.lpFeeMode()));
        assertEq(newLocker.unlockTime(), oldLocker.unlockTime());

        // --- Vault: same terms --------------------------------------------
        VestingVault oldVault = VestingVault(oldR.vestingVault);
        VestingVault newVault = VestingVault(newR.vestingVault);
        assertEq(newVault.beneficiary(), oldVault.beneficiary());
        assertEq(newVault.totalAllocation(), oldVault.totalAllocation());
        assertEq(newVault.startTime(), oldVault.startTime());
        assertEq(newVault.cliffSeconds(), oldVault.cliffSeconds());
        assertEq(newVault.durationSeconds(), oldVault.durationSeconds());

        // --- Distributor: same root and treasury --------------------------
        AirdropDistributor oldDist = AirdropDistributor(oldR.airdropDistributor);
        AirdropDistributor newDist = AirdropDistributor(newR.airdropDistributor);
        assertEq(newDist.merkleRoot(), oldDist.merkleRoot());
        assertEq(newDist.treasury(), oldDist.treasury());

        // --- Hook core: same wiring ----------------------------------------
        TCCore oldCore = TCCore(oldR.hookCore);
        TCCore newCore = TCCore(newR.hookCore);
        assertEq(newCore.poolReporter(), newR.hook);
        assertEq(oldCore.poolReporter(), oldR.hook);
        assertEq(newCore.treasury(), oldCore.treasury());
        assertEq(newCore.volumeThresholdQuote(), oldCore.volumeThresholdQuote());

        // --- Certificate records: same param-derived fields ----------------
        LaunchCertificate.CertificateRecord memory oldRec =
            legacy.certificate().recordOf(oldR.certificateId);
        LaunchCertificate.CertificateRecord memory newRec =
            part2.certificate().recordOf(newR.certificateId);
        assertEq(newRec.creator, oldRec.creator);
        assertEq(newRec.quoteAsset, oldRec.quoteAsset);
        assertEq(newRec.totalSupply, oldRec.totalSupply);
        assertEq(newRec.poolFeeTier, oldRec.poolFeeTier);
        assertEq(newRec.volumeThresholdQuote, oldRec.volumeThresholdQuote);
        assertEq(newRec.usdGate, oldRec.usdGate);
        assertEq(uint8(newRec.lockMode), uint8(oldRec.lockMode));
        assertEq(newRec.unlockTime, oldRec.unlockTime);
        assertEq(uint8(newRec.lpFeeMode), uint8(oldRec.lpFeeMode));
        assertEq(newRec.vestingBps, oldRec.vestingBps);
        assertEq(newRec.airdropBps, oldRec.airdropBps);
        assertEq(newRec.liquidityBps, oldRec.liquidityBps);
        assertEq(newRec.chainId, oldRec.chainId);
        // Internal consistency: each record points at its own launch.
        assertEq(newRec.token, newR.token);
        assertEq(newRec.locker, newR.locker);
        assertEq(newRec.vestingVault, newR.vestingVault);
        assertEq(newRec.airdropDistributor, newR.airdropDistributor);
        assertEq(newRec.hookCore, newR.hookCore);
        assertEq(oldRec.token, oldR.token);
        assertEq(oldRec.hookCore, oldR.hookCore);

        // --- Launched events: same param-derived fields --------------------
        LaunchedEvent memory oldEv = _findLaunched(oldLogs);
        LaunchedEvent memory newEv = _findLaunched(newLogs);
        assertEq(newEv.certificateId, oldEv.certificateId);
        assertEq(newEv.creator, oldEv.creator);
        assertEq(newEv.quoteAsset, oldEv.quoteAsset);
        assertEq(newEv.totalSupply, oldEv.totalSupply);
        assertEq(newEv.volumeThresholdQuote, oldEv.volumeThresholdQuote);
        assertEq(newEv.poolFeeTier, oldEv.poolFeeTier);
        assertEq(newEv.tickSpacing, oldEv.tickSpacing);
        // Internal consistency: each event names its own launch.
        assertEq(newEv.token, newR.token);
        assertEq(newEv.locker, newR.locker);
        assertEq(newEv.hook, newR.hook);
        assertEq(newEv.hookCore, newR.hookCore);
        assertEq(oldEv.token, oldR.token);
        assertEq(oldEv.hook, oldR.hook);
        // poolId differs (it embeds the hook address, and the hooks are
        // different contracts) — but each equals the canonical poolId
        // recomputed from that launch's own hook.
        assertTrue(newEv.poolId != oldEv.poolId);
        assertEq(newEv.poolId, PoolId.unwrap(newR.poolId));
        assertEq(oldEv.poolId, PoolId.unwrap(oldR.poolId));

        // --- THE known difference, asserted explicitly ----------------------
        // Legacy token exempts the hook pair (predicted addresses); the
        // split token cannot — the hook does not exist at Part 1 time.
        assertTrue(oldToken.capExempt(oldR.hook), "legacy: hook cap-exempt");
        assertTrue(oldToken.capExempt(oldR.hookCore), "legacy: hook core cap-exempt");
        assertFalse(newToken.capExempt(newR.hook), "split: hook NOT cap-exempt (documented)");
        assertFalse(newToken.capExempt(newR.hookCore), "split: hook core NOT cap-exempt (documented)");
        // Everything else that was exempt stays exempt on both.
        assertTrue(newToken.capExempt(liquidity));
        assertTrue(newToken.capExempt(newR.locker));
        assertTrue(newToken.capExempt(creator));
    }

    struct LaunchedEvent {
        uint256 certificateId;
        address token;
        address creator;
        address locker;
        address vestingVault;
        address airdropDistributor;
        address hookCore;
        address hook;
        address quoteAsset;
        uint256 totalSupply;
        uint256 volumeThresholdQuote;
        uint24 poolFeeTier;
        int24 tickSpacing;
        bytes32 poolId;
    }

    /// @notice Finds the Launched log in recorded logs and decodes it.
    ///         PoolId is bytes32 on the wire (UDVT underlying type).
    function _findLaunched(Vm.Log[] memory logs) internal pure returns (LaunchedEvent memory ev) {
        bytes32 sig = keccak256(
            "Launched(uint256,address,address,address,address,address,address,address,address,uint256,uint256,uint24,int24,bytes32)"
        );
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics.length == 4 && logs[i].topics[0] == sig) {
                ev.certificateId = uint256(logs[i].topics[1]);
                ev.token = address(uint160(uint256(logs[i].topics[2])));
                ev.creator = address(uint160(uint256(logs[i].topics[3])));
                (
                    ev.locker,
                    ev.vestingVault,
                    ev.airdropDistributor,
                    ev.hookCore,
                    ev.hook,
                    ev.quoteAsset,
                    ev.totalSupply,
                    ev.volumeThresholdQuote,
                    ev.poolFeeTier,
                    ev.tickSpacing,
                    ev.poolId
                ) = abi.decode(
                    logs[i].data,
                    (address, address, address, address, address, address, uint256, uint256, uint24, int24, bytes32)
                );
                return ev;
            }
        }
        revert("Launched event not found in logs");
    }
}

/// @notice Exposes the shared tick-spacing table for tests. The split
///         factories no longer expose getTickSpacing themselves.
contract TickSpacingHarness {
    function getTickSpacing(uint24 feeTier) external pure returns (int24) {
        return LaunchValidation.tickSpacing(feeTier);
    }
}
