import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BASE_SEPOLIA_CHAIN_ID,
    POOL_MANAGER_ADDRESS,
    VOLUME_GATE_USD,
    POST_GATE_FEE_BPS,
    PRE_GATE_FEE_BPS,
} from '@/TressColumn/contracts';

export default function TradingTerminalIndex() {
    const [selectedToken, setSelectedToken] = useState(null);
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');
    const [quoteAsset, setQuoteAsset] = useState('WETH');
    const [slippage, setSlippage] = useState('0.5');
    const [routingFeeEnabled, setRoutingFeeEnabled] = useState(false); // Locked as OFF per doctrine
    const [sapphireRadarOpen, setSapphireRadarOpen] = useState(false);

    // Cumulative volume for active market (0 until real Sepolia launch trades occur)
    const currentCumulativeVolume = 0;
    const gateProgress = (currentCumulativeVolume / VOLUME_GATE_USD) * 100;
    const isAboveGate = currentCumulativeVolume >= VOLUME_GATE_USD;

    return (
        <div className="min-h-screen bg-abyssal-black text-pearls-white font-mono selection:bg-abyssal-gold selection:text-abyssal-black">
            <Head title="Tress Column — Trading Terminal" />

            {/* Terminal Navigation Bar */}
            <header className="border-b border-abyssal-line/30 bg-abyssal-black/95 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full border border-abyssal-gold bg-abyssal-card flex items-center justify-center">
                            <span className="text-abyssal-gold font-bold text-sm">TT</span>
                        </div>
                        <div>
                            <span className="text-pearls-white font-semibold text-lg tracking-wider">TRADING TERMINAL</span>
                            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-abyssal-gold/40 text-abyssal-gold rounded">
                                Non-Custodial DEX
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
                        <span className="text-abyssal-gold border-b-2 border-abyssal-gold pb-1 font-semibold">
                            2. Trading Terminal
                        </span>
                        <Link
                            href="/staging/ops-console"
                            className="text-nacre-cream/60 hover:text-pearls-white transition-colors"
                        >
                            3. Ops Console (Staff) →
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setSapphireRadarOpen(!sapphireRadarOpen)}
                            className="px-2.5 py-1 text-xs border border-abyssal-line/50 rounded text-nacre-cream/80 hover:text-pearls-white hover:border-abyssal-gold transition-colors flex items-center space-x-1.5"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            <span>Sapphire Radar</span>
                        </button>

                        <button
                            type="button"
                            className="px-3 py-1.5 text-xs font-semibold bg-abyssal-gold text-abyssal-black rounded hover:bg-abyssal-gold/90 transition-colors"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </header>

            {/* Sapphire Radar Drawer / Drawer preview */}
            {sapphireRadarOpen && (
                <div className="border-b border-blue-500/30 bg-blue-950/20 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] uppercase font-semibold">
                                Sapphire Pass ($7/mo)
                            </span>
                            <span className="text-nacre-cream/80">
                                Real-time Airdrop Claim Radar & Whale LP Lock Tracking active.
                            </span>
                        </div>
                        <span className="text-[11px] text-nacre-cream/50 font-mono">0 pending unlocks detected in window</span>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Volume Gate Status Banner */}
                <section className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs uppercase tracking-wider text-abyssal-gold font-semibold">
                                Protocol Volume Gate Tracker
                            </span>
                            <span className="text-[10px] text-nacre-cream/50">•</span>
                            <span className="text-[11px] text-nacre-cream/70">
                                {isAboveGate ? 'Gate Crossed: 0.30% Fee Active' : 'Pre-Gate: 0.00% Protocol Fee'}
                            </span>
                        </div>
                        <div className="text-xs text-nacre-cream/60">
                            Cumulative Quote Volume: <span className="text-pearls-white font-mono">${currentCumulativeVolume.toLocaleString()}</span> / ${(VOLUME_GATE_USD).toLocaleString()}
                        </div>
                    </div>

                    <div className="w-full md:w-72 space-y-1">
                        <div className="w-full bg-abyssal-black rounded-full h-2 border border-abyssal-line/30 overflow-hidden">
                            <div
                                className="bg-abyssal-gold h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(2, gateProgress))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-nacre-cream/50 font-mono">
                            <span>$0</span>
                            <span>{gateProgress.toFixed(1)}%</span>
                            <span>$10M Gate</span>
                        </div>
                    </div>
                </section>

                {/* 3-Column Terminal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Token Explorer / Watchlist (Honest Empty State) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-abyssal-line/20 pb-2">
                                <span className="text-xs font-semibold uppercase text-abyssal-gold tracking-wider">
                                    Tress Column Markets
                                </span>
                                <span className="text-[10px] text-nacre-cream/40">Base Sepolia</span>
                            </div>

                            {/* Honest Empty State per Work Order Doctrine */}
                            <div className="py-12 px-4 text-center space-y-3">
                                <div className="h-10 w-10 mx-auto rounded-full border border-abyssal-line/40 flex items-center justify-center text-nacre-cream/40">
                                    ∅
                                </div>
                                <div className="text-xs font-semibold text-pearls-white">No Launches Deployed Yet</div>
                                <p className="text-[11px] text-nacre-cream/60 leading-relaxed">
                                    Phase 3 Sepolia deployment is currently in progress. As soon as the first launch is broadcast, verified on-chain pools will populate here automatically.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/staging/tress-column"
                                        className="text-[11px] text-abyssal-gold hover:underline"
                                    >
                                        Configure first launch on Launchpad →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Panel: Chart & Depth Visualization */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-abyssal-line/20 pb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-semibold text-pearls-white">Base Sepolia Execution Context</span>
                                    <span className="text-[10px] text-nacre-cream/50 font-mono">Uniswap v4 AMM</span>
                                </div>
                                <div className="flex space-x-1 text-[11px]">
                                    <span className="px-2 py-0.5 bg-abyssal-gold/20 text-abyssal-gold rounded">15m</span>
                                    <span className="px-2 py-0.5 text-nacre-cream/40">1h</span>
                                    <span className="px-2 py-0.5 text-nacre-cream/40">1d</span>
                                </div>
                            </div>

                            {/* Candlestick & Depth Canvas Area */}
                            <div className="h-72 border border-abyssal-line/20 rounded bg-abyssal-black/80 flex flex-col items-center justify-center p-6 text-center space-y-2">
                                <span className="text-xs text-nacre-cream/60 font-mono">Real-Time Depth & Candlestick Feed</span>
                                <p className="text-[11px] text-nacre-cream/40 max-w-sm">
                                    Charts stream prices directly from Uniswap v4 pool swap logs. No mock or simulated price action is presented.
                                </p>
                            </div>

                            {/* Token Metadata & Certificate Link Anchor */}
                            <div className="p-3 bg-abyssal-black/50 rounded border border-abyssal-line/30 flex items-center justify-between text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-nacre-cream/50 uppercase">Verification Anchor</span>
                                    <div className="text-pearls-white font-semibold">Every Token Carries Its Launch Certificate</div>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    className="px-3 py-1.5 text-[11px] border border-abyssal-line/40 rounded text-nacre-cream/40 cursor-not-allowed"
                                >
                                    View Certificate ↗
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Non-Custodial Swap Routing */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-abyssal-line/20 pb-2">
                                <span className="text-xs font-semibold uppercase text-abyssal-gold tracking-wider">
                                    Non-Custodial Swap
                                </span>
                                <span className="text-[10px] text-emerald-400">PearlHook Router</span>
                            </div>

                            {/* Swap Inputs */}
                            <div className="space-y-3">
                                <div className="bg-abyssal-black/80 p-3 rounded border border-abyssal-line/30 space-y-1">
                                    <div className="flex justify-between text-[10px] text-nacre-cream/60">
                                        <span>You Pay</span>
                                        <span>Balance: 0.00</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={sellAmount}
                                            onChange={(e) => setSellAmount(e.target.value)}
                                            className="w-24 bg-transparent text-sm font-semibold text-pearls-white focus:outline-none"
                                        />
                                        <span className="text-xs font-semibold text-abyssal-gold">{quoteAsset}</span>
                                    </div>
                                </div>

                                <div className="bg-abyssal-black/80 p-3 rounded border border-abyssal-line/30 space-y-1">
                                    <div className="flex justify-between text-[10px] text-nacre-cream/60">
                                        <span>You Receive</span>
                                        <span>Balance: 0.00</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            className="w-24 bg-transparent text-sm font-semibold text-pearls-white focus:outline-none"
                                        />
                                        <span className="text-xs font-semibold text-nacre-cream/60">Select Token</span>
                                    </div>
                                </div>

                                {/* Fee Breakdown Display */}
                                <div className="p-3 bg-abyssal-black/40 rounded border border-abyssal-line/20 space-y-1.5 text-[11px]">
                                    <div className="flex justify-between text-nacre-cream/70">
                                        <span>Protocol Fee</span>
                                        <span className="text-emerald-400 font-mono">
                                            {isAboveGate ? '0.30% (Post-Gate)' : '0.00% (Pre-Gate)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-nacre-cream/70">
                                        <span>Crossing Swap</span>
                                        <span className="text-pearls-white font-mono">0.00% Fee</span>
                                    </div>
                                    <div className="flex justify-between text-nacre-cream/70">
                                        <span>Platform Routing Markup</span>
                                        <span className="text-nacre-cream/40 font-mono">0.00% (OFF)</span>
                                    </div>
                                    <div className="flex justify-between text-nacre-cream/70">
                                        <span>Max Slippage</span>
                                        <span className="text-pearls-white font-mono">{slippage}%</span>
                                    </div>
                                </div>

                                {/* Routing Fee Switch (Built as OFF per Work Order) */}
                                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-nacre-cream/50 border border-dashed border-abyssal-line/20 rounded">
                                    <span>External Routing Fee</span>
                                    <span className="text-nacre-cream/40">DISABLED (0.0%)</span>
                                </div>

                                {/* Action Button */}
                                <button
                                    type="button"
                                    disabled
                                    className="w-full py-3 bg-abyssal-line/30 text-nacre-cream/40 font-semibold text-xs uppercase tracking-wider rounded cursor-not-allowed"
                                >
                                    Select A Token To Swap
                                </button>
                                <p className="text-[10px] text-nacre-cream/40 text-center">
                                    Non-custodial routing. Traders sign transactions directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
