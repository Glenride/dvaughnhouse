// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LaunchCertificate} from "./LaunchCertificate.sol";
import {LaunchParams, InvalidPoolFeeTier, EmptyName, ZeroSupply, ZeroAddress, BadBpsSplit, BadThreshold, TimedLockTooShort, AbyssalMustHaveNoDuration, VestingNeedsBeneficiary, VestingBadSchedule, AirdropNeedsRoot} from "./LaunchTypes.sol";

/// @title LaunchValidation
/// @notice The launch parameter rules, shared by both factories so a bad
///         launch reverts the same way at either step. Part 1 validates
///         before deploying anything; Part 2 validates again before
///         trusting Part 1's outputs, so a bad params set cannot be
///         smuggled through either step.
library LaunchValidation {
    /// @notice Minimum timed lock: 180 days, in seconds. A floor, enforced
    ///         here — not a guideline in documentation.
    uint256 internal constant MIN_TIMED_LOCK_SECONDS = 180 days;

    /// @notice Returns canonical tick spacing for standard Uniswap v4 fee tiers.
    /// @dev Supported: 100 -> 1, 500 -> 10, 3000 -> 60, 10000 -> 200.
    function tickSpacing(uint24 feeTier) internal pure returns (int24) {
        if (feeTier == 100) return 1;
        if (feeTier == 500) return 10;
        if (feeTier == 3000) return 60;
        if (feeTier == 10000) return 200;
        revert InvalidPoolFeeTier(feeTier);
    }

    /// @notice The full launch parameter rules, identical to the old
    ///         single-factory `_validate`.
    function validate(LaunchParams calldata p) internal pure {
        if (bytes(p.name).length == 0 || bytes(p.symbol).length == 0) revert EmptyName();
        if (p.totalSupply == 0) revert ZeroSupply();
        if (p.creator == address(0) || p.quoteAsset == address(0) || p.liquidityAllocation == address(0)) {
            revert ZeroAddress();
        }
        tickSpacing(p.poolFeeTier);
        uint256 sum = uint256(p.vestingBps) + uint256(p.airdropBps) + uint256(p.liquidityBps);
        if (sum != 10_000) revert BadBpsSplit(sum);
        if (p.volumeThresholdQuote == 0) revert BadThreshold();
        if (p.lockMode == LaunchCertificate.LockMode.Timed) {
            if (p.lockDurationSeconds < MIN_TIMED_LOCK_SECONDS) {
                revert TimedLockTooShort(p.lockDurationSeconds, MIN_TIMED_LOCK_SECONDS);
            }
        } else if (p.lockDurationSeconds != 0) {
            revert AbyssalMustHaveNoDuration();
        }
        if (p.vestingBps > 0) {
            if (p.vestingBeneficiary == address(0)) revert VestingNeedsBeneficiary();
            if (p.vestingDurationSeconds == 0 || p.vestingCliffSeconds > p.vestingDurationSeconds) {
                revert VestingBadSchedule();
            }
        }
        if (p.airdropBps > 0 && p.airdropMerkleRoot == bytes32(0)) revert AirdropNeedsRoot();
    }
}
