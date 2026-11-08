// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
import {DistributionFactory} from "./DistributionFactory.sol";
import {LaunchParams, LaunchResult, ZeroAddress} from "./LaunchTypes.sol";
import {LaunchValidation} from "./LaunchValidation.sol";
import {BASE_SEPOLIA_POOL_MANAGER, TC_HOOK_FLAGS} from "./PearlsConstants.sol";

/// @title HookCertificateFactory — Part 2 of the split launch
/// @notice Takes Part 1's deployed distribution modules plus the full
///         launch params, then: deploys the TCHook pair, performs the
///         frozen token distribution (via Part 1), mints the launch
///         certificate with the complete record, and emits the `Launched`
///         event with the same fields as the old single-factory launch.
///
/// @dev PROTOTYPE — unaudited, testnet only (Base Sepolia / Anvil). This
///      factory has NO owner and NO setters. Its only stored configuration
///      is the immutable treasury address, set at construction. The
///      certificate contract is deployed in this constructor so the
///      factory↔certificate wiring can never be re-pointed.
///
///      Why two transactions: the old single LaunchFactory embedded the
///      creation code of every contract it deployed and measured 27,495
///      bytes of deployed bytecode — over the 24,576-byte EIP-170 limit.
///      Splitting by *which child contracts each factory builds* keeps
///      each factory under the limit. The "one transaction launches a
///      token" guarantee becomes two transactions; this is documented
///      honestly and not claimed otherwise anywhere.
///
///      Part 1 validation: this factory trusts nothing about Part 1's
///      outputs. Before doing anything it checks every address is
///      non-zero, the token's name/symbol/supply match the params, the
///      locker's terms match the params (including the unlock time
///      recomputed from Part 1's frozen deploy timestamp, because the
///      two steps run in different transactions), the vault's and
///      distributor's terms match the params, and the distribution
///      amounts recomputed from the params match Part 1's frozen plan.
///      Any mismatch reverts. A tampered Part 1 cannot produce a launch.
///
///      Double launch: each Part 1 may be launched exactly once by this
///      factory (tracked in `launched`). A second launch call against
///      the same Part 1 reverts — one distribution, one hook pair, one
///      certificate per Part 1.
///
///      Distribution timing: if Part 1's `distribute` was already called
///      (anyone can call it — destinations and amounts are frozen), this
///      launch verifies the resulting balances instead of re-distributing.
contract HookCertificateFactory {
    /// @notice Canonical Uniswap v4 PoolManager on Base Sepolia (84532).
    IPoolManager public constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);

    /// @notice Platform treasury Safe. Immutable. Receives hook fees.
    address public immutable treasury;
    /// @notice The certificate contract, deployed in this constructor.
    LaunchCertificate public immutable certificate;

    /// @notice Part 1 factories this factory has already launched.
    mapping(address => bool) public launched;

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

    error AlreadyLaunched(address part1);
    error Part1NotDeployed();
    error Part1ZeroAddress();
    error Part1TokenMismatch();
    error Part1LockerMismatch();
    error Part1VaultMismatch();
    error Part1DistributorMismatch();
    error Part1AmountMismatch();
    error Part1DistributionMismatch();

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        certificate = new LaunchCertificate(address(this));
    }

    /// @notice Complete a launch started by Part 1. Takes no value.
    /// @param part1 The DistributionFactory that deployed the token,
    ///        locker, vault and distributor for these params.
    /// @param params The full configuration surface (spec §4) — must be
    ///        the same params Part 1 was deployed with.
    /// @return result Deployed module addresses + certificate id.
    function launch(DistributionFactory part1, LaunchParams calldata params)
        external
        returns (LaunchResult memory result)
    {
        LaunchValidation.validate(params);
        _validatePart1(part1, params);
        if (launched[address(part1)]) revert AlreadyLaunched(address(part1));
        launched[address(part1)] = true;

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

        // --- Part 1 addresses ----------------------------------------------
        result.token = part1.token();
        result.locker = part1.locker();
        result.vestingVault = part1.vestingVault();
        result.airdropDistributor = part1.airdropDistributor();

        // --- Distribution (via Part 1; verify if already done) -------------
        if (!part1.distributed()) {
            part1.distribute();
        } else {
            _verifyDistribution(part1, params);
        }

        // --- Canonical v4 pool parameters -----------------------------------
        int24 tickSpacing = LaunchValidation.tickSpacing(params.poolFeeTier);
        (Currency c0, Currency c1) = params.quoteIsCurrency0
            ? (Currency.wrap(params.quoteAsset), Currency.wrap(result.token))
            : (Currency.wrap(result.token), Currency.wrap(params.quoteAsset));

        PoolKey memory canonicalPoolKey = PoolKey({
            currency0: c0,
            currency1: c1,
            fee: params.poolFeeTier,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(hook))
        });
        result.poolId = canonicalPoolKey.toId();

        // --- Certificate: the pearl -------------------------------------------
        uint256 unlockTime = LaunchLocker(result.locker).unlockTime();
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

    /// @notice Verify Part 1's deployment matches these params exactly.
    /// @dev The two steps run in different transactions, so the locker's
    ///      unlock time is checked against Part 1's frozen deploy
    ///      timestamp — it cannot be recomputed from this transaction's
    ///      timestamp.
    function _validatePart1(DistributionFactory part1, LaunchParams calldata p) internal view {
        if (!part1.deployed()) revert Part1NotDeployed();
        address token = part1.token();
        address locker = part1.locker();
        address vault = part1.vestingVault();
        address distributor = part1.airdropDistributor();
        if (token == address(0) || locker == address(0)) revert Part1ZeroAddress();
        if (part1.liquidityAllocation() != p.liquidityAllocation) revert Part1AmountMismatch();

        // Token matches the params.
        LaunchToken token_ = LaunchToken(token);
        if (token_.factory() != address(part1)) revert Part1TokenMismatch();
        if (token_.totalSupply() != p.totalSupply) revert Part1TokenMismatch();
        if (keccak256(bytes(token_.name())) != keccak256(bytes(p.name))) revert Part1TokenMismatch();
        if (keccak256(bytes(token_.symbol())) != keccak256(bytes(p.symbol))) revert Part1TokenMismatch();

        // Locker matches the params.
        LaunchLocker locker_ = LaunchLocker(locker);
        if (locker_.creator() != p.creator) revert Part1LockerMismatch();
        if (locker_.lockMode() != p.lockMode) revert Part1LockerMismatch();
        if (locker_.lpFeeMode() != p.lpFeeMode) revert Part1LockerMismatch();
        if (p.lockMode == LaunchCertificate.LockMode.Abyssal) {
            if (locker_.unlockTime() != type(uint256).max) revert Part1LockerMismatch();
        } else {
            if (locker_.unlockTime() != part1.deployTimestamp() + p.lockDurationSeconds) {
                revert Part1LockerMismatch();
            }
        }

        // Distribution math matches Part 1's frozen plan.
        uint256 vestingAmount = (p.totalSupply * p.vestingBps) / 10_000;
        uint256 airdropAmount = (p.totalSupply * p.airdropBps) / 10_000;
        uint256 liquidityAmount = p.totalSupply - vestingAmount - airdropAmount;
        if (
            part1.vestingAmount() != vestingAmount || part1.airdropAmount() != airdropAmount
                || part1.liquidityAmount() != liquidityAmount
        ) revert Part1AmountMismatch();

        // Vault matches the params.
        if (p.vestingBps > 0) {
            if (vault == address(0)) revert Part1ZeroAddress();
            VestingVault vault_ = VestingVault(vault);
            if (address(vault_.token()) != token) revert Part1VaultMismatch();
            if (vault_.beneficiary() != p.vestingBeneficiary) revert Part1VaultMismatch();
            if (vault_.totalAllocation() != vestingAmount) revert Part1VaultMismatch();
            if (vault_.startTime() != part1.deployTimestamp()) revert Part1VaultMismatch();
            if (vault_.cliffSeconds() != p.vestingCliffSeconds) revert Part1VaultMismatch();
            if (vault_.durationSeconds() != p.vestingDurationSeconds) revert Part1VaultMismatch();
        } else if (vault != address(0)) {
            revert Part1VaultMismatch();
        }

        // Distributor matches the params.
        if (p.airdropBps > 0) {
            if (distributor == address(0)) revert Part1ZeroAddress();
            AirdropDistributor dist_ = AirdropDistributor(distributor);
            if (address(dist_.token()) != token) revert Part1DistributorMismatch();
            if (dist_.merkleRoot() != p.airdropMerkleRoot) revert Part1DistributorMismatch();
            if (dist_.treasury() != treasury) revert Part1DistributorMismatch();
        } else if (distributor != address(0)) {
            revert Part1DistributorMismatch();
        }
    }

    /// @notice When distribution already ran before this launch, verify
    ///         the tokens landed exactly where the frozen plan says.
    function _verifyDistribution(DistributionFactory part1, LaunchParams calldata p) internal view {
        uint256 vestingAmount = (p.totalSupply * p.vestingBps) / 10_000;
        uint256 airdropAmount = (p.totalSupply * p.airdropBps) / 10_000;
        uint256 liquidityAmount = p.totalSupply - vestingAmount - airdropAmount;
        IERC20 token_ = IERC20(part1.token());
        if (vestingAmount > 0 && token_.balanceOf(part1.vestingVault()) != vestingAmount) {
            revert Part1DistributionMismatch();
        }
        if (airdropAmount > 0 && token_.balanceOf(part1.airdropDistributor()) != airdropAmount) {
            revert Part1DistributionMismatch();
        }
        if (token_.balanceOf(part1.liquidityAllocation()) != liquidityAmount) {
            revert Part1DistributionMismatch();
        }
        if (token_.balanceOf(address(part1)) != 0) revert Part1DistributionMismatch();
    }
}
