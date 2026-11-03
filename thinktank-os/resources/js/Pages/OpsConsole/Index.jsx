import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BASE_SEPOLIA_CHAIN_ID,
    POOL_MANAGER_ADDRESS,
    TEST_SAFE_TREASURY_ADDRESS,
    PLUS_TIERS,
    AIRDROP_CAMPAIGN_FEE_ETH,
    VOLUME_GATE_USD,
} from '@/TressColumn/contracts';

export default function OpsConsoleIndex() {
    const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'airdrop' | 'launches' | 'certificates' | 'accounting'

    return (
        <div className="min-h-screen bg-abyssal-black text-pearls-white font-mono selection:bg-abyssal-gold selection:text-abyssal-black">
            <Head title="Tress Column — Back Office Ops Console" />

            {/* Ops Console Header */}
            <header className="border-b border-red-500/30 bg-abyssal-black/95 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full border border-red-500 bg-red-950/40 flex items-center justify-center">
                            <span className="text-red-400 font-bold text-sm">OP</span>
                        </div>
                        <div>
                            <span className="text-pearls-white font-semibold text-lg tracking-wider">OPS CONSOLE</span>
                            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-red-500/40 text-red-400 rounded">
                                Staff / SaaS Operations
                            </span>
                        </div>
                    </div>

                    {/* Interlocking Apps Nav */}
                    <nav className="flex items-center space-x-6 text-xs uppercase tracking-wider">
                        <Link
                            href="/staging/tress-column"
                            className="text-nacre-cream/60 hover:text-pearls-white transition-colors"
                        >
                            ← 1. Launchpad
                        </Link>
                        <Link
                            href="/staging/terminal"
                            className="text-nacre-cream/60 hover:text-pearls-white transition-colors"
                        >
                            ← 2. Trading Terminal
                        </Link>
                        <span className="text-red-400 border-b-2 border-red-400 pb-1 font-semibold">
                            3. Ops Console (Staff)
                        </span>
                    </nav>

                    <div className="flex items-center space-x-3 text-xs text-nacre-cream/60">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Verified Safe: {TEST_SAFE_TREASURY_ADDRESS.slice(0, 6)}...{TEST_SAFE_TREASURY_ADDRESS.slice(-4)}</span>
                    </div>
                </div>
            </header>

            {/* Hard Negatives Notice Banner */}
            <div className="bg-red-950/20 border-b border-red-500/20 px-4 py-2 text-[11px] text-red-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span>
                        <strong>Doctrine:</strong> Zero customer balance custody • No withdrawal approvals • No user freezing • No admin keys or proxies on core contracts.
                    </span>
                    <span className="text-red-400/60 uppercase text-[10px]">Staff-Facing Off-Chain SaaS</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* 5-Module Navigation Tabs */}
                <div className="flex flex-wrap border-b border-abyssal-line/30 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === 'subscriptions'
                                ? 'border-abyssal-gold text-abyssal-gold bg-abyssal-gold/5'
                                : 'border-transparent text-nacre-cream/60 hover:text-pearls-white'
                        }`}
                    >
                        1. Plus+ Subscriptions
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('airdrop')}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === 'airdrop'
                                ? 'border-abyssal-gold text-abyssal-gold bg-abyssal-gold/5'
                                : 'border-transparent text-nacre-cream/60 hover:text-pearls-white'
                        }`}
                    >
                        2. Airdrop Campaigns
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('launches')}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === 'launches'
                                ? 'border-abyssal-gold text-abyssal-gold bg-abyssal-gold/5'
                                : 'border-transparent text-nacre-cream/60 hover:text-pearls-white'
                        }`}
                    >
                        3. Launch Telemetry
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('certificates')}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === 'certificates'
                                ? 'border-abyssal-gold text-abyssal-gold bg-abyssal-gold/5'
                                : 'border-transparent text-nacre-cream/60 hover:text-pearls-white'
                        }`}
                    >
                        4. Certificate Surfacing
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('accounting')}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === 'accounting'
                                ? 'border-abyssal-gold text-abyssal-gold bg-abyssal-gold/5'
                                : 'border-transparent text-nacre-cream/60 hover:text-pearls-white'
                        }`}
                    >
                        5. Treasury Fee Accounting
                    </button>
                </div>

                {/* Module 1: Plus+ Subscriptions */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    Plus+ SaaS Subscription Management
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Off-chain recurring subscription tiers (monthly only). Entitlements update downstream in Terminal and Launchpad.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-abyssal-card border border-abyssal-line/30 rounded text-nacre-cream/70">
                                Off-Chain State
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(PLUS_TIERS).map(([key, tier]) => (
                                <div key={key} className="border border-abyssal-line/40 bg-abyssal-card/40 p-5 rounded-lg space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] uppercase text-nacre-cream/50 tracking-widest">{tier.target} Pass</span>
                                            <div className="text-lg font-semibold text-pearls-white">{tier.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-mono font-bold text-abyssal-gold">${tier.priceMonthly}</div>
                                            <span className="text-[10px] text-nacre-cream/40">/month</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-2 text-xs text-nacre-cream/80 border-t border-abyssal-line/20 pt-3">
                                        {tier.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start space-x-2">
                                                <span className="text-abyssal-gold">•</span>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-2 border-t border-abyssal-line/20 flex justify-between text-[11px] text-nacre-cream/60">
                                        <span>Active Subscribers:</span>
                                        <span className="font-mono text-pearls-white">0 (Pre-Launch)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Module 2: Airdrop Campaigns */}
                {activeTab === 'airdrop' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    Merkle Airdrop Campaign Registry
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Campaign tracking at the locked flat rate of {AIRDROP_CAMPAIGN_FEE_ETH} ETH per deployment.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-abyssal-card border border-abyssal-line/30 rounded text-nacre-cream/70">
                                Flat Fee: {AIRDROP_CAMPAIGN_FEE_ETH} ETH
                            </span>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-4">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">Active Campaigns Registry</div>
                            <div className="p-8 text-center text-xs text-nacre-cream/50 space-y-2">
                                <div>∅ No airdrop campaigns created yet</div>
                                <p className="text-[11px] text-nacre-cream/40 max-w-md mx-auto">
                                    Campaigns are deployed atomically via `LaunchFactory.launch` when airdropBps &gt; 0, requiring exact payment of {AIRDROP_CAMPAIGN_FEE_ETH} ETH forwarded to the treasury Safe.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Module 3: Launch Telemetry (Honest Empty State) */}
                {activeTab === 'launches' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    On-Chain Launch & Locker Telemetry
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Direct telemetry read from Base Sepolia contracts (`LaunchFactory`, `LaunchLocker`, Uniswap v4 `PoolManager`).
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-400">
                                RPC: sepolia.base.org
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Total Launches</span>
                                <div className="text-xl font-bold text-pearls-white">0</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Locked LP Positions</span>
                                <div className="text-xl font-bold text-emerald-400">0</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Cumulative Quote Volume</span>
                                <div className="text-xl font-bold text-abyssal-gold">$0.00</div>
                            </div>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg text-center space-y-3">
                            <div className="text-xs font-semibold text-pearls-white">Telemetry Feed Idle — Awaiting First Rehearsal Launch</div>
                            <p className="text-[11px] text-nacre-cream/60 max-w-lg mx-auto">
                                Phase 3 deployment is awaiting execution. Once the first Sepolia dummy launch is created, live locker state (Abyssal permanent vs Timed unlock countdown) and pool fee accruals will stream here.
                            </p>
                        </div>
                    </div>
                )}

                {/* Module 4: Certificate Surfacing */}
                {activeTab === 'certificates' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    Certificate Surfacing & Audit Verification
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Surfaces on-chain certificate data from the `LaunchCertificate` contract. No certificate can be minted by staff fiat.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-abyssal-card border border-abyssal-line/30 rounded text-nacre-cream/70">
                                ERC-721 Read-Only
                            </span>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-4">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">Search Certificate by ID</div>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    placeholder="Enter Certificate ID (e.g. 1)"
                                    className="bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-xs text-pearls-white w-64 focus:outline-none focus:border-abyssal-gold"
                                />
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-abyssal-gold text-abyssal-black text-xs font-semibold rounded hover:bg-abyssal-gold/90 transition-colors"
                                >
                                    Fetch On-Chain Data
                                </button>
                            </div>
                            <div className="text-[11px] text-nacre-cream/50">
                                Reads immutable metadata, creator address, fee parameters, and locker bindings directly from contract storage.
                            </div>
                        </div>
                    </div>
                )}

                {/* Module 5: Treasury Fee Accounting */}
                {activeTab === 'accounting' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    Treasury Fee Accounting & Chain Reconciliation
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Every fee figure is strictly reconciled to on-chain transaction receipts from the verified Safe treasury.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-400 font-mono">
                                Safe: {TEST_SAFE_TREASURY_ADDRESS.slice(0, 8)}...
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Reconciled Safe Balance</span>
                                <div className="text-xl font-bold text-pearls-white">0.00 ETH</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Protocol Fees Accrued</span>
                                <div className="text-xl font-bold text-abyssal-gold">$0.00 Quote</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">Unreconciled Discrepancies</span>
                                <div className="text-xl font-bold text-emerald-400">0.00 (None)</div>
                            </div>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-3">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">On-Chain Settlement Receipts Ledger</div>
                            <div className="p-8 text-center text-xs text-nacre-cream/50 space-y-2">
                                <div>∅ No settlement receipts recorded on-chain yet</div>
                                <p className="text-[11px] text-nacre-cream/40 max-w-md mx-auto">
                                    All protocol swap fees (0.30% in quote asset post-$10M gate) settle via `poolManager.take()` directly to the treasury Safe. Internal ledgers only cache on-chain receipts; unconfirmed amounts are never counted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
