// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Flat AirdropDistributor campaign fee: 0.0194 ETH (locked
//         2026-10-21 — 3% below the 0.02 ETH L2 industry average).
//         File-level constant so the factory and the distributor read the
//         exact same value with no cross-contract lookup.
uint256 constant AIRDROP_CAMPAIGN_FEE = 0.0194 ether;

// Protocol fee rate after the $10M gate: 30 bps = 0.3% (locked).
uint16 constant PROTOCOL_FEE_BPS = 30;

// Canonical Uniswap v4 PoolManager deployment on Base Sepolia (chain ID 84532).
address constant BASE_SEPOLIA_POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;

// Required low-14-bit Uniswap v4 hook permission flags for TCHook:
// BEFORE_SWAP_FLAG (1 << 7) | AFTER_SWAP_FLAG (1 << 6) |
// BEFORE_SWAP_RETURNS_DELTA_FLAG (1 << 3) | AFTER_SWAP_RETURNS_DELTA_FLAG (1 << 2) = 0x00CC
uint160 constant TC_HOOK_FLAGS = 0x00CC;
