// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {LaunchFactory} from "../src/LaunchFactory.sol";
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

/// @notice Core suite: factory launches, distribution, certificate, token
///         guard, locker, vesting, airdrop distributor.
contract PearlsTest is Test {
    LaunchFactory factory;
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
        factory = new LaunchFactory(treasury);
        quote = new MockQuoteAsset();
        vm.deal(address(this), 100 ether);
    }

    function _baseParams() internal view returns (LaunchFactory.LaunchParams memory p) {
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

    function _launch(LaunchFactory.LaunchParams memory p, uint256 value)
        internal
        returns (LaunchFactory.LaunchResult memory)
    {
        return factory.launch{value: value}(p);
    }

    // ---------------------------------------------------------------------
    // Factory + distribution + certificate
    // ---------------------------------------------------------------------

    function test_launch_full_distribution_and_balances() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);

        LaunchToken token = LaunchToken(r.token);
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(liquidity), (SUPPLY * 85) / 100);
        assertEq(token.balanceOf(r.vestingVault), (SUPPLY * 10) / 100);
        assertEq(token.balanceOf(r.airdropDistributor), (SUPPLY * 5) / 100);
        assertEq(token.balanceOf(address(factory)), 0, "factory must distribute everything");
        // Airdrop fee reached the treasury.
        assertEq(treasury.balance, 0.0194 ether);
    }

    function test_launch_certificate_record_and_ownership() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);

        LaunchCertificate cert = factory.certificate();
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
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        LaunchFactory.LaunchResult memory r = _launch(p, 0);

        assertEq(r.vestingVault, address(0));
        assertEq(r.airdropDistributor, address(0));
        assertEq(LaunchToken(r.token).balanceOf(liquidity), SUPPLY);
        assertEq(treasury.balance, 0);
    }

    function test_launch_wrong_value_reverts() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.WrongLaunchValue.selector, 0, 0.0194 ether));
        _launch(p, 0);
        // And: paying when no airdrop is configured also reverts.
        p.airdropBps = 0;
        p.liquidityBps = 9000;
        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.WrongLaunchValue.selector, 0.0194 ether, 0));
        _launch(p, 0.0194 ether);
    }

    function test_launch_bad_bps_reverts() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.liquidityBps = 8000; // sums to 9500
        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.BadBpsSplit.selector, 9500));
        _launch(p, 0.0194 ether);
    }

    function test_launch_timed_lock_below_floor_reverts() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.lockMode = LaunchCertificate.LockMode.Timed;
        p.lockDurationSeconds = 179 days;
        vm.expectRevert(
            abi.encodeWithSelector(LaunchFactory.TimedLockTooShort.selector, 179 days, 180 days)
        );
        _launch(p, 0.0194 ether);
    }

    function test_launch_timed_lock_at_floor_ok_and_recorded() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.lockMode = LaunchCertificate.LockMode.Timed;
        p.lockDurationSeconds = 180 days;
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);
        LaunchCertificate.CertificateRecord memory rec = factory.certificate().recordOf(r.certificateId);
        assertEq(rec.unlockTime, block.timestamp + 180 days);
        assertEq(LaunchLocker(r.locker).unlockTime(), block.timestamp + 180 days);
    }

    function test_launch_abyssal_with_duration_reverts() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.lockDurationSeconds = 365 days;
        vm.expectRevert(LaunchFactory.AbyssalMustHaveNoDuration.selector);
        _launch(p, 0.0194 ether);
    }

    function test_launch_airdrop_without_root_reverts() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.airdropMerkleRoot = bytes32(0);
        vm.expectRevert(LaunchFactory.AirdropNeedsRoot.selector);
        _launch(p, 0.0194 ether);
    }

    function test_factory_hook_pair_wiring() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);
        TCCore core = TCCore(r.hookCore);
        assertEq(core.poolReporter(), r.hook, "adapter must be the core's reporter");
        assertEq(core.treasury(), treasury);
        assertEq(core.volumeThresholdQuote(), THRESHOLD);
    }

    function test_certificate_mint_only_factory() public {
        LaunchCertificate cert = factory.certificate();
        LaunchCertificate.CertificateRecord memory rec;
        vm.prank(alice);
        vm.expectRevert(LaunchCertificate.NotFactory.selector);
        cert.mint(alice, rec);
    }

    function test_fee_tier_hygiene_and_validation() public {
        // Canonical tiers return expected canonical tick spacings
        assertEq(factory.getTickSpacing(100), 1);
        assertEq(factory.getTickSpacing(500), 10);
        assertEq(factory.getTickSpacing(3000), 60);
        assertEq(factory.getTickSpacing(10000), 200);

        // Invalid tiers revert
        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.InvalidPoolFeeTier.selector, 0));
        factory.getTickSpacing(0);

        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.InvalidPoolFeeTier.selector, 2500));
        factory.getTickSpacing(2500);

        // Launch with invalid fee tier reverts
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.poolFeeTier = 2500;
        vm.expectRevert(abi.encodeWithSelector(LaunchFactory.InvalidPoolFeeTier.selector, 2500));
        _launch(p, 0.0194 ether);

        // Launch with valid fee tier (500) succeeds and populates poolId
        p.poolFeeTier = 500;
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);
        assertTrue(PoolId.unwrap(r.poolId) != bytes32(0));
    }

    function test_single_canonical_pool_guarantee() public {
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.poolFeeTier = 3000;
        LaunchFactory.LaunchResult memory r = _launch(p, 0.0194 ether);

        int24 expectedTickSpacing = factory.getTickSpacing(3000);
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
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        p.walletCapAmount = 1000e18;
        p.walletCapBlocks = 10;
        LaunchFactory.LaunchResult memory r = _launch(p, 0);
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
        LaunchFactory.LaunchParams memory p = _baseParams();
        p.vestingBps = 0;
        p.airdropBps = 0;
        p.liquidityBps = 10_000;
        p.walletCapAmount = 1000e18;
        p.walletCapBlocks = 10;
        LaunchFactory.LaunchResult memory r = _launch(p, 0);
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
}
