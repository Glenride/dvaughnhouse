# Pearls — fair-launch platform (contract core)

*There's power in Pearls.*

Pearls is a fair-launch token deployment platform on Base: configure
everything at launch, immutable at deploy, no admin keys. The launch
certificate is "the pearl" — the plain-language, on-chain record of a fair
launch.

**Status: PROTOTYPE — unaudited, testnet/local only.** Nothing in this repo
has been deployed anywhere, and nothing here may be pointed at mainnet.
Deployment is D'Vaughn's gate (spec §11).

## Read first

- **`spec.md`** — the full technical specification: architecture, contract
  inventory, configuration surface, fee logic and the $10M gate, certificate
  and lock design, the TCHook risk assessment, the zero-cost audit path,
  and the Plus+/CoinGuard suite (**designed only, not built**).

## Layout

```
spec.md                  Technical specification v1.0
foundry.toml             Pinned solc 0.8.24 / cancun / via_ir, Base Sepolia RPC slot
src/
  PearlsConstants.sol    Locked constants (0.0194 ETH airdrop fee, 30 bps fee)
  LaunchFactory.sol      One-transaction launches; deploys everything else
  LaunchToken.sol        ERC-20 + Permit, fixed supply, launch-window wallet cap
  LaunchCertificate.sol  ERC-721 "pearl": the frozen launch record
  LaunchLocker.sol       LP position custody: Abyssal (forever) or Timed (>=180d)
  VestingVault.sol       Optional linear vesting + cliff
  AirdropDistributor.sol Merkle airdrops, flat 0.0194 ETH campaign fee
  TCCore.sol      Volume gate + fee + launch-guard accounting (complete, tested)
  TCHook.sol          Uniswap v4 hook adapter (PARTIAL — see spec §7.4)
  ITCHook.sol         The guaranteed hook surface
script/Deploy.s.sol      Factory deploy — hard-gated to chain 84532 / 31337
test/                    33 tests: Pearls.t.sol (core), TCHook.t.sol (hook), Mocks.sol
```

## TCHook status — read this before quoting it

The hook's **accounting** (volume tracking, $10M gate, 0.3% quote-side fee,
max-swap guard) is complete and tested, including the direction-resolution
table for all four swap cases. The **v4 adapter is partial**: it is not
wired to a real PoolManager (no CREATE2 salt mining, no `take()`/settle
settlement, canonical v4-core interfaces not yet pinned). It compiles and
its resolution logic is unit-tested; it would take no fee on a live pool
today. Closing that gap is the integration phase in spec §7.4. Never
describe the hook as done until the fork-test matrix passes.

## Build & test

```bash
export PATH=$HOME/.foundry/bin:$PATH
forge build
forge test
```

Dependencies are pinned via `foundry.lock` (forge-std v1.9.2, OpenZeppelin
v5.0.2), matching the house Foundry pattern.

## Design rules that are not negotiable

- No admin keys, no owners, no setters, no proxies, no upgrade path in any
  core contract. Immutability is the product.
- Platform fee: 0% until $10M cumulative volume, then 0.3% taken strictly
  in the quote asset to the treasury. Pearls never holds or sells a
  launched token.
- Timed locks: 180-day floor, enforced in the factory. Abyssal Lock
  (forever) has no withdrawal function at all.
- The Abyssal Gold (`#D4AF37`) name is used for the certificate seal and
  Studio marks. (The banned word from the v0.6 concept text never appears
  in Pearls artifacts.)
