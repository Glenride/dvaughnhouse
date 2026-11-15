// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

/// @title ITCHook — the hook surface Pearls guarantees
/// @notice Two layers:
///  1. The ACCOUNTING surface (`TCCore` implements it fully, and it is
///     fully tested): volume accumulation, the $10M gate, the 0.3% quote
///     fee, and the launch-window max-swap guard.
///  2. The V4 CALLBACK surface (`TCHook` adapter): the canonical Uniswap v4
///     `IHooks` swap callbacks (`beforeSwap` and `afterSwap`) typed against the
///     pinned `uniswap/v4-core` v4.0.0 release (spec §7).
interface ITCHook {
    // ---------------------------------------------------------------------
    // Accounting views (implemented by TCCore and exposed by TCHook)
    // ---------------------------------------------------------------------

    /// @notice Cumulative quote-asset volume observed by this pool's hook,
    ///         in quote base units. Monotonically increasing.
    function cumulativeVolumeQuote() external view returns (uint256);

    /// @notice The $10M gate expressed in fixed quote base units at launch.
    function volumeThresholdQuote() external view returns (uint256);

    /// @notice True once cumulative volume has reached the gate. The fee
    ///         applies to swaps that START at/above the gate (§6.2).
    function feeActive() external view returns (bool);

    /// @notice The protocol fee rate in bps. Protocol constant: 30.
    function feeBps() external view returns (uint16);

    /// @notice Pure fee maths: the fee on a quote-side amount, given whether
    ///         the gate was already crossed before this swap. Rounds down.
    function quoteFee(uint256 quoteAmount, bool gateCrossedBefore) external pure returns (uint256);

    // ---------------------------------------------------------------------
    // Canonical Uniswap v4 swap callback surface (implemented by TCHook)
    // ---------------------------------------------------------------------

    /// @notice Canonical v4 `IHooks.beforeSwap`. When the quote asset is the
    ///         specified currency of the swap and the volume gate is already
    ///         active, takes the 30 bps quote fee to the treasury via
    ///         `PoolManager.take()` and returns the specified hook delta.
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4, BeforeSwapDelta, uint24);

    /// @notice Canonical v4 `IHooks.afterSwap`. Resolves the quote-side swap
    ///         volume, records the swap in `TCCore` (enforcing the
    ///         launch-window max-swap guard and computing the fee), and when
    ///         the quote asset is the unspecified currency of the swap and the
    ///         fee is non-zero, takes the quote fee to the treasury via
    ///         `PoolManager.take()` and returns the unspecified hook delta.
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external returns (bytes4, int128);
}
