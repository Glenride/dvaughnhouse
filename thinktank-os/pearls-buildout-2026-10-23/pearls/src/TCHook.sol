// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {SafeCast} from "@uniswap/v4-core/src/libraries/SafeCast.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary, toBeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import {ITCHook} from "./ITCHook.sol";
import {TCCore} from "./TCCore.sol";

/// @title TCHook — Uniswap v4 hook adapter
/// @notice Bridges the canonical Uniswap v4 `PoolManager` swap callbacks to
///         `TCCore`'s volume gate, launch guard, and 0.3% quote-only
///         fee accounting, settling fees directly to the platform treasury Safe
///         inside the `PoolManager` unlock context.
///
/// @dev PROTOTYPE — unaudited, testnet only (Base Sepolia / Anvil).
///
///      Permission flags encoded in `address(this)` via CREATE2 salt mining:
///      - `BEFORE_SWAP_FLAG` (1 << 7)
///      - `AFTER_SWAP_FLAG` (1 << 6)
///      - `BEFORE_SWAP_RETURNS_DELTA_FLAG` (1 << 3)
///      - `AFTER_SWAP_RETURNS_DELTA_FLAG` (1 << 2)
///
///      How Uniswap v4 hook deltas map across the 4 swap direction cases
///      (spec §7.2 / §7.3):
///      In Uniswap v4's `Hooks.afterSwap`:
///        `hookDeltaSpecified = beforeSwapHookReturn.getSpecifiedDelta()`
///        `hookDeltaUnspecified = beforeSwapHookReturn.getUnspecifiedDelta() + afterSwapReturn`
///      Therefore:
///      1. When the quote asset is the UNSPECIFIED currency of the swap
///         (`isQuoteSpecified(params) == false` — i.e. Sell exact-in and
///         Buy exact-out), the quote amount is determined by the pool's swap
///         execution (`delta`). `afterSwap` resolves `quoteAmount` from
///         `delta`, calls `core.recordSwap(quoteAmount)` (enforcing the
///         launch guard and computing the 30 bps fee if the gate was already
///         crossed), calls `poolManager.take(quoteCurrency, treasury, fee)`,
///         and returns `fee.toInt128()` as `hookDeltaUnspecified`.
///      2. When the quote asset is the SPECIFIED currency of the swap
///         (`isQuoteSpecified(params) == true` — i.e. Buy exact-in and
///         Sell exact-out), any hook fee delta in the quote currency MUST be
///         returned from `beforeSwap` as `hookDeltaSpecified` (returning a
///         delta from `afterSwap` would apply to the unspecified launched
///         token, which Pearls never taxes).
///         - Below the gate (and on the crossing swap itself), `core.feeActive()`
///           is `false`: `beforeSwap` returns `ZERO_DELTA` and `afterSwap`
///           records the actual swapped quote volume from `delta`.
///         - At/above the gate, `core.feeActive()` is `true`: `beforeSwap`
///           computes the 30 bps fee on the specified quote amount, calls
///           `poolManager.take(quoteCurrency, treasury, fee)`, and returns
///           `toBeforeSwapDelta(fee.toInt128(), 0)`. `afterSwap` verifies
///           the swap filled completely (reverting on a partial fill so a
///           trader is never overcharged a fee on an unfilled portion),
///           records `specifiedQuote` in `core.recordSwap`, and returns `0`.
contract TCHook is IHooks, ITCHook {
    using SafeCast for uint256;

    /// @notice Required low-14-bit address flags for CREATE2 deployment.
    uint160 public constant HOOK_FLAGS = uint160(
        Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
            | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
    );

    /// @notice The canonical Uniswap v4 PoolManager. Immutable.
    IPoolManager public immutable poolManager;
    /// @notice The accounting core this adapter reports to. Immutable.
    TCCore public immutable core;
    /// @notice Whether the quote asset is currency0 in this pool.
    bool public immutable quoteIsCurrency0;

    error ZeroAddress();
    error NotPoolManager();
    error HookNotImplemented();
    error PartialFillWithFee(uint256 specifiedQuote, uint256 actualQuote);

    modifier onlyPoolManager() {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        _;
    }

    /// @dev Deploys its `TCCore` in its own constructor, naming
    ///      `address(this)` as the core's immutable `poolReporter`, and
    ///      validates that `address(this)` carries the exact low-14-bit
    ///      v4 hook permission flags (`HOOK_FLAGS`).
    constructor(
        IPoolManager poolManager_,
        address treasury,
        bool quoteIsCurrency0_,
        uint256 volumeThresholdQuote_,
        uint256 maxSwapQuoteAmount,
        uint256 maxSwapBlocks
    ) {
        if (address(poolManager_) == address(0) || treasury == address(0)) revert ZeroAddress();
        Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions());
        poolManager = poolManager_;
        quoteIsCurrency0 = quoteIsCurrency0_;
        core = new TCCore(
            treasury, address(this), quoteIsCurrency0_, volumeThresholdQuote_, maxSwapQuoteAmount, maxSwapBlocks
        );
    }

    /// @notice Returns the v4 hook permission flags implemented by `TCHook`.
    function getHookPermissions() public pure returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true,
            afterSwapReturnDelta: true,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ---------------------------------------------------------------------
    // Quote-side resolution helpers
    // ---------------------------------------------------------------------

    /// @notice Unpack v4's packed BalanceDelta (amount0 high 128, amount1 low 128).
    function unpackDelta(int256 packed) public pure returns (int256 amount0, int256 amount1) {
        amount0 = packed >> 128;
        amount1 = int256(int128(uint128(uint256(packed) & ((1 << 128) - 1))));
    }

    /// @notice Resolve the absolute quote-side amount of a swap from its
    ///         packed BalanceDelta. Direction-independent BY DESIGN: the
    ///         quote currency's delta is the quote amount whether the
    ///         swapper paid it or received it (volume counts both ways;
    ///         the post-gate fee is owed on the quote side either way).
    function resolveQuoteAmount(int256 balanceDeltaPacked) public view returns (uint256) {
        (int256 amount0, int256 amount1) = unpackDelta(balanceDeltaPacked);
        int256 quoteDelta = quoteIsCurrency0 ? amount0 : amount1;
        return quoteDelta >= 0 ? uint256(quoteDelta) : uint256(-quoteDelta);
    }

    /// @notice True when the swap's `amountSpecified` is denominated in the
    ///         pool's quote currency (Buy exact-in and Sell exact-out).
    function isQuoteSpecified(IPoolManager.SwapParams calldata params) public view returns (bool) {
        bool specifiedIs0 = (params.amountSpecified < 0) == params.zeroForOne;
        return quoteIsCurrency0 == specifiedIs0;
    }

    // ---------------------------------------------------------------------
    // ITCHook accounting views (delegated to core)
    // ---------------------------------------------------------------------

    /// @inheritdoc ITCHook
    function cumulativeVolumeQuote() external view returns (uint256) {
        return core.cumulativeVolumeQuote();
    }

    /// @inheritdoc ITCHook
    function volumeThresholdQuote() external view returns (uint256) {
        return core.volumeThresholdQuote();
    }

    /// @inheritdoc ITCHook
    function feeActive() external view returns (bool) {
        return core.feeActive();
    }

    /// @inheritdoc ITCHook
    function feeBps() external pure returns (uint16) {
        return 30;
    }

    /// @inheritdoc ITCHook
    function quoteFee(uint256 quoteAmount, bool gateCrossedBefore) external pure returns (uint256) {
        return (gateCrossedBefore ? (quoteAmount * 30) / 10_000 : 0);
    }

    // ---------------------------------------------------------------------
    // Canonical Uniswap v4 IHooks swap callbacks
    // ---------------------------------------------------------------------

    /// @inheritdoc IHooks
    function beforeSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) external override(IHooks, ITCHook) onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        if (isQuoteSpecified(params) && core.feeActive()) {
            uint256 specifiedQuote = params.amountSpecified < 0
                ? uint256(-params.amountSpecified)
                : uint256(params.amountSpecified);
            uint256 fee = core.quoteFee(specifiedQuote, true);
            if (fee > 0) {
                Currency quoteCurrency = quoteIsCurrency0 ? key.currency0 : key.currency1;
                poolManager.take(quoteCurrency, core.treasury(), fee);
                return (IHooks.beforeSwap.selector, toBeforeSwapDelta(fee.toInt128(), 0), 0);
            }
        }
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /// @inheritdoc IHooks
    function afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) external override(IHooks, ITCHook) onlyPoolManager returns (bytes4, int128) {
        uint256 poolQuote = resolveQuoteAmount(BalanceDelta.unwrap(delta));

        if (isQuoteSpecified(params)) {
            if (core.feeActive()) {
                uint256 specifiedQuote = params.amountSpecified < 0
                    ? uint256(-params.amountSpecified)
                    : uint256(params.amountSpecified);
                uint256 feeTaken = core.quoteFee(specifiedQuote, true);
                if (feeTaken > 0) {
                    uint256 actualQuote = params.amountSpecified < 0
                        ? poolQuote + feeTaken
                        : (poolQuote >= feeTaken ? poolQuote - feeTaken : 0);
                    if (actualQuote != specifiedQuote) {
                        revert PartialFillWithFee(specifiedQuote, actualQuote);
                    }
                    uint256 recordedFee = core.recordSwap(specifiedQuote);
                    assert(recordedFee == feeTaken);
                    return (IHooks.afterSwap.selector, 0);
                }
            }
            uint256 zeroFee = core.recordSwap(poolQuote);
            assert(zeroFee == 0);
            return (IHooks.afterSwap.selector, 0);
        }

        uint256 fee = core.recordSwap(poolQuote);
        if (fee > 0) {
            Currency quoteCurrency = quoteIsCurrency0 ? key.currency0 : key.currency1;
            poolManager.take(quoteCurrency, core.treasury(), fee);
            return (IHooks.afterSwap.selector, fee.toInt128());
        }
        return (IHooks.afterSwap.selector, 0);
    }

    // ---------------------------------------------------------------------
    // Unused IHooks callbacks (not permissioned on this hook address)
    // ---------------------------------------------------------------------

    /// @inheritdoc IHooks
    function beforeInitialize(address, PoolKey calldata, uint160) external pure returns (bytes4) {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function afterInitialize(address, PoolKey calldata, uint160, int24) external pure returns (bytes4) {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function beforeAddLiquidity(address, PoolKey calldata, IPoolManager.ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function afterAddLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure returns (bytes4, BalanceDelta) {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function beforeRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function afterRemoveLiquidity(
        address,
        PoolKey calldata,
        IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta,
        BalanceDelta,
        bytes calldata
    ) external pure returns (bytes4, BalanceDelta) {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        revert HookNotImplemented();
    }

    /// @inheritdoc IHooks
    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        revert HookNotImplemented();
    }
}
