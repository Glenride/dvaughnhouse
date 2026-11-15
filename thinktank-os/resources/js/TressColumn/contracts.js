// Tress Column — Canonical Contract Addresses & Protocol Parameters
// Network: Base Sepolia (Chain ID 84532) & Local Anvil (Chain ID 31337)

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const ANVIL_CHAIN_ID = 31337;
export const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';
export const FORK_VERIFICATION_BLOCK = 49_250_000;

// Canonical Uniswap v4 PoolManager on Base Sepolia (84532)
export const POOL_MANAGER_ADDRESS = '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408';

// Deployed Base Sepolia Split Factories & LaunchCertificate (Block 56205845, 2026-11-08)
export const DISTRIBUTION_FACTORY_ADDRESS = '0x458CfD3df75Af034C1218412E8F2489F9e9C9289'; // Part 1 (17,984 bytes)
export const HOOK_CERTIFICATE_FACTORY_ADDRESS = '0x41422D19640660fb85739394b110C02622b397F9'; // Part 2 (17,798 bytes)
export const LAUNCH_CERTIFICATE_ADDRESS = '0xD32F1F5B18B6419CeeEe0eEDE2f74DbbF035dC84'; // ERC-721 (4,870 bytes)

// TCHook permission flags: BEFORE_SWAP | AFTER_SWAP | BEFORE_SWAP_RETURNS_DELTA | AFTER_SWAP_RETURNS_DELTA
export const TC_HOOK_FLAGS = '0x00CC';
export const PEARL_HOOK_FLAGS = '0x00CC';

// Real Test Safe on Base Sepolia (created in Block 53833347, tx 0x66649425ab7aef19881364c7fce79728820894a003f64bcaf65c5ee213e8b0c0)
// NOTE: Used by Base Sepolia test factories; per-app Safe assignment for live operations awaits D'Vaughn's call.
export const TEST_SAFE_TREASURY_ADDRESS = '0xC0132b5782F129c6d552c6aB725D2341349a084d';
export const TEST_SAFE_TREASURY_APPROVED = false;
export const TEST_SAFE_STATUS_LABEL =
    'Deployed on Base Sepolia (Block 53833347) — Test Safe (Pending per-app Safe assignment approval)';

// Protocol Fee & Gate Parameters (Configured at inception, then immutable)
export const VOLUME_GATE_USD = 10_000_000; // $10M cumulative volume threshold (Platinum locked tier)
export const POST_GATE_FEE_BPS = 30; // 0.30% in quote asset only
export const PRE_GATE_FEE_BPS = 0; // 0.00% below gate
export const CROSSING_SWAP_FEE_BPS = 0; // 0.00% on the swap that crosses the gate
export const TC_POOL_TERMINAL_EXTRA_FEE_BPS = 0; // 0.00% — no additional Tress Column fee on Tress Column pools
export const MIN_TIMED_LOCK_DAYS = 180;
export const AIRDROP_CAMPAIGN_FEE_ETH = '0.0194'; // Flat per campaign (locked 2026-10-25)

// Non-Tress Column Base Token Routing Fee (PRD proposal: 0.05%–0.10% on non-Tress Column Base swaps only)
// PROPOSED, NOT LOCKED — Built as OFF (single deliberate switch; never charged or buried in quotes)
export const NON_TC_ROUTING_FEE_ENABLED = false;
export const NON_TC_ROUTING_FEE_BPS = 0;
export const NON_TC_ROUTING_FEE_PROPOSED_LABEL = '0.05%–0.10% (PROPOSED, NOT LOCKED — BUILT AS OFF)';

// Launch Tier Doctrine (Platinum LOCKED 2026-11-02; Gold PROPOSED; Silver MODELED)
export const LAUNCH_TIERS = {
    PLATINUM: {
        name: 'Platinum',
        status: 'LOCKED (2026-11-02)',
        lpRequirement: 'Abyssal (permanent) or Timed lock >= 180 days',
        volumeGateUsd: 10_000_000,
        postGateFeeLabel: '0.30% in quote asset only',
        isLocked: true,
    },
    GOLD: {
        name: 'Gold',
        status: 'PROPOSED (Not Locked)',
        lpRequirement: 'Proposed tier parameters pending lock',
        volumeGateUsd: 250_000,
        postGateFeeLabel: '0.45% proposed (not locked)',
        isLocked: false,
    },
    SILVER: {
        name: 'Silver',
        status: 'MODELED (Unconfirmed)',
        lpRequirement: 'Unlocked LP (modeled only — exact figure unconfirmed)',
        volumeGateUsd: 20_000,
        postGateFeeLabel: '~0.58% modeled (unconfirmed — not locked)',
        isLocked: false,
    },
};

// Plus+ SaaS Subscription Tiers (Locked 2026-11-02, Monthly only — SaaS / Off-Chain State)
export const PLUS_TIERS = {
    SAPPHIRE: {
        name: 'Sapphire',
        priceMonthly: 7,
        billingCycle: 'Monthly only',
        stateType: 'SaaS / Off-Chain State',
        target: 'Trader',
        features: [
            'Pure Tress Column feed',
            'Airdrop Claim Radar + batch claimer',
            'Whale & LP unlock tracking',
        ],
    },
    EMERALD: {
        name: 'Emerald',
        priceMonthly: 27,
        billingCycle: 'Monthly only',
        stateType: 'SaaS / Off-Chain State',
        target: 'Creator',
        features: [
            'Creator workbench',
            'No-code Merkle snapshot builder',
            'Scout analytics + live trust widget',
            'Watchtower alerts + unlock countdowns',
            'Vanity certificate URLs',
        ],
    },
    RUBY: {
        name: 'Ruby',
        priceMonthly: 97,
        billingCycle: 'Monthly only',
        stateType: 'SaaS / Off-Chain State',
        target: 'Studio',
        features: [
            '1 free AirdropDistributor deploy/month via off-chain rebate',
            'Citadel 24/7 monitoring',
            'Full historical snapshot exports',
            'Priority incident support',
            'Abyssal Gold Studio seal',
        ],
    },
};

// Surface Hosting & Subdomain Architecture
export const APP_SURFACES = {
    LAUNCHPAD: {
        name: 'Tress Column Launchpad',
        domain: 'tc.dvaughnhouse.com',
        stagingPath: '/staging/tress-column',
    },
    TRADING_TERMINAL: {
        name: 'Trading Terminal',
        domain: 'trade.dvaughnhouse.com',
        stagingPath: '/staging/terminal',
        deploymentStatus: 'Preview ready — public deploy held for D\'Vaughn\'s approval',
    },
    OPS_CONSOLE: {
        name: 'Back Office Ops Console',
        domain: 'ops.dvaughnhouse.com',
        stagingPath: '/staging/ops-console',
        deploymentStatus: 'Preview ready behind staging gate — staff deploy held for D\'Vaughn\'s auth + preview approval',
    },
};
