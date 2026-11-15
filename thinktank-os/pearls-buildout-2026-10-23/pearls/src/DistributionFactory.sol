// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

import {LaunchToken} from "./LaunchToken.sol";
import {LaunchCertificate} from "./LaunchCertificate.sol";
import {LaunchLocker} from "./LaunchLocker.sol";
import {VestingVault} from "./VestingVault.sol";
import {AirdropDistributor} from "./AirdropDistributor.sol";
import {LaunchParams, DistributionResult, WrongLaunchValue, ZeroAddress} from "./LaunchTypes.sol";
import {LaunchValidation} from "./LaunchValidation.sol";
import {AIRDROP_CAMPAIGN_FEE, BASE_SEPOLIA_POOL_MANAGER} from "./PearlsConstants.sol";

/// @title DistributionFactory — Part 1 of the split launch
/// @notice Deploys, and only deploys, the distribution side of a launch:
///         the token, the lock custody contract, and the optional vesting
///         vault and airdrop distributor. No token transfers happen in
///         this step — the full supply sits in this contract until Part 2
///         (HookCertificateFactory) runs distribution.
///
/// @dev PROTOTYPE — unaudited, testnet only (Base Sepolia / Anvil). This
///      factory has NO owner and NO setters. Its only stored configuration
///      is the immutable treasury address, set at construction.
///
///      Why two transactions: the old single LaunchFactory embedded the
///      creation code of every contract it deployed and measured 27,495
///      bytes of deployed bytecode — over the 24,576-byte EIP-170 limit.
///      Splitting by *which child contracts each factory builds* keeps
///      each factory under the limit. The "one transaction launches a
///      token" guarantee becomes two transactions; this is documented
///      honestly and not claimed otherwise anywhere.
///
///      Airdrop fee: if `airdropBps > 0`, this step must carry exactly
///      `AIRDROP_CAMPAIGN_FEE` (0.0194 ETH), forwarded to the
///      distributor's constructor, which forwards it to the treasury.
///      If no airdrop is configured, this step must carry 0 ETH. Part 2
///      takes no value.
///
///      Distribution (`distribute`) is callable by anyone, exactly once,
///      to destinations and amounts frozen at deploy time — the same
///      pattern as `VestingVault.release()`: a third-party call can only
///      ever pay the frozen recipients the frozen amounts. Part 2 calls
///      it as part of its launch step, after validating Part 1's outputs;
///      if it was already called, Part 2 verifies the resulting balances
///      instead of re-distributing.
///
///      Wallet-cap exemptions: the token is deployed here with the
///      exemptions known at this step (liquidity allocation, locker,
///      creator, PoolManager). The hook and hook core do NOT exist yet —
///      they are deployed by Part 2 — so they cannot be in the token's
///      construction-time exemption list. In practice the hook never
///      receives the launch token (fees settle in the quote asset only),
///      so no transfer behaviour changes; the only observable difference
///      from the old single-factory launch is that `capExempt[hook]` and
///      `capExempt[hookCore]` read false instead of true. That difference
///      is stated here, not hidden.
contract DistributionFactory {
    using SafeERC20 for IERC20;

    /// @notice Canonical Uniswap v4 PoolManager on Base Sepolia (84532).
    IPoolManager public constant POOL_MANAGER = IPoolManager(BASE_SEPOLIA_POOL_MANAGER);

    /// @notice Platform treasury Safe. Immutable. Receives the airdrop fee.
    address public immutable treasury;

    /// @notice True once `deploy` has run. One launch per factory.
    bool public deployed;
    /// @notice True once `distribute` has run. Distribution is one-shot.
    bool public distributed;
    /// @notice Block timestamp at which `deploy` ran. Part 2 uses it to
    ///         verify the locker's unlock time (the two steps run in
    ///         different transactions, so Part 2 cannot recompute it from
    ///         its own timestamp).
    uint256 public deployTimestamp;

    /// @notice The deployed token. Minted in full to this contract.
    address public token;
    /// @notice The lock custody contract.
    address public locker;
    /// @notice The vesting vault, or address(0) when unused.
    address public vestingVault;
    /// @notice The airdrop distributor, or address(0) when unused.
    address public airdropDistributor;
    /// @notice Frozen distribution amounts (bps splits of totalSupply;
    ///         dust goes to liquidity).
    uint256 public vestingAmount;
    uint256 public airdropAmount;
    uint256 public liquidityAmount;
    /// @notice Receives the liquidity tranche.
    address public liquidityAllocation;

    event Distributed(
        address indexed token, uint256 vestingAmount, uint256 airdropAmount, uint256 liquidityAmount
    );

    error AlreadyDeployed();
    error NotDeployed();
    error AlreadyDistributed();

    constructor(address treasury_) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
    }

    /// @notice Deploy the distribution side of a launch. No token
    ///         transfers happen here — the supply stays in this contract.
    /// @param params The full configuration surface (spec §4).
    /// @return result Deployed module addresses.
    function deploy(LaunchParams calldata params) external payable returns (DistributionResult memory result) {
        if (deployed) revert AlreadyDeployed();
        LaunchValidation.validate(params);

        uint256 requiredValue = params.airdropBps > 0 ? AIRDROP_CAMPAIGN_FEE : 0;
        if (msg.value != requiredValue) revert WrongLaunchValue(msg.value, requiredValue);

        // --- Allocation amounts (bps splits; dust to liquidity) ----------
        vestingAmount = (params.totalSupply * params.vestingBps) / 10_000;
        airdropAmount = (params.totalSupply * params.airdropBps) / 10_000;
        liquidityAmount = params.totalSupply - vestingAmount - airdropAmount;
        liquidityAllocation = params.liquidityAllocation;
        deployTimestamp = block.timestamp;

        // --- Locker (before the token: the token exempts it) ------------
        uint256 unlockTime = params.lockMode == LaunchCertificate.LockMode.Abyssal
            ? type(uint256).max
            : block.timestamp + params.lockDurationSeconds;
        LaunchLocker locker_ = new LaunchLocker(params.creator, params.lockMode, params.lpFeeMode, unlockTime);
        locker = address(locker_);
        result.locker = address(locker_);

        // --- Token ----------------------------------------------------------
        // Cap exemptions known at this step (pool/locker/creator/hook
        // plumbing per spec §4, minus the hook pair, which Part 2 has not
        // deployed yet — see the contract notice). The vault and the
        // distributor do not need exemptions: transfers FROM this factory
        // are exempt inside LaunchToken (initial distribution is not
        // sniping).
        address[] memory exemptions = new address[](4);
        exemptions[0] = params.liquidityAllocation;
        exemptions[1] = address(locker_);
        exemptions[2] = params.creator;
        exemptions[3] = address(POOL_MANAGER);
        LaunchToken token_ = new LaunchToken(
            params.name,
            params.symbol,
            params.totalSupply,
            address(this),
            params.walletCapAmount,
            params.walletCapBlocks,
            exemptions
        );
        token = address(token_);
        result.token = address(token_);

        // --- Vesting vault (optional) ---------------------------------------
        if (vestingAmount > 0) {
            VestingVault vault = new VestingVault(
                IERC20(address(token_)),
                params.vestingBeneficiary,
                vestingAmount,
                block.timestamp,
                params.vestingCliffSeconds,
                params.vestingDurationSeconds
            );
            vestingVault = address(vault);
            result.vestingVault = address(vault);
        }

        // --- Airdrop distributor (optional, fee forwarded) ------------------
        if (airdropAmount > 0) {
            AirdropDistributor distributor = new AirdropDistributor{value: AIRDROP_CAMPAIGN_FEE}(
                IERC20(address(token_)), params.airdropMerkleRoot, treasury
            );
            airdropDistributor = address(distributor);
            result.airdropDistributor = address(distributor);
        }

        deployed = true;
    }

    /// @notice Perform the frozen distribution: vesting tranche to the
    ///         vault, airdrop tranche to the distributor, liquidity
    ///         tranche to the liquidity allocation. Callable by anyone,
    ///         exactly once — destinations and amounts were frozen at
    ///         deploy time, so no caller can redirect anything.
    function distribute() external {
        if (!deployed) revert NotDeployed();
        if (distributed) revert AlreadyDistributed();
        distributed = true;

        IERC20 token_ = IERC20(token);
        if (vestingAmount > 0) {
            token_.safeTransfer(vestingVault, vestingAmount);
        }
        if (airdropAmount > 0) {
            token_.safeTransfer(airdropDistributor, airdropAmount);
        }
        token_.safeTransfer(liquidityAllocation, liquidityAmount);

        emit Distributed(token, vestingAmount, airdropAmount, liquidityAmount);
    }
}
