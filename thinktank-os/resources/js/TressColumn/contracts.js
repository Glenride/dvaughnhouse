// Tress Column — Canonical Contract Addresses & Protocol Parameters
// Network: Base Sepolia (Chain ID 84532)

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org';

// Canonical Uniswap v4 PoolManager on Base Sepolia
export const POOL_MANAGER_ADDRESS = '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408';

// Verified Test Safe Treasury on Base Sepolia (deployed & verified 2026-11-03)
export const TEST_SAFE_TREASURY_ADDRESS = '0xC0132b5782F129c6d552c6aB725D2341349a084d';

// Protocol Fee & Gate Parameters
export const VOLUME_GATE_USD = 10_000_000; // $10M cumulative volume threshold
export const POST_GATE_FEE_BPS = 30; // 0.30% in quote asset only
export const PRE_GATE_FEE_BPS = 0; // 0.00%
export const MIN_TIMED_LOCK_DAYS = 180;
export const AIRDROP_CAMPAIGN_FEE_ETH = '0.0194';

// Plus+ SaaS Subscription Tiers (Monthly only)
export const PLUS_TIERS = {
    SAPPHIRE: {
        name: 'Sapphire',
        priceMonthly: 7,
        target: 'Trader',
        features: [
            'Pure Tress Column market feed',
            'Airdrop Claim Radar & batch claimer',
            'Whale & LP lock tracking alerts',
        ],
    },
    EMERALD: {
        name: 'Emerald',
        priceMonthly: 27,
        target: 'Creator',
        features: [
            'Creator workbench & launch staging',
            'No-code Merkle airdrop snapshot builder',
            'Scout analytics & live trust widget',
            'Watchtower alerts & lock countdowns',
            'Vanity certificate URLs',
        ],
    },
    RUBY: {
        name: 'Ruby',
        priceMonthly: 97,
        target: 'Studio',
        features: [
            '1 free AirdropDistributor deploy/month (via rebate)',
            'Citadel 24/7 automated monitoring',
            'Full historical snapshot exports',
            'Priority incident response support',
            'Abyssal Gold Studio verification seal',
        ],
    },
};
