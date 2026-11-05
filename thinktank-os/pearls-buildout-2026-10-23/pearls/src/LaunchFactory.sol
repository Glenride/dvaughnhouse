// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

import {LaunchToken} from "./LaunchToken.sol";
import {LaunchCertificate} from "./LaunchCertificate.sol";
import {LaunchLocker} from "./LaunchLocker.sol";
import {VestingVault} from "./VestingVault.sol";
import {AirdropDistributor} from "./AirdropDistributor.sol";
import {TCCore} from "./TCCore.sol";
import {TCHook} from "./TCHook.sol";
import {HookMiner} from "./HookMiner.sol";
import {AIRDROP_CAMPAIGN_FEE, BASE_SEPOLIA_POOL_MANAGER, TC_HOOK_FLAGS} from "./PearlsConstants.sol";

/// @title LaunchFactory
/// @notice One transaction launches a token with every parameter frozen:
///         token + distribution (vesting / airdrop / liquidity), lock
///         custody contract, volume-gate hook accounting, and the launch
///         certificate — "the pearl".
///
/// @dev PROTOTYPE — unaudited, testnet only (Base Sepolia / Anvil). The
///      factory has NO owner and NO setters. Its only stored configuration
///      is the immutable treasury address, set at construction. The
///      certificate contract is deployed in this constructor so the
///      factory↔certificate wiring can never be re-pointed.
///
///      Pool creation is the integration boundary (spec §2): the factory
///      mines a CREATE2 salt encoding `TCHook.HOOK_FLAGS` in the low 14
///      address bits and deploys the `TCHook` pair (the adapter deploys
///      its accounting core in its own constructor — no address prediction,
///      no setters) and sends the liquidity tranche to `params.liquidityAllocation`
///      (in production: the pool-initialiser that creates the v4 pool,
///      mints the position into the locker, and calls
///      `LaunchLocker.deposit`).
///
///      Airdrop fee: if `airdropBps > 0`, the launch call must carry
///      exactly `AIRDROP_CAMPAIGN_FEE` (0.0194 ETH), forwarded
///      to the distributor's constructor, which forwards it to the
///      treasury. If no airdrop is configured, the call must carry 0 ETH.
contract LaunchFactory {
    using SafeERC20 for IERC20;

    /// @notice Minimum timed lock: 180 days, in seconds. A floor, enforced
    ///         here — not a guideline in documentation.
    uint256 public constant MIN_TIMED_LOCK_SECONDS = 180 days;

    /// @notice Canonical Uniswap v4 PoolManager on Base Sepolia (84532).
    IPoolManager public constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);

    /// @notice Platform treasury Safe. Immutable. Receives the airdrop fee
    ///         and (via hook settlement) quote fees.
    address public immutable treasury;
    /// @notice The certificate contract, deployed in this constructor.
    LaunchCertificate public immutable certificate;

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

    event Launched(
        uint256 indexed certificateId,
        address indexed token,
        address indexed creator,
        address locker,
        address vestingVault,
        address airdropDistributor,
        address hookCore,
        address hook,
        address quoteAsset,
        uint256 totalSupply,
        uint256 volumeThresholdQuote,
        uint24 poolFeeTier,
        int24 tickSpacing,
        PoolId poolId
    );

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

    /// @notice Returns canonical tick spacing for standard Uniswap v4 fee tiers.
    /// @dev Supported: 100 -> 1, 500 -> 10, 3000 -> 60, 10000 -> 200.
    function getTickSpacing(uint24 feeTier) public pure returns (int24) {
        if (feeTier == 100) return 1;
        if (feeTier == 500) return 10;
        if (feeTier == 3000) return 60;
        if (feeTier == 10000) return 200;
        revert InvalidPoolFeeTier(feeTier);
    }

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        certificate = new LaunchCertificate(address(this));
    }

    /// @notice Launch a token with all parameters frozen in this one call.
    /// @param params The full configuration surface (spec §4).
    /// @return result Deployed module addresses + certificate id.
    function launch(LaunchParams calldata params) external payable returns (LaunchResult memory result) {
        _validate(params);

        uint256 requiredValue = params.airdropBps > 0 ? AIRDROP_CAMPAIGN_FEE : 0;
        if (msg.value != requiredValue) revert WrongLaunchValue(msg.value, requiredValue);

        // --- Allocation amounts (bps splits; dust to liquidity) ----------
        uint256 vestingAmount = (params.totalSupply * params.vestingBps) / 10_000;
        uint256 airdropAmount = (params.totalSupply * params.airdropBps) / 10_000;
        uint256 liquidityAmount = params.totalSupply - vestingAmount - airdropAmount;

        // --- Hook pair (CREATE2 salt mined for v4 permission bits) -------
        // The adapter deploys its accounting core in its own constructor,
        // naming itself as the core's reporter. Exact wiring, no prediction.
        (address expectedHook, bytes32 hookSalt) = HookMiner.find(
            address(this),
            TC_HOOK_FLAGS,
            type(TCHook).creationCode,
            abi.encode(
                POOL_MANAGER,
                treasury,
                params.quoteIsCurrency0,
                params.volumeThresholdQuote,
                params.maxSwapQuoteAmount,
                params.maxSwapBlocks
            )
        );
        TCHook hook = new TCHook{salt: hookSalt}(
            POOL_MANAGER,
            treasury,
            params.quoteIsCurrency0,
            params.volumeThresholdQuote,
            params.maxSwapQuoteAmount,
            params.maxSwapBlocks
        );
        assert(address(hook) == expectedHook);
        TCCore hookCore = hook.core();
        result.hook = address(hook);
        result.hookCore = address(hookCore);

        // --- Locker ---------------------------------------------------------
        uint256 unlockTime = params.lockMode == LaunchCertificate.LockMode.Abyssal
            ? type(uint256).max
            : block.timestamp + params.lockDurationSeconds;
        LaunchLocker locker = new LaunchLocker(params.creator, params.lockMode, params.lpFeeMode, unlockTime);
        result.locker = address(locker);

        // --- Token ------------------------------------------------------------
        // Cap exemptions known before the token exists (pool/locker/creator/hook
        // plumbing per spec §4). The vault and the distributor do not need
        // exemptions: transfers FROM the factory are exempt inside LaunchToken
        // (initial distribution is not sniping).
        address[] memory exemptions = new address[](6);
        exemptions[0] = params.liquidityAllocation;
        exemptions[1] = address(locker);
        exemptions[2] = params.creator;
        exemptions[3] = address(hookCore);
        exemptions[4] = address(hook);
        exemptions[5] = address(POOL_MANAGER);
        LaunchToken token = new LaunchToken(
            params.name,
            params.symbol,
            params.totalSupply,
            address(this),
            params.walletCapAmount,
            params.walletCapBlocks,
            exemptions
        );
        result.token = address(token);

        // --- Vesting vault (optional) ---------------------------------------
        if (vestingAmount > 0) {
            VestingVault vault = new VestingVault(
                IERC20(address(token)),
                params.vestingBeneficiary,
                vestingAmount,
                block.timestamp,
                params.vestingCliffSeconds,
                params.vestingDurationSeconds
            );
            result.vestingVault = address(vault);
            IERC20(address(token)).safeTransfer(address(vault), vestingAmount);
        }

        // --- Airdrop distributor (optional, fee forwarded) ------------------
        if (airdropAmount > 0) {
            AirdropDistributor distributor = new AirdropDistributor{value: AIRDROP_CAMPAIGN_FEE}(
                IERC20(address(token)), params.airdropMerkleRoot, treasury
            );
            result.airdropDistributor = address(distributor);
            IERC20(address(token)).safeTransfer(address(distributor), airdropAmount);
        }

        // --- Liquidity tranche ------------------------------------------------
        IERC20(address(token)).safeTransfer(params.liquidityAllocation, liquidityAmount);

        // --- Canonical v4 pool parameters -----------------------------------
        int24 tickSpacing = getTickSpacing(params.poolFeeTier);
        (Currency c0, Currency c1) = params.quoteIsCurrency0
            ? (Currency.wrap(params.quoteAsset), Currency.wrap(address(token)))
            : (Currency.wrap(address(token)), Currency.wrap(params.quoteAsset));

        PoolKey memory canonicalPoolKey = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: params.poolFeeTier,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(hook))
        });
        result.poolId = canonicalPoolKey.toId();

        // --- Certificate: the pearl -------------------------------------------
        LaunchCertificate.CertificateRecord memory record = LaunchCertificate.CertificateRecord({
            token: address(token),
            creator: params.creator,
            quoteAsset: params.quoteAsset,
            totalSupply: params.totalSupply,
            poolFeeTier: params.poolFeeTier,
            volumeThresholdQuote: params.volumeThresholdQuote,
            usdGate: params.usdGate,
            lockMode: params.lockMode,
            unlockTime: params.lockMode == LaunchCertificate.LockMode.Abyssal ? 0 : unlockTime,
            lpFeeMode: params.lpFeeMode,
            vestingBps: params.vestingBps,
            airdropBps: params.airdropBps,
            liquidityBps: params.liquidityBps,
            locker: address(locker),
            vestingVault: result.vestingVault,
            airdropDistributor: result.airdropDistributor,
            hookCore: address(hookCore),
            launchBlock: block.number,
            chainId: block.chainid
        });
        result.certificateId = certificate.mint(params.creator, record);

        emit Launched(
            result.certificateId,
            address(token),
            params.creator,
            address(locker),
            result.vestingVault,
            result.airdropDistributor,
            address(hookCore),
            address(hook),
            params.quoteAsset,
            params.totalSupply,
            params.volumeThresholdQuote,
            params.poolFeeTier,
            tickSpacing,
            result.poolId
        );
    }

    function _validate(LaunchParams calldata p) internal pure {
        if (bytes(p.name).length == 0 || bytes(p.symbol).length == 0) revert EmptyName();
        if (p.totalSupply == 0) revert ZeroSupply();
        if (p.creator == address(0) || p.quoteAsset == address(0) || p.liquidityAllocation == address(0)) {
            revert ZeroAddress();
        }
        getTickSpacing(p.poolFeeTier);
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
