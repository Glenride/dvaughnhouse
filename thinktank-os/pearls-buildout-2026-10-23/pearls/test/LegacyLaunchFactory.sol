// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

import {LaunchToken} from "../src/LaunchToken.sol";
import {LaunchCertificate} from "../src/LaunchCertificate.sol";
import {LaunchLocker} from "../src/LaunchLocker.sol";
import {VestingVault} from "../src/VestingVault.sol";
import {AirdropDistributor} from "../src/AirdropDistributor.sol";
import {TCCore} from "../src/TCCore.sol";
import {TCHook} from "../src/TCHook.sol";
import {HookMiner} from "../src/HookMiner.sol";
import {LaunchParams, LaunchResult, WrongLaunchValue, ZeroAddress} from "../src/LaunchTypes.sol";
import {LaunchValidation} from "../src/LaunchValidation.sol";
import {AIRDROP_CAMPAIGN_FEE, BASE_SEPOLIA_POOL_MANAGER, TC_HOOK_FLAGS} from "../src/PearlsConstants.sol";

/// @title LegacyLaunchFactory
/// @notice A byte-for-byte-logic copy of the pre-split LaunchFactory,
///         kept ONLY as the reference implementation for the equivalence
///         test (`Pearls.t.sol`). It is not used by any production path.
///         The single difference from the original: the launch parameter
///         structs, errors and validation rules are imported from the
///         shared `LaunchTypes` / `LaunchValidation` modules (identical
///         selectors and logic) instead of being defined inline.
contract LegacyLaunchFactory {
    using SafeERC20 for IERC20;

    /// @notice Canonical Uniswap v4 PoolManager on Base Sepolia (84532).
    IPoolManager public constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);

    /// @notice Platform treasury Safe. Immutable. Receives hook fees.
    address public immutable treasury;
    /// @notice The certificate contract, deployed in this constructor.
    LaunchCertificate public immutable certificate;

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

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        certificate = new LaunchCertificate(address(this));
    }

    /// @notice Deploy everything and mint the certificate in ONE call.
    /// @dev This is the pre-split behaviour. The split replaces it with
    ///      two steps (DistributionFactory.deploy, then
    ///      HookCertificateFactory.launch) because this contract's
    ///      deployed bytecode (27,495 bytes) exceeds the 24,576-byte
    ///      EIP-170 limit.
    function launch(LaunchParams calldata params) external payable returns (LaunchResult memory result) {
        LaunchValidation.validate(params);

        uint256 requiredValue = params.airdropBps > 0 ? AIRDROP_CAMPAIGN_FEE : 0;
        if (msg.value != requiredValue) revert WrongLaunchValue(msg.value, requiredValue);

        // --- Allocation amounts (bps splits; dust to liquidity) ----------
        uint256 vestingAmount = (params.totalSupply * params.vestingBps) / 10_000;
        uint256 airdropAmount = (params.totalSupply * params.airdropBps) / 10_000;
        uint256 liquidityAmount = params.totalSupply - vestingAmount - airdropAmount;

        // --- Locker (before the token: the token exempts it) ------------
        uint256 unlockTime = params.lockMode == LaunchCertificate.LockMode.Abyssal
            ? type(uint256).max
            : block.timestamp + params.lockDurationSeconds;
        LaunchLocker locker = new LaunchLocker(params.creator, params.lockMode, params.lpFeeMode, unlockTime);
        result.locker = address(locker);

        // --- Token ----------------------------------------------------------
        // Cap exemptions are fixed at construction: liquidity allocation,
        // locker, creator, hook pair, PoolManager. The vault and the
        // distributor do not need exemptions: transfers FROM the factory
        // are exempt inside LaunchToken (initial distribution is not
        // sniping).
        //
        // The hook and core do NOT exist yet — they are deployed below.
        // Their addresses are PREDICTED by CREATE nonce: this factory is
        // deploying the hook with CREATE2 (from `HookMiner.find`), and
        // the core is the hook's first CREATE.
        (address predictedHook, bytes32 hookSalt) = HookMiner.find(
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
        address predictedHookCore = vmComputeCreateAddress(predictedHook, 1);

        address[] memory exemptions = new address[](6);
        exemptions[0] = params.liquidityAllocation;
        exemptions[1] = address(locker);
        exemptions[2] = params.creator;
        exemptions[3] = predictedHook;
        exemptions[4] = predictedHookCore;
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
        }

        // --- Airdrop distributor (optional, fee forwarded) ------------------
        if (airdropAmount > 0) {
            AirdropDistributor distributor = new AirdropDistributor{value: AIRDROP_CAMPAIGN_FEE}(
                IERC20(address(token)), params.airdropMerkleRoot, treasury
            );
            result.airdropDistributor = address(distributor);
        }

        // --- Hook pair (CREATE2 salt mined for v4 permission bits) -------
        // The adapter deploys its accounting core in its own constructor,
        // naming itself as the core's reporter. Exact wiring, no prediction.
        TCHook hook = new TCHook{salt: hookSalt}(
            POOL_MANAGER,
            treasury,
            params.quoteIsCurrency0,
            params.volumeThresholdQuote,
            params.maxSwapQuoteAmount,
            params.maxSwapBlocks
        );
        assert(address(hook) == predictedHook);
        TCCore hookCore = hook.core();
        assert(address(hookCore) == predictedHookCore);
        result.hook = address(hook);
        result.hookCore = address(hookCore);

        // --- Distribution -----------------------------------------------------
        if (vestingAmount > 0) {
            IERC20(address(token)).safeTransfer(result.vestingVault, vestingAmount);
        }
        if (airdropAmount > 0) {
            IERC20(address(token)).safeTransfer(result.airdropDistributor, airdropAmount);
        }
        IERC20(address(token)).safeTransfer(params.liquidityAllocation, liquidityAmount);

        // --- Canonical v4 pool parameters -----------------------------------
        int24 tickSpacing = LaunchValidation.tickSpacing(params.poolFeeTier);
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
            token: result.token,
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
            locker: result.locker,
            vestingVault: result.vestingVault,
            airdropDistributor: result.airdropDistributor,
            hookCore: address(hookCore),
            launchBlock: block.number,
            chainId: block.chainid
        });
        result.certificateId = certificate.mint(params.creator, record);

        emit Launched(
            result.certificateId,
            result.token,
            params.creator,
            result.locker,
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

    /// @notice CREATE address prediction, inlined here because the legacy
    ///         factory must not depend on forge-std helpers.
    function vmComputeCreateAddress(address deployer, uint256 nonce) internal pure returns (address) {
        // RLP: 0xd6 0x94 <20-byte deployer> <nonce byte>. Only valid for
        // nonce 1 (the core is the hook's first CREATE).
        require(nonce == 1, "legacy: only nonce 1 supported");
        bytes memory rlp = abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, bytes1(uint8(nonce)));
        return address(uint160(uint256(keccak256(rlp))));
    }
}
