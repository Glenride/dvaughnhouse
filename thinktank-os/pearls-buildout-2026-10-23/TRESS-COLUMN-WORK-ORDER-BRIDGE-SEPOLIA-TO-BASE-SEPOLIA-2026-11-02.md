# Tress Column work order — Bridge Sepolia ETH to Base Sepolia (AUTHORIZED 2026-11-02 22:38 ET)

Status: AUTHORIZED by D'Vaughn's tap 2026-11-02 22:38 ET ("yeah bridge it now"). Staged byte-identical on the iMac for Antigravity. This order authorizes ONLY the bridge transaction described below — no contract deploy, no Safe wiring, no other transaction.

## Task
Bridge the deployer wallet's existing Ethereum Sepolia ETH to Base Sepolia, testnet only, so Phase 3 has gas.

## Known facts (verified on-chain 2026-11-02)
- Deployer (public address only): 0xE33906173fD81b4b8aB6B6C78Cd2262B15BFEE20
- Ethereum Sepolia (chain 11155111) balance: 0.05 ETH (tx 0xed2939d80c7e519bdfa7de28d167ad79ac6636e8f04f53e78817e99d2d2f9239)
- Base Sepolia (chain 84532) balance: 0.0001 ETH, landed from the Coinbase CDP faucet 2026-11-02 22:37 ET (0x5af3107a4000 wei, verified via RPC https://sepolia.base.org)
- Target: ~0.02–0.05 ETH total on Base Sepolia after the bridge.
- Faucet route to this fresh deployer is blocked: Zalalena rejected verified claims repeatedly ("Please verify again.", drip only 0.001 ETH anyway); QuickNode blocked at address entry for lacking a small mainnet ETH balance; CDP Portal requires a CDP sign-in and drips only 0.0001 ETH per claim. Do NOT retry any faucet for this address as a substitute for the bridge.

## Scope
- Use the official Base Sepolia bridge path only (L1 Sepolia deposit to Base Sepolia). No third-party bridge, no swap, no mainnet, no personal wallet, no other chain.
- Bridge the full 0.05 ETH minus L1 gas, so the Base Sepolia balance after the bridge (plus the existing 0.0001 ETH) lands in the 0.02–0.05 range. Report the exact amount received.
- The deployer key already lives on the iMac in a 0600 gitignored file. Use it there only. Never paste, print, log, or transmit the key, and never put it in chat, Mission Control, git, or any report. Report addresses and transaction hashes only.

## Steps
1. On branch `pearls-buildout` only (never `main`), confirm the deployer Ethereum Sepolia balance on-chain before bridging.
2. Submit the L1→L2 deposit transaction from the deployer address only.
3. Wait for the deposit to land on Base Sepolia and verify the deployer Base Sepolia balance on-chain (RPC https://sepolia.base.org, chain 84532).
4. Report: L1 deposit tx hash + block, L2 receipt/claim if applicable, exact Base Sepolia balance after, and any remaining Ethereum Sepolia balance.

## Then STOP
- Do NOT run any contract deploy, do NOT wire any Safe/treasury into LaunchFactory or Deploy.s.sol, do NOT touch contract code, do NOT touch the canonical tree (~/workspace/your_files/pearls/ untouched).
- Funding verified on-chain is the end of this order. The EIP-170 LaunchFactory-size redesign and the test-Safe approval are separate decisions and are NOT covered here.
- Language check must pass; honest status only — if the bridge fails or lands short, report exactly that, with hashes, and stop.
