// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {LaunchCertificate} from "./LaunchCertificate.sol";

/// @notice Minimal fee-collection surface of a Uniswap v4 LP position.
/// @dev The real v4 PositionManager collects fees through its own modify /
///      collect flow inside the PoolManager unlock context. This interface is
///      the Pearls-side contract the integration layer must adapt to that
///      flow (see spec §7.4). The core never pretends the adaptation exists:
///      `LaunchLocker.collectFees` works against any position implementing
///      this interface, and tests exercise it with a mock position.
interface ILPPosition {
    /// @notice Collect accrued fees out of the position to `to`.
    /// @return amount0 Amount of token0 collected.
    /// @return amount1 Amount of token1 collected.
    function collectFees(address to) external returns (uint256 amount0, uint256 amount1);

    /// @notice The position's token0 / token1 (fee denominations).
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/// @title LaunchLocker
/// @notice Custodies a launch's Uniswap v4 LP position NFT under the lock
///         terms frozen at launch.
///
/// @dev PROTOTYPE — unaudited, testnet only.
///
///      Lock modes:
///      - Abyssal (default): principal can NEVER leave. This contract has no
///        withdrawal path for Abyssal locks — not a disabled one, a
///        non-existent one. `withdrawPrincipal` reverts unconditionally.
///      - Timed: `withdrawPrincipal` exists but reverts until `unlockTime`
///        (factory-validated ≥ 180 days after launch) and then pays the
///        position NFT only to the recorded creator.
///
///      LP fees, per the launch's frozen choice:
///      - CreatorClaimable: `collectFees()` pulls accrued fees from the
///        position and forwards them to the creator. Principal never moves.
///      - DeadCompounded: `collectFees()` reverts. Fees remain inside the
///        position, compounding. Nothing is burned by the locker because the
///        locker never holds fee tokens in this mode.
///
///      There is no owner and no rescue function. A rescue function would be
///      an admin key by another name; its absence is the product (spec §8).
contract LaunchLocker is ERC721Holder, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Who launched (fee recipient in CreatorClaimable mode,
    ///         principal recipient after a Timed unlock). Immutable.
    address public immutable creator;
    /// @notice Lock mode frozen at launch.
    LaunchCertificate.LockMode public immutable lockMode;
    /// @notice LP fee mode frozen at launch.
    LaunchCertificate.LpFeeMode public immutable lpFeeMode;
    /// @notice Earliest principal-withdrawal time. `type(uint256).max` for
    ///         Abyssal locks (rendered "forever" on the certificate).
    uint256 public immutable unlockTime;

    /// @notice The LP position collection (v4 PositionManager) expected.
    address public positionCollection;
    /// @notice The custodied position token id. Set once at deposit.
    uint256 public positionTokenId;
    /// @notice True once a position has been deposited.
    bool public hasPosition;

    event PositionDeposited(address indexed collection, uint256 indexed tokenId);
    event FeesCollected(address indexed creator, uint256 amount0, uint256 amount1);
    event PrincipalWithdrawn(address indexed creator, uint256 tokenId);

    error ZeroAddress();
    error AlreadyHasPosition();
    error NoPosition();
    error NotCreator();
    error StillLocked(uint256 unlockTime);
    error AbyssalNeverUnlocks();
    error FeesAreDeadCompounded();

    constructor(
        address creator_,
        LaunchCertificate.LockMode lockMode_,
        LaunchCertificate.LpFeeMode lpFeeMode_,
        uint256 unlockTime_
    ) {
        if (creator_ == address(0)) revert ZeroAddress();
        creator = creator_;
        lockMode = lockMode_;
        lpFeeMode = lpFeeMode_;
        unlockTime = unlockTime_;
    }

    /// @notice Take custody of the LP position NFT. One-shot: the first
    ///         deposit is the position for the life of this locker.
    /// @dev In the production launch flow the pool-initialiser calls this in
    ///      the same transaction that mints the position (spec §2). The NFT
    ///      must be transferred to this contract before/with the call; the
    ///      locker verifies it actually holds it.
    function deposit(address collection, uint256 tokenId) external nonReentrant {
        if (collection == address(0)) revert ZeroAddress();
        if (hasPosition) revert AlreadyHasPosition();
        if (IERC721(collection).ownerOf(tokenId) != address(this)) {
            revert NoPosition();
        }
        positionCollection = collection;
        positionTokenId = tokenId;
        hasPosition = true;
        emit PositionDeposited(collection, tokenId);
    }

    /// @notice Collect accrued LP fees to the creator (CreatorClaimable
    ///         mode only). Principal and the position NFT never move.
    /// @dev The position's `collectFees` pays token0/token1 amounts to this
    ///      contract; the locker forwards its full balances of those tokens
    ///      to the creator so no fee residue can accumulate here.
    function collectFees() external returns (uint256 amount0, uint256 amount1) {
        if (lpFeeMode == LaunchCertificate.LpFeeMode.DeadCompounded) {
            revert FeesAreDeadCompounded();
        }
        if (!hasPosition) revert NoPosition();
        ILPPosition position = ILPPosition(positionCollection);
        (amount0, amount1) = position.collectFees(address(this));
        address t0 = position.token0();
        address t1 = position.token1();
        uint256 bal0 = IERC20(t0).balanceOf(address(this));
        uint256 bal1 = t1 == t0 ? 0 : IERC20(t1).balanceOf(address(this));
        if (bal0 > 0) IERC20(t0).safeTransfer(creator, bal0);
        if (bal1 > 0) IERC20(t1).safeTransfer(creator, bal1);
        emit FeesCollected(creator, amount0, amount1);
    }

    /// @notice Withdraw the position NFT after a Timed lock expires.
    ///         Abyssal locks revert here forever — by design there is no
    ///         other withdrawal function to try.
    function withdrawPrincipal() external {
        if (lockMode == LaunchCertificate.LockMode.Abyssal) {
            revert AbyssalNeverUnlocks();
        }
        if (msg.sender != creator) revert NotCreator();
        if (!hasPosition) revert NoPosition();
        if (block.timestamp < unlockTime) revert StillLocked(unlockTime);
        hasPosition = false;
        IERC721(positionCollection).safeTransferFrom(address(this), creator, positionTokenId);
        emit PrincipalWithdrawn(creator, positionTokenId);
    }
}
