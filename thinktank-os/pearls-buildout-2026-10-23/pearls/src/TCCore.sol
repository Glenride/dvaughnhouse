// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import {ITCHook} from "./ITCHook.sol";
import {PROTOCOL_FEE_BPS} from "./PearlsConstants.sol";

/// @title TCCore
/// @notice ALL of the TCHook's accounting, with none of the v4 plumbing:
///         cumulative quote volume, the $10M volume gate, the 0.3% quote-side
///         fee, and the launch-window max-swap guard. One instance per pool.
///
/// @dev PROTOTYPE — unaudited, testnet only. THIS IS THE RISK CENTRE'S
///      TESTABLE HALF (spec §7). The other half — resolving a raw v4 swap
///      into the correct `quoteAmount` across the four direction cases and
///      settling the fee inside the PoolManager unlock context — lives in
///      the TCHook adapter and is INCOMPLETE by design in this repo.
///
///      Trust shape: the only address that can report swaps is the immutable
///      `poolReporter`. The TCHook adapter deploys this core in its own
///      constructor and names itself — so the wiring cannot be wrong, cannot
///      be re-pointed, and needs no setter anywhere. The certificate prints
///      both addresses.
///
///      Fee semantics (spec §6.2/§6.3):
///      - The swap that CROSSES the gate pays no fee. Fees apply only when
///        cumulative volume was already >= threshold before the swap.
///      - fee = quoteAmount * 30 / 10_000, integer division rounding DOWN
///        (trader's favour), computed on the quote side only.
///      - `recordSwap` RETURNS the fee owed; moving the actual quote tokens
///        to the treasury is the adapter's settlement job, because ERC-20
///        transfers are not how v4 hooks take fees (spec §7.2). The core
///        does track `totalFeesQuote` so the amount owed is auditable
///        on-chain even before settlement lands.
contract TCCore is ITCHook {
    /// @notice Protocol fee rate once the gate is crossed: 0.3%.
    uint16 public constant FEE_BPS = PROTOCOL_FEE_BPS;
    uint256 internal constant BPS_DENOMINATOR = 10_000;

    /// @notice Platform treasury Safe. Immutable; receives quote fees via
    ///         the adapter's settlement.
    address public immutable treasury;
    /// @notice The only address allowed to report swaps (the hook adapter).
    address public immutable poolReporter;
    /// @notice Whether the quote asset is v4 currency0 for this pool.
    bool public immutable quoteIsCurrency0;

    /// @inheritdoc ITCHook
    uint256 public immutable volumeThresholdQuote;
    /// @notice Launch block (hook deployment block) for the guard window.
    uint256 public immutable launchBlock;
    /// @notice Max quote-side swap size during the guard window. 0 = off.
    uint256 public immutable maxSwapQuoteAmount;
    /// @notice Guard window length in blocks.
    uint256 public immutable maxSwapBlocks;

    uint256 internal _cumulativeVolumeQuote;
    uint256 internal _totalFeesQuote;

    event SwapRecorded(uint256 quoteAmount, uint256 fee, uint256 cumulativeVolumeAfter);
    event GateCrossed(uint256 cumulativeVolumeAfter);

    error ZeroAddress();
    error NotReporter();
    error SwapTooLarge(uint256 quoteAmount, uint256 maxAllowed);
    error BadThreshold();

    constructor(
        address treasury_,
        address poolReporter_,
        bool quoteIsCurrency0_,
        uint256 volumeThresholdQuote_,
        uint256 maxSwapQuoteAmount_,
        uint256 maxSwapBlocks_
    ) {
        if (treasury_ == address(0) || poolReporter_ == address(0)) revert ZeroAddress();
        if (volumeThresholdQuote_ == 0) revert BadThreshold();
        treasury = treasury_;
        poolReporter = poolReporter_;
        quoteIsCurrency0 = quoteIsCurrency0_;
        volumeThresholdQuote = volumeThresholdQuote_;
        maxSwapQuoteAmount = maxSwapQuoteAmount_;
        maxSwapBlocks = maxSwapBlocks_;
        launchBlock = block.number;
    }

    // ---------------------------------------------------------------------
    // Accounting entry point (adapter-only)
    // ---------------------------------------------------------------------

    /// @notice Record one swap's quote-side amount, enforcing the guard and
    ///         computing the fee owed to the treasury.
    /// @param quoteAmount Absolute quote-asset amount of the swap (the side
    ///        Pearls measures and, post-gate, taxes). The adapter resolves
    ///        this from the v4 BalanceDelta — see spec §7.3 for why that
    ///        resolution is the dangerous step.
    /// @return fee Quote-asset fee owed for this swap (0 below the gate and
    ///         for the crossing swap itself).
    function recordSwap(uint256 quoteAmount) external returns (uint256 fee) {
        if (msg.sender != poolReporter) revert NotReporter();

        // LaunchGuard: max swap size for the first maxSwapBlocks blocks.
        if (
            maxSwapQuoteAmount != 0 && block.number <= launchBlock + maxSwapBlocks
                && quoteAmount > maxSwapQuoteAmount
        ) {
            revert SwapTooLarge(quoteAmount, maxSwapQuoteAmount);
        }

        bool crossedBefore = _cumulativeVolumeQuote >= volumeThresholdQuote;
        fee = quoteFee(quoteAmount, crossedBefore);

        _cumulativeVolumeQuote += quoteAmount;
        if (fee > 0) _totalFeesQuote += fee;

        emit SwapRecorded(quoteAmount, fee, _cumulativeVolumeQuote);
        if (!crossedBefore && _cumulativeVolumeQuote >= volumeThresholdQuote) {
            emit GateCrossed(_cumulativeVolumeQuote);
        }
    }

    // ---------------------------------------------------------------------
    // ITCHook accounting views
    // ---------------------------------------------------------------------

    function cumulativeVolumeQuote() external view returns (uint256) {
        return _cumulativeVolumeQuote;
    }

    /// @notice Total quote fees accrued (owed to the treasury) so far.
    function totalFeesQuote() external view returns (uint256) {
        return _totalFeesQuote;
    }

    function feeActive() external view returns (bool) {
        return _cumulativeVolumeQuote >= volumeThresholdQuote;
    }

    function feeBps() external pure returns (uint16) {
        return FEE_BPS;
    }

    function quoteFee(uint256 quoteAmount, bool gateCrossedBefore) public pure returns (uint256) {
        if (!gateCrossedBefore) return 0;
        return (quoteAmount * FEE_BPS) / BPS_DENOMINATOR;
    }

    // The v4 callback surface is NOT implemented by the core; it lives on
    // the TCHook adapter. These stubs exist only so the core formally
    // satisfies ITCHook's full surface for type-checking consumers —
    // they revert unconditionally and must never be wired to a PoolManager.
    function beforeSwap(address, PoolKey calldata, IPoolManager.SwapParams calldata, bytes calldata)
        external
        pure
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        revert("core: callbacks live on the adapter");
    }

    function afterSwap(address, PoolKey calldata, IPoolManager.SwapParams calldata, BalanceDelta, bytes calldata)
        external
        pure
        returns (bytes4, int128)
    {
        revert("core: callbacks live on the adapter");
    }
}
