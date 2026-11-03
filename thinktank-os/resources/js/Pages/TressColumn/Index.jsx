import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BASE_SEPOLIA_CHAIN_ID,
    POOL_MANAGER_ADDRESS,
    TEST_SAFE_TREASURY_ADDRESS,
    VOLUME_GATE_USD,
    POST_GATE_FEE_BPS,
    MIN_TIMED_LOCK_DAYS,
    AIRDROP_CAMPAIGN_FEE_ETH,
} from '@/TressColumn/contracts';

export default function TressColumnIndex() {
    const [tokenName, setTokenName] = useState('Example Token');
    const [tokenSymbol, setTokenSymbol] = useState('TXT');
    const [totalSupply, setTotalSupply] = useState('1,000,000,000');
    const [lockMode, setLockMode] = useState('Abyssal'); // 'Abyssal' | 'Timed'
    const [timedDays, setTimedDays] = useState(180);
    const [vestingBps, setVestingBps] = useState(1000); // 10%
    const [airdropBps, setAirdropBps] = useState(500); // 5%
    const [quoteAsset, setQuoteAsset] = useState('WETH');

    const liquidityBps = 10000 - vestingBps - airdropBps;

    return (
        <div className="min-h-screen bg-abyssal-black text-pearls-white font-mono selection:bg-abyssal-gold selection:text-abyssal-black">
            <Head title="Tress Column — Fair Launch Protocol" />

            {/* Navigation Bar */}
            <header className="border-b border-abyssal-line/30 bg-abyssal-black/95 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full border border-abyssal-gold bg-abyssal-card flex items-center justify-center">
                            <span className="text-abyssal-gold font-bold text-sm">TC</span>
                        </div>
                        <div>
                            <span className="text-pearls-white font-semibold text-lg tracking-wider">TRESS COLUMN</span>
                            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-abyssal-gold/40 text-abyssal-gold rounded">
                                Base Sepolia
                            </span>
                        </div>
                    </div>

                    {/* Interlocking Apps Nav */}
                    <nav className="flex items-center space-x-6 text-xs uppercase tracking-wider">
                        <span className="text-abyssal-gold border-b-2 border-abyssal-gold pb-1 font-semibold">
                            1. Launchpad
                        </span>
                        <Link
                            href="/staging/terminal"
                            className="text-nacre-cream/60 hover:text-pearls-white transition-colors"
                        >
                            2. Trading Terminal →
                        </Link>
                        <Link
                            href="/staging/ops-console"
                            className="text-nacre-cream/60 hover:text-pearls-white transition-colors"
                        >
                            3. Ops Console (Staff) →
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-nacre-cream/70 font-mono">Chain ID: {BASE_SEPOLIA_CHAIN_ID}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                {/* Hero Doctrine Banner */}
                <section className="border border-abyssal-line bg-abyssal-card/60 p-8 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-abyssal-gold/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center space-x-2 text-xs text-abyssal-gold tracking-widest uppercase">
                            <span>Protocol Invariant</span>
                            <span>•</span>
                            <span>Rules Fixed at Inception</span>
                        </div>
                        <h1 className="text-3xl font-display font-medium text-pearls-white leading-tight">
                            Fair-launch token deployment on Base.
                        </h1>
                        <p className="text-nacre-cream/80 text-sm leading-relaxed">
                            Every choice is public, locked at inception, and printed directly to an immutable on-chain certificate.
                            No platform fee until <span className="text-abyssal-gold font-semibold">${(VOLUME_GATE_USD / 1_000_000).toFixed(0)}M</span> cumulative volume;
                            then exactly <span className="text-abyssal-gold font-semibold">0.30%</span> in quote asset only.
                            No admin keys, no pause, no setters, no proxies.
                        </p>
                    </div>
                </section>

                {/* Launchpad Two-Column Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Column 1: Configuration Wizard */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold border-b border-abyssal-line/30 pb-3">
                                Token Configuration Wizard
                            </h2>

                            {/* Token Identity */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-nacre-cream/70">Token Name</label>
                                    <input
                                        type="text"
                                        value={tokenName}
                                        onChange={(e) => setTokenName(e.target.value)}
                                        className="w-full bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-sm text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-nacre-cream/70">Symbol / Ticker</label>
                                    <input
                                        type="text"
                                        value={tokenSymbol}
                                        onChange={(e) => setTokenSymbol(e.target.value)}
                                        className="w-full bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-sm text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    />
                                </div>
                            </div>

                            {/* Supply & Quote Asset */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-nacre-cream/70">Total Supply</label>
                                    <input
                                        type="text"
                                        value={totalSupply}
                                        onChange={(e) => setTotalSupply(e.target.value)}
                                        className="w-full bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-sm text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-nacre-cream/70">Pair Quote Asset</label>
                                    <select
                                        value={quoteAsset}
                                        onChange={(e) => setQuoteAsset(e.target.value)}
                                        className="w-full bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-sm text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    >
                                        <option value="WETH">WETH (Wrapped Ether)</option>
                                        <option value="USDC">USDC (USD Coin)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Distribution Split */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-nacre-cream/70">Distribution Allocation</span>
                                    <span className="text-abyssal-gold font-mono">Total: 100%</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-abyssal-black/70 p-3 rounded border border-abyssal-line/30 space-y-1">
                                        <span className="text-[10px] text-nacre-cream/50 uppercase">Liquidity Pool</span>
                                        <div className="text-sm font-semibold text-emerald-400">
                                            {(liquidityBps / 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="bg-abyssal-black/70 p-3 rounded border border-abyssal-line/30 space-y-1">
                                        <span className="text-[10px] text-nacre-cream/50 uppercase">Vesting Vault</span>
                                        <input
                                            type="number"
                                            value={vestingBps / 100}
                                            onChange={(e) => setVestingBps(Math.max(0, Math.min(5000, Number(e.target.value) * 100)))}
                                            className="w-full bg-transparent text-sm font-semibold text-pearls-white border-b border-abyssal-line focus:outline-none focus:border-abyssal-gold"
                                        />
                                    </div>
                                    <div className="bg-abyssal-black/70 p-3 rounded border border-abyssal-line/30 space-y-1">
                                        <span className="text-[10px] text-nacre-cream/50 uppercase">Airdrop Merkle</span>
                                        <input
                                            type="number"
                                            value={airdropBps / 100}
                                            onChange={(e) => setAirdropBps(Math.max(0, Math.min(2000, Number(e.target.value) * 100)))}
                                            className="w-full bg-transparent text-sm font-semibold text-pearls-white border-b border-abyssal-line focus:outline-none focus:border-abyssal-gold"
                                        />
                                    </div>
                                </div>
                                {airdropBps > 0 && (
                                    <div className="text-[11px] text-nacre-cream/60 flex items-center justify-between bg-abyssal-black/40 px-3 py-1.5 rounded border border-abyssal-line/20">
                                        <span>Campaign Fee: {AIRDROP_CAMPAIGN_FEE_ETH} ETH flat (forwarded to treasury Safe)</span>
                                    </div>
                                )}
                            </div>

                            {/* Lock Custody Mode */}
                            <div className="space-y-3 pt-2">
                                <label className="text-xs text-nacre-cream/70">Liquidity Lock Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setLockMode('Abyssal')}
                                        className={`p-3 rounded border text-left transition-colors ${
                                            lockMode === 'Abyssal'
                                                ? 'border-abyssal-gold bg-abyssal-gold/10'
                                                : 'border-abyssal-line/40 bg-abyssal-black hover:border-abyssal-line'
                                        }`}
                                    >
                                        <div className="font-semibold text-xs text-pearls-white">Abyssal Lock</div>
                                        <div className="text-[11px] text-nacre-cream/60 mt-1">
                                            Permanent. Principal can never leave. No withdrawal function exists.
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setLockMode('Timed')}
                                        className={`p-3 rounded border text-left transition-colors ${
                                            lockMode === 'Timed'
                                                ? 'border-abyssal-gold bg-abyssal-gold/10'
                                                : 'border-abyssal-line/40 bg-abyssal-black hover:border-abyssal-line'
                                        }`}
                                    >
                                        <div className="font-semibold text-xs text-pearls-white">Timed Lock</div>
                                        <div className="text-[11px] text-nacre-cream/60 mt-1">
                                            Factory-enforced floor of ≥ {MIN_TIMED_LOCK_DAYS} days before creator withdrawal.
                                        </div>
                                    </button>
                                </div>

                                {lockMode === 'Timed' && (
                                    <div className="mt-2 space-y-1">
                                        <label className="text-[11px] text-nacre-cream/60">Lock Duration (Days, min {MIN_TIMED_LOCK_DAYS})</label>
                                        <input
                                            type="number"
                                            min={MIN_TIMED_LOCK_DAYS}
                                            value={timedDays}
                                            onChange={(e) => setTimedDays(Math.max(MIN_TIMED_LOCK_DAYS, Number(e.target.value)))}
                                            className="w-full bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-1.5 text-xs text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Launch Action */}
                            <div className="pt-4 border-t border-abyssal-line/30">
                                <button
                                    type="button"
                                    className="w-full py-3 bg-abyssal-gold text-abyssal-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-abyssal-gold/90 transition-colors shadow-lg"
                                >
                                    Review & Broadcast Launch (1-Tx Atomic Deploy)
                                </button>
                                <p className="text-[10px] text-nacre-cream/50 text-center mt-2">
                                    Simulates via local Foundry rehearsal on Base Sepolia before execution.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Live On-Chain Certificate Preview */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="border border-abyssal-gold/60 bg-abyssal-card/70 p-6 rounded-lg relative shadow-2xl">
                            <div className="flex items-center justify-between border-b border-abyssal-gold/30 pb-3">
                                <span className="text-[11px] uppercase tracking-widest text-abyssal-gold font-semibold">
                                    Launch Certificate
                                </span>
                                <span className="text-[10px] text-nacre-cream/60">ERC-721 Stored Record</span>
                            </div>

                            <div className="mt-6 space-y-4 font-mono text-xs">
                                <div>
                                    <div className="text-[10px] text-nacre-cream/50 uppercase">Token Asset</div>
                                    <div className="text-base font-semibold text-pearls-white">
                                        {tokenName} ({tokenSymbol})
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] text-nacre-cream/50 uppercase">Supply</div>
                                        <div className="text-pearls-white">{totalSupply}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-nacre-cream/50 uppercase">Quote Pair</div>
                                        <div className="text-pearls-white">{quoteAsset} / Uniswap v4</div>
                                    </div>
                                </div>

                                <div className="border-t border-abyssal-line/20 pt-3">
                                    <div className="text-[10px] text-nacre-cream/50 uppercase">Lock Mode</div>
                                    <div className="text-pearls-white flex items-center justify-between">
                                        <span>{lockMode} Lock</span>
                                        <span className="text-abyssal-gold text-[11px]">
                                            {lockMode === 'Abyssal' ? 'Principal Irrevocable' : `${timedDays} Days`}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-abyssal-line/20 pt-3">
                                    <div className="text-[10px] text-nacre-cream/50 uppercase">Volume Gate Doctrine</div>
                                    <div className="text-pearls-white space-y-1">
                                        <div className="flex justify-between">
                                            <span>Sub-$10M Volume:</span>
                                            <span className="text-emerald-400">0.00% Platform Fee</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>At/Above Gate:</span>
                                            <span className="text-abyssal-gold">0.30% in Quote Asset</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Crossing Swap:</span>
                                            <span className="text-pearls-white">0.00% (No Double Count)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-abyssal-line/20 pt-3">
                                    <div className="text-[10px] text-nacre-cream/50 uppercase">Verified Treasury Safe</div>
                                    <div className="text-[11px] text-nacre-cream/80 truncate">
                                        {TEST_SAFE_TREASURY_ADDRESS}
                                    </div>
                                </div>

                                <div className="border-t border-abyssal-line/20 pt-3">
                                    <div className="text-[10px] text-nacre-cream/50 uppercase">Canonical PoolManager</div>
                                    <div className="text-[11px] text-nacre-cream/80 truncate">
                                        {POOL_MANAGER_ADDRESS}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-abyssal-gold/20 flex items-center justify-between text-[10px] text-nacre-cream/40">
                                <span>Attested at inception</span>
                                <span>Tress Column v1.0</span>
                            </div>
                        </div>

                        {/* Public Trust Notice */}
                        <div className="p-4 bg-abyssal-card/30 border border-abyssal-line/20 rounded text-[11px] text-nacre-cream/70 space-y-2">
                            <div className="font-semibold text-pearls-white uppercase tracking-wider">Independent Verification</div>
                            <p>
                                Every certificate is backed by immutable contract storage on Base. If you need assistance inspecting contract bytecode, you can ask the Assistant.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
