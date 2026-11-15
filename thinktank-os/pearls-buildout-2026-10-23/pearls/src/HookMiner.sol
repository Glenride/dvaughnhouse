// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";

/// @title HookMiner
/// @notice Deterministic CREATE2 salt miner for Uniswap v4 hook permission bits.
/// @dev Uniswap v4 encodes hook callback permissions in the low 14 bits
///      (`Hooks.ALL_HOOK_MASK`) of the deployed hook contract's address.
///      This library precomputes the `initCodeHash` once and mines the first
///      salt whose resulting CREATE2 address matches the required permission
///      flags and has no existing bytecode, reusing a fixed 85-byte memory
///      region so on-chain factory launches incur zero quadratic memory
///      expansion gas.
library HookMiner {
    /// @notice Mask for the bottom 14 bits of a v4 hook address.
    uint160 internal constant FLAG_MASK = Hooks.ALL_HOOK_MASK;

    /// @notice Maximum number of salt iterations before reverting.
    uint256 internal constant MAX_LOOP = 160_444;

    error SaltNotFound(uint160 flags);

    /// @notice Find a CREATE2 salt that deploys a hook with `flags` in its low 14 bits.
    /// @param deployer The address that will execute CREATE2 (`address(this)` in a factory or test,
    ///        or `0x4e59b44847b379578588920cA78FbF26c0B4956C` in a `forge script`).
    /// @param flags Desired low-14-bit hook permission flags.
    /// @param creationCode Contract creation bytecode (`type(TCHook).creationCode`).
    /// @param constructorArgs ABI-encoded constructor arguments.
    /// @return hookAddress The predicted CREATE2 deployment address.
    /// @return salt The salt to pass to `new TCHook{salt: salt}(...)`.
    function find(
        address deployer,
        uint160 flags,
        bytes memory creationCode,
        bytes memory constructorArgs
    ) internal view returns (address hookAddress, bytes32 salt) {
        uint160 targetFlags = flags & FLAG_MASK;
        bytes32 initCodeHash = keccak256(bytes.concat(creationCode, constructorArgs));
        uint256 mask = uint256(FLAG_MASK);
        uint256 target = uint256(targetFlags);
        uint256 maxLoop = MAX_LOOP;
        bool found = false;

        assembly ("memory-safe") {
            let ptr := mload(0x40)
            // Layout in memory starting at ptr + 0x0b (85 bytes total):
            //   [ptr + 0x0b]       : 0xff (1 byte)
            //   [ptr + 0x0c..0x1f] : deployer (20 bytes)
            //   [ptr + 0x20..0x3f] : salt (32 bytes)
            //   [ptr + 0x40..0x5f] : initCodeHash (32 bytes)
            mstore(
                ptr,
                or(
                    0xff0000000000000000000000000000000000000000,
                    and(deployer, 0xffffffffffffffffffffffffffffffffffffffff)
                )
            )
            mstore(add(ptr, 0x40), initCodeHash)

            for { let s := 0 } lt(s, maxLoop) { s := add(s, 1) } {
                mstore(add(ptr, 0x20), s)
                let addr := and(keccak256(add(ptr, 0x0b), 0x55), 0xffffffffffffffffffffffffffffffffffffffff)
                if eq(and(addr, mask), target) {
                    if iszero(extcodesize(addr)) {
                        hookAddress := addr
                        salt := s
                        found := 1
                        break
                    }
                }
            }
        }

        if (!found) revert SaltNotFound(targetFlags);
    }

    /// @notice Compute the CREATE2 address for `deployer`, `salt`, and `initCodeHash`.
    function computeAddress(
        address deployer,
        uint256 salt,
        bytes32 initCodeHash
    ) internal pure returns (address hookAddress) {
        return address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), deployer, bytes32(salt), initCodeHash))))
        );
    }
}
