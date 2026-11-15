// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LaunchCertificate} from "./LaunchCertificate.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";

/// @title LaunchTypes
/// @notice Shared launch parameter/result structs and validation errors,
///         used by both factories (DistributionFactory and
///         HookCertificateFactory) so the two steps agree on exactly one
///         shape for a launch. The structs and error selectors are
///         identical to the ones the single LaunchFactory used before the
///         split — only the deployment shape changed.

struct LaunchParams {
    string name;
    string symbol;
    uint256 totalSupply;
    address creator;
    address quoteAsset;
    uint24 poolFeeTier;
    uint256 volumeThresholdQuote; // $10M gate in fixed quote units
    uint256 usdGate; // display anchor (informational only)
    LaunchCertificate.LockMode lockMode;
    uint256 lockDurationSeconds; // Timed only; >= 180 days; 0 for Abyssal
    LaunchCertificate.LpFeeMode lpFeeMode;
    uint16 vestingBps;
    uint16 airdropBps;
    uint16 liquidityBps;
    address vestingBeneficiary;
    uint256 vestingCliffSeconds;
    uint256 vestingDurationSeconds;
    bytes32 airdropMerkleRoot; // required iff airdropBps > 0
    address liquidityAllocation; // receives the liquidity tranche
    bool quoteIsCurrency0;
    uint256 walletCapAmount; // 0 = disabled
    uint256 walletCapBlocks;
    uint256 maxSwapQuoteAmount; // 0 = disabled
    uint256 maxSwapBlocks;
}

/// @notice What Part 1 (DistributionFactory) deploys. No token transfers
///         have happened yet at this point — the token supply sits in
///         Part 1 until Part 2 runs distribution.
struct DistributionResult {
    address token;
    address locker;
    address vestingVault; // address(0) if unused
    address airdropDistributor; // address(0) if unused
}

/// @notice What a completed (two-step) launch produces. Identical fields
///         to the old single-factory LaunchResult.
struct LaunchResult {
    address token;
    address locker;
    address vestingVault;
    address airdropDistributor;
    address hookCore;
    address hook;
    uint256 certificateId;
    PoolId poolId;
}

error ZeroAddress();
error EmptyName();
error ZeroSupply();
error BadBpsSplit(uint256 sum);
error BadThreshold();
error TimedLockTooShort(uint256 given, uint256 minimum);
error AbyssalMustHaveNoDuration();
error VestingNeedsBeneficiary();
error VestingBadSchedule();
error AirdropNeedsRoot();
error WrongLaunchValue(uint256 sent, uint256 required);
error InvalidPoolFeeTier(uint24 feeTier);
