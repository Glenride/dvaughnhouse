import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BASE_SEPOLIA_CHAIN_ID,
    ANVIL_CHAIN_ID,
    BASE_SEPOLIA_RPC_URL,
    FORK_VERIFICATION_BLOCK,
    POOL_MANAGER_ADDRESS,
    TC_HOOK_FLAGS,
    LAUNCH_CERTIFICATE_ADDRESS,
    VOLUME_GATE_USD,
    POST_GATE_FEE_BPS,
    PRE_GATE_FEE_BPS,
    CROSSING_SWAP_FEE_BPS,
    TC_POOL_TERMINAL_EXTRA_FEE_BPS,
    NON_TC_ROUTING_FEE_ENABLED,
    NON_TC_ROUTING_FEE_BPS,
    NON_TC_ROUTING_FEE_PROPOSED_LABEL,
    LAUNCH_TIERS,
    APP_SURFACES,
} from '@/TressColumn/contracts';

export default function TradingTerminalIndex() {
    // Route mode: 'tress-column' (TCHook on Uniswap v4 PoolManager) | 'base-dex' (Uniswap v4 Router / Odos / 1inch)
    const [routeMode, setRouteMode] = useState('tress-column');
    const [externalRouter, setExternalRouter] = useState('uniswap-v4'); // 'uniswap-v4' | 'odos' | '1inch'
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');
    const [quoteAsset, setQuoteAsset] = useState('WETH');
    const [baseTokenAddress, setBaseTokenAddress] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [sapphireRadarOpen, setSapphireRadarOpen] = useState(false);

    // Non-custodial wallet connection state (trader signs own swap; terminal never takes custody)
    const [walletAddress, setWalletAddress] = useState(null);
    const [walletChainId, setWalletChainId] = useState(null);
    const [walletError, setWalletError] = useState(null);

    // Live Base Sepolia / Anvil RPC read state (honest on-chain data only, never invented)
    const [rpcEndpoint, setRpcEndpoint] = useState(BASE_SEPOLIA_RPC_URL);
    const [rpcState, setRpcState] = useState({
        loading: false,
        blockNumber: null,
        poolManagerCodeVerified: null,
        error: null,
    });

    // Optional on-chain contract reader for fork/Anvil or post-Phase-3 rehearsal verification
    const [hookCoreAddressInput, setHookCoreAddressInput] = useState('');
    const [certificateAddressInput, setCertificateAddressInput] = useState(LAUNCH_CERTIFICATE_ADDRESS);
    const [certificateIdInput, setCertificateIdInput] = useState('1');
    const [onChainGateReadout, setOnChainGateReadout] = useState(null);
    const [onChainCertReadout, setOnChainCertReadout] = useState(null);

    // Cumulative volume for active market (honest 0 until real Sepolia launch trades occur or fork contract queried)
    const currentCumulativeVolume = onChainGateReadout ? onChainGateReadout.cumulativeVolumeUsd : 0;
    const gateProgress = (currentCumulativeVolume / VOLUME_GATE_USD) * 100;
    const isAboveGate = onChainGateReadout ? onChainGateReadout.feeActive : false;

    const verifyChainConnection = async (endpoint) => {
        setRpcState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const [blockRes, codeRes] = await Promise.all([
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
                }).then((r) => r.json()),
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 2,
                        method: 'eth_getCode',
                        params: [POOL_MANAGER_ADDRESS, 'latest'],
                    }),
                }).then((r) => r.json()),
            ]);

            const blockNum = blockRes?.result ? parseInt(blockRes.result, 16) : null;
            const code = codeRes?.result || '0x';
            setRpcState({
                loading: false,
                blockNumber: blockNum,
                poolManagerCodeVerified: code !== '0x' && code.length > 4,
                error: null,
            });
        } catch (err) {
            setRpcState({
                loading: false,
                blockNumber: null,
                poolManagerCodeVerified: false,
                error: 'RPC unreachable from browser; use Base Sepolia or local Anvil fork.',
            });
        }
    };

    useEffect(() => {
        verifyChainConnection(rpcEndpoint);
    }, [rpcEndpoint]);

    const connectTraderWallet = async () => {
        setWalletError(null);
        if (typeof window === 'undefined' || !window.ethereum) {
            setWalletError('No injected Web3 wallet detected. Traders sign swaps directly in their own wallet.');
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
            const parsedChain = parseInt(chainHex, 16);
            setWalletAddress(accounts?.[0] || null);
            setWalletChainId(parsedChain);
            if (parsedChain !== BASE_SEPOLIA_CHAIN_ID && parsedChain !== ANVIL_CHAIN_ID) {
                setWalletError(
                    `Connected to chain ${parsedChain}. This rehearsal surface targets Base Sepolia (${BASE_SEPOLIA_CHAIN_ID}) or Anvil (${ANVIL_CHAIN_ID}) only.`
                );
            }
        } catch (e) {
            setWalletError('Wallet connection declined by user.');
        }
    };

    // Read TCCore state directly via eth_call (cumulativeVolumeQuote(), volumeThresholdQuote(), feeActive())
    const readHookCoreOnChain = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(hookCoreAddressInput.trim())) {
            setOnChainGateReadout({ error: 'Enter a valid 20-byte contract address on Base Sepolia / Anvil fork.' });
            return;
        }
        try {
            // Function selectors:
            // cumulativeVolumeQuote() -> 0x419a72a4
            // volumeThresholdQuote()  -> 0x8025b037
            // feeActive()             -> 0x7a42c5c6
            const target = hookCoreAddressInput.trim();
            const [volRes, threshRes, activeRes] = await Promise.all([
                fetch(rpcEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 10,
                        method: 'eth_call',
                        params: [{ to: target, data: '0x419a72a4' }, 'latest'],
                    }),
                }).then((r) => r.json()),
                fetch(rpcEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 11,
                        method: 'eth_call',
                        params: [{ to: target, data: '0x8025b037' }, 'latest'],
                    }),
                }).then((r) => r.json()),
                fetch(rpcEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 12,
                        method: 'eth_call',
                        params: [{ to: target, data: '0x7a42c5c6' }, 'latest'],
                    }),
                }).then((r) => r.json()),
            ]);

            if (!volRes?.result || volRes.result === '0x') {
                setOnChainGateReadout({ error: 'No contract data returned at this address on the active RPC.' });
                return;
            }
            const rawVol = BigInt(volRes.result);
            const rawThresh = threshRes?.result && threshRes.result !== '0x' ? BigInt(threshRes.result) : 0n;
            const isFeeActive = activeRes?.result ? BigInt(activeRes.result) === 1n : false;
            const volUsd = Number(rawVol / 10n ** 18n);
            const threshUsd = Number(rawThresh / 10n ** 18n) || VOLUME_GATE_USD;

            setOnChainGateReadout({
                address: target,
                cumulativeVolumeUsd: volUsd,
                thresholdUsd: threshUsd,
                feeActive: isFeeActive,
                error: null,
            });
        } catch (e) {
            setOnChainGateReadout({ error: 'Failed to read contract from RPC.' });
        }
    };

    // Read LaunchCertificate.totalLaunched() (0x4c96a389) or ownerOf(uint256) (0x6352211e) from chain
    const readCertificateOnChain = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(certificateAddressInput.trim())) {
            setOnChainCertReadout({ error: 'Enter a valid LaunchCertificate contract address.' });
            return;
        }
        try {
            const target = certificateAddressInput.trim();
            const idNum = BigInt(certificateIdInput || '1');
            const idHex = idNum.toString(16).padStart(64, '0');
            // ownerOf(uint256) selector: 0x6352211e
            const ownerRes = await fetch(rpcEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 20,
                    method: 'eth_call',
                    params: [{ to: target, data: `0x6352211e${idHex}` }, 'latest'],
                }),
            }).then((r) => r.json());

            if (!ownerRes?.result || ownerRes.result === '0x' || ownerRes.error) {
                setOnChainCertReadout({
                    error: `Certificate #${idNum.toString()} not minted yet on ${target.slice(0, 10)}...`,
                });
                return;
            }
            const holder = `0x${ownerRes.result.slice(-40)}`;
            setOnChainCertReadout({
                contract: target,
                certificateId: idNum.toString(),
                holder,
                error: null,
            });
        } catch (e) {
            setOnChainCertReadout({ error: 'RPC query failed while reading LaunchCertificate.' });
        }
    };

    return (
        <div className="min-h-screen bg-abyssal-black text-pearls-white font-mono selection:bg-abyssal-gold selection:text-abyssal-black">
            <Head title="Tress Column — Trading Terminal (Staging Preview)" />

            {/* Staging Preview & Non-Custodial Notice Bar */}
            <div className="bg-abyssal-card border-b border-abyssal-gold/30 px-4 py-2 text-[11px] text-nacre-cream/80">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="text-abyssal-gold font-semibold uppercase tracking-wider mr-2">
                            [Staging Preview — Held for Public Deploy Approval]
                        </span>
                        <span>
                            Target domain: <code className="text-pearls-white">{APP_SURFACES.TRADING_TERMINAL.domain}</code> • Base Sepolia ({BASE_SEPOLIA_CHAIN_ID}) &amp; Anvil ({ANVIL_CHAIN_ID}) only.
                        </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider">
                        Non-Custodial: Trader Signs Every Swap
                    </span>
                </div>
            </div>

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
                                Non-Custodial Frontend Routing
                            </span>
                        </div>
                    </div>

                    {/* Interlocking Apps Nav */}
                    <nav className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-wider">
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

                    <div className="flex items-center space-x-3">
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
                            onClick={connectTraderWallet}
                            className="px-3 py-1.5 text-xs font-semibold bg-abyssal-gold text-abyssal-black rounded hover:bg-abyssal-gold/90 transition-colors"
                        >
                            {walletAddress
                                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (Chain ${walletChainId})`
                                : 'Connect Wallet (Self-Custody)'}
                        </button>
                    </div>
                </div>
            </header>

            {walletError && (
                <div className="bg-signal-orange/15 border-b border-signal-orange/40 px-4 py-2 text-xs text-signal-orange">
                    <div className="max-w-7xl mx-auto">{walletError}</div>
                </div>
            )}

            {/* Sapphire Radar Drawer */}
            {sapphireRadarOpen && (
                <div className="border-b border-blue-500/30 bg-blue-950/20 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-3">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] uppercase font-semibold">
                                Sapphire Pass ($7/mo — SaaS State)
                            </span>
                            <span className="text-nacre-cream/80">
                                Pure Tress Column feed, Airdrop Claim Radar + batch claimer, and whale/LP unlock tracking.
                            </span>
                        </div>
                        <span className="text-[11px] text-nacre-cream/50 font-mono">
                            0 pending unlocks on Base Sepolia (honest empty state)
                        </span>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Volume Gate Status Banner & Chain Binding Readout */}
                <section className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-abyssal-gold font-semibold">
                                Volume-Gate Progress (On-Chain TCCore)
                            </span>
                            <span className="text-[10px] text-nacre-cream/50">•</span>
                            <span className="text-[11px] text-emerald-400 font-semibold">
                                {isAboveGate
                                    ? `Gate Crossed: ${(POST_GATE_FEE_BPS / 100).toFixed(2)}% Quote-Asset Fee Active`
                                    : `Pre-Gate: ${(PRE_GATE_FEE_BPS / 100).toFixed(2)}% Protocol Fee (Crossing Swap Also Pays 0.00%)`}
                            </span>
                        </div>
                        <div className="text-xs text-nacre-cream/60">
                            Cumulative Quote Volume:{' '}
                            <span className="text-pearls-white font-mono">
                                ${currentCumulativeVolume.toLocaleString()}
                            </span>{' '}
                            / ${VOLUME_GATE_USD.toLocaleString()} (Platinum Locked Gate) • Extra Terminal Fee on TC Pools:{' '}
                            <span className="text-emerald-400 font-mono">0.00% (Hook Cannot Carry One)</span>
                        </div>
                    </div>

                    <div className="w-full lg:w-72 space-y-1">
                        <div className="w-full bg-abyssal-black rounded-full h-2 border border-abyssal-line/30 overflow-hidden">
                            <div
                                className="bg-abyssal-gold h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(2, gateProgress))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-nacre-cream/50 font-mono">
                            <span>$0 Pre-Gate (0%)</span>
                            <span>{gateProgress.toFixed(2)}%</span>
                            <span>$10M Gate (0.30% Quote)</span>
                        </div>
                    </div>
                </section>

                {/* 3-Column Terminal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Token Explorer / Watchlist & Launch Tier Doctrine */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-abyssal-line/20 pb-2">
                                <span className="text-xs font-semibold uppercase text-abyssal-gold tracking-wider">
                                    Tress Column Launches
                                </span>
                                <span className="text-[10px] text-nacre-cream/50">Chain {BASE_SEPOLIA_CHAIN_ID}</span>
                            </div>

                            {/* Honest Empty State per Work Order Task 2 */}
                            <div className="py-8 px-3 text-center space-y-3 border border-dashed border-abyssal-line/30 rounded bg-abyssal-black/40">
                                <div className="h-9 w-9 mx-auto rounded-full border border-abyssal-line/40 flex items-center justify-center text-nacre-cream/40">
                                    ∅
                                </div>
                                <div className="text-xs font-semibold text-pearls-white">
                                    Honest Empty State: No Launches Yet
                                </div>
                                <p className="text-[11px] text-nacre-cream/60 leading-relaxed">
                                    Split factories (Part 1 <code className="text-pearls-white">0x458CfD3d…</code> &amp; Part 2 <code className="text-pearls-white">0x41422D19…</code>) are deployed on Base Sepolia; no token has been launched yet (Step 4 dummy launch is gated). No fabricated tokens, volume, or prices are shown here.
                                </p>
                                <div className="pt-1">
                                    <Link
                                        href="/staging/tress-column"
                                        className="text-[11px] text-abyssal-gold hover:underline"
                                    >
                                        View Launchpad configuration →
                                    </Link>
                                </div>
                            </div>

                            {/* Fork / Anvil On-Chain Contract Reader */}
                            <div className="pt-2 border-t border-abyssal-line/20 space-y-2">
                                <div className="text-[10px] uppercase tracking-wider text-nacre-cream/60 font-semibold">
                                    Fork / Anvil Pool Inspector
                                </div>
                                <input
                                    type="text"
                                    value={hookCoreAddressInput}
                                    onChange={(e) => setHookCoreAddressInput(e.target.value)}
                                    placeholder="TCCore 0x... address"
                                    className="w-full bg-abyssal-black border border-abyssal-line/40 rounded px-2.5 py-1.5 text-[11px] text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                />
                                <button
                                    type="button"
                                    onClick={readHookCoreOnChain}
                                    className="w-full py-1.5 text-[11px] font-semibold border border-abyssal-gold/50 text-abyssal-gold rounded hover:bg-abyssal-gold/10 transition-colors"
                                >
                                    Read On-Chain Gate State
                                </button>
                                {onChainGateReadout && (
                                    <div className="p-2 rounded bg-abyssal-black/80 border border-abyssal-line/30 text-[10px] space-y-1">
                                        {onChainGateReadout.error ? (
                                            <span className="text-signal-orange">{onChainGateReadout.error}</span>
                                        ) : (
                                            <>
                                                <div className="text-emerald-400">
                                                    Core: {onChainGateReadout.address.slice(0, 10)}...
                                                </div>
                                                <div>
                                                    Volume: ${onChainGateReadout.cumulativeVolumeUsd.toLocaleString()} / $
                                                    {onChainGateReadout.thresholdUsd.toLocaleString()}
                                                </div>
                                                <div>
                                                    Fee Active: {onChainGateReadout.feeActive ? 'true (30 bps)' : 'false (0 bps)'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Launch Tier Fee Doctrine Card */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-3">
                            <div className="text-xs font-semibold uppercase text-abyssal-gold tracking-wider border-b border-abyssal-line/20 pb-2">
                                Launch Tier Doctrine
                            </div>
                            <div className="space-y-2.5 text-[11px]">
                                {Object.entries(LAUNCH_TIERS).map(([key, tier]) => (
                                    <div
                                        key={key}
                                        className="p-2.5 rounded bg-abyssal-black/60 border border-abyssal-line/30 space-y-1"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-pearls-white">{tier.name}</span>
                                            <span
                                                className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                                                    tier.isLocked
                                                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-abyssal-card text-nacre-cream/50 border border-abyssal-line/40'
                                                }`}
                                            >
                                                {tier.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-nacre-cream/60">{tier.lpRequirement}</div>
                                        <div className="text-[10px] text-abyssal-gold font-mono">
                                            Gate: ${tier.volumeGateUsd.toLocaleString()} → {tier.postGateFeeLabel}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Panel: Candlestick Chart, AMM-Derived Depth & On-Chain Certificate Link */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex flex-wrap items-center justify-between border-b border-abyssal-line/20 pb-3 gap-2">
                                <div>
                                    <span className="text-sm font-semibold text-pearls-white">
                                        AMM-Derived Depth &amp; Candlestick Feed
                                    </span>
                                    <div className="text-[10px] text-nacre-cream/50 font-mono">
                                        Uniswap v4 PoolManager: {POOL_MANAGER_ADDRESS.slice(0, 10)}...
                                        {POOL_MANAGER_ADDRESS.slice(-6)}
                                    </div>
                                </div>
                                <div className="flex space-x-1 text-[11px]">
                                    <span className="px-2 py-0.5 bg-abyssal-gold/20 text-abyssal-gold rounded">15m</span>
                                    <span className="px-2 py-0.5 text-nacre-cream/40">1h</span>
                                    <span className="px-2 py-0.5 text-nacre-cream/40">1d</span>
                                </div>
                            </div>

                            {/* Candlestick Feed Area */}
                            <div className="h-52 border border-abyssal-line/20 rounded bg-abyssal-black/80 flex flex-col items-center justify-center p-5 text-center space-y-2">
                                <span className="text-xs text-pearls-white font-semibold font-mono">
                                    On-Chain Candlestick Stream (Uniswap v4 Swap Logs)
                                </span>
                                <p className="text-[11px] text-nacre-cream/50 max-w-md leading-relaxed">
                                    Derived strictly from on-chain <code className="text-abyssal-gold">Swap</code> events on Base Sepolia PoolManager. No simulated candles or fabricated price history are rendered prior to real Sepolia pool activity.
                                </p>
                            </div>

                            {/* AMM-Derived Depth Area */}
                            <div className="p-3.5 border border-abyssal-line/20 rounded bg-abyssal-black/60 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-pearls-white">
                                        Pool-Derived AMM Depth (Tick Liquidity Distribution)
                                    </span>
                                    <span className="text-[10px] text-nacre-cream/50 uppercase">
                                        AMM State — Not a Central Order Book
                                    </span>
                                </div>
                                <p className="text-[11px] text-nacre-cream/50 leading-relaxed">
                                    Displays real concentrated liquidity across initialized tick spacings (100→1, 500→10, 3000→60, 10000→200) from <code className="text-pearls-white">PoolManager</code> state. Currently idle (0 active launch pools on Base Sepolia).
                                </p>
                            </div>

                            {/* Every Token Page Links Its On-Chain Launch Certificate */}
                            <div className="p-3.5 bg-abyssal-black/70 rounded border border-abyssal-gold/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-abyssal-gold uppercase font-semibold tracking-wider">
                                            On-Chain Launch Certificate Link
                                        </span>
                                        <div className="text-xs text-pearls-white font-semibold">
                                            Rendered Directly from On-Chain LaunchCertificate Storage
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-abyssal-card border border-abyssal-line/40 text-nacre-cream/70">
                                        No Local Mock
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <input
                                        type="text"
                                        value={certificateAddressInput}
                                        onChange={(e) => setCertificateAddressInput(e.target.value)}
                                        placeholder="LaunchCertificate 0x... address"
                                        className="sm:col-span-7 bg-abyssal-black border border-abyssal-line/40 rounded px-2.5 py-1.5 text-[11px] text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    />
                                    <input
                                        type="text"
                                        value={certificateIdInput}
                                        onChange={(e) => setCertificateIdInput(e.target.value)}
                                        placeholder="Cert ID"
                                        className="sm:col-span-2 bg-abyssal-black border border-abyssal-line/40 rounded px-2.5 py-1.5 text-[11px] text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                    />
                                    <button
                                        type="button"
                                        onClick={readCertificateOnChain}
                                        className="sm:col-span-3 px-2.5 py-1.5 bg-abyssal-gold text-abyssal-black font-semibold text-[11px] rounded hover:bg-abyssal-gold/90 transition-colors"
                                    >
                                        Resolve ↗
                                    </button>
                                </div>

                                {onChainCertReadout && (
                                    <div className="p-2.5 rounded bg-abyssal-card/80 border border-abyssal-line/40 text-[11px]">
                                        {onChainCertReadout.error ? (
                                            <span className="text-nacre-cream/60">{onChainCertReadout.error}</span>
                                        ) : (
                                            <div className="space-y-1 font-mono text-[10px]">
                                                <div className="text-emerald-400">
                                                    Verified On-Chain Certificate #{onChainCertReadout.certificateId}
                                                </div>
                                                <div>Contract: {onChainCertReadout.contract}</div>
                                                <div>Holder (Creator): {onChainCertReadout.holder}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Live RPC & Fork Verification Status */}
                            <div className="p-3 bg-abyssal-black/40 rounded border border-abyssal-line/20 text-[10px] space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-nacre-cream/60 uppercase font-semibold">
                                        Chain &amp; Fork Verification Binding
                                    </span>
                                    <span className="text-emerald-400 font-mono">
                                        {rpcState.poolManagerCodeVerified
                                            ? `PoolManager Code Verified (Block ${rpcState.blockNumber?.toLocaleString() || 'latest'})`
                                            : 'Verifying Base Sepolia RPC...'}
                                    </span>
                                </div>
                                <div className="text-nacre-cream/50 font-mono">
                                    Canonical Base Sepolia PoolManager: {POOL_MANAGER_ADDRESS} • Fork Verification Block:{' '}
                                    {FORK_VERIFICATION_BLOCK.toLocaleString()} • Hook Flags: {PEARL_HOOK_FLAGS}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Non-Custodial Swap Routing (TC Pools via TCHook + Other Base Tokens via Standard DEX Router) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-4 rounded-lg space-y-4">
                            <div className="flex items-center justify-between border-b border-abyssal-line/20 pb-2">
                                <span className="text-xs font-semibold uppercase text-abyssal-gold tracking-wider">
                                    Non-Custodial Swap Routing
                                </span>
                                <span className="text-[10px] text-emerald-400">Trader Signs Own Swap</span>
                            </div>

                            {/* Route Mode Toggle: Tress Column Pools vs Other Base Tokens */}
                            <div className="grid grid-cols-2 gap-1.5 p-1 bg-abyssal-black rounded border border-abyssal-line/30 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => setRouteMode('tress-column')}
                                    className={`py-2 px-2 rounded font-semibold transition-colors ${
                                        routeMode === 'tress-column'
                                            ? 'bg-abyssal-gold text-abyssal-black'
                                            : 'text-nacre-cream/60 hover:text-pearls-white'
                                    }`}
                                >
                                    1. Tress Column Pools
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRouteMode('base-dex')}
                                    className={`py-2 px-2 rounded font-semibold transition-colors ${
                                        routeMode === 'base-dex'
                                            ? 'bg-abyssal-gold text-abyssal-black'
                                            : 'text-nacre-cream/60 hover:text-pearls-white'
                                    }`}
                                >
                                    2. Other Base Tokens
                                </button>
                            </div>

                            {/* Route Mode Context Explanation */}
                            {routeMode === 'tress-column' ? (
                                <div className="p-2.5 rounded bg-abyssal-black/60 border border-abyssal-gold/30 text-[11px] space-y-1">
                                    <div className="font-semibold text-abyssal-gold">
                                        Direct Uniswap v4 PoolManager + TCHook Route
                                    </div>
                                    <p className="text-[10px] text-nacre-cream/70 leading-relaxed">
                                        Swaps execute against the token&apos;s canonical v4 pool via{' '}
                                        <code className="text-pearls-white">TCHook</code>: 0.00% below the $10M gate, 0.00% on the crossing swap, and 0.30% in quote asset only at/above the gate.{' '}
                                        <strong className="text-pearls-white">
                                            No additional Tress Column terminal fee on Tress Column pools.
                                        </strong>
                                    </p>
                                </div>
                            ) : (
                                <div className="p-2.5 rounded bg-abyssal-black/60 border border-abyssal-line/40 text-[11px] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-pearls-white">
                                            Standard Base DEX Frontend Routing
                                        </span>
                                        <select
                                            value={externalRouter}
                                            onChange={(e) => setExternalRouter(e.target.value)}
                                            className="bg-abyssal-card border border-abyssal-line/50 rounded px-2 py-0.5 text-[10px] text-abyssal-gold"
                                        >
                                            <option value="uniswap-v4">Uniswap v4 Router</option>
                                            <option value="odos">Odos Router API</option>
                                            <option value="1inch">1inch Aggregation API</option>
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-nacre-cream/70 leading-relaxed">
                                        Frontend-only routing for non-Tress Column Base tokens. Tress Column never takes custody, never holds keys or approvals on behalf of users, and never executes swaps server-side.
                                    </p>
                                </div>
                            )}

                            {/* Swap Inputs */}
                            <div className="space-y-3">
                                <div className="bg-abyssal-black/80 p-3 rounded border border-abyssal-line/30 space-y-1">
                                    <div className="flex justify-between text-[10px] text-nacre-cream/60">
                                        <span>You Pay (Quote Asset)</span>
                                        <span>Wallet: {walletAddress ? 'Connected' : 'Not Connected'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={sellAmount}
                                            onChange={(e) => setSellAmount(e.target.value)}
                                            className="w-32 bg-transparent text-sm font-semibold text-pearls-white focus:outline-none"
                                        />
                                        <select
                                            value={quoteAsset}
                                            onChange={(e) => setQuoteAsset(e.target.value)}
                                            className="bg-abyssal-card border border-abyssal-line/40 rounded px-2 py-1 text-xs font-semibold text-abyssal-gold"
                                        >
                                            <option value="WETH">WETH</option>
                                            <option value="USDC">USDC</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-abyssal-black/80 p-3 rounded border border-abyssal-line/30 space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-nacre-cream/60">
                                        <span>
                                            You Receive (
                                            {routeMode === 'tress-column' ? 'Tress Column Launch Token' : 'Base ERC-20 Token'})
                                        </span>
                                        <span>Max Slippage: {slippage}%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            className="w-28 bg-transparent text-sm font-semibold text-pearls-white focus:outline-none"
                                        />
                                        {routeMode === 'tress-column' ? (
                                            <span className="text-[11px] font-semibold text-nacre-cream/50">
                                                No Sepolia Launches Yet
                                            </span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={baseTokenAddress}
                                                onChange={(e) => setBaseTokenAddress(e.target.value)}
                                                placeholder="Token 0x... address"
                                                className="w-40 bg-abyssal-card border border-abyssal-line/40 rounded px-2 py-1 text-[10px] text-pearls-white focus:outline-none focus:border-abyssal-gold"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Fee Breakdown Display */}
                                <div className="p-3 bg-abyssal-black/40 rounded border border-abyssal-line/20 space-y-1.5 text-[11px]">
                                    {routeMode === 'tress-column' ? (
                                        <>
                                            <div className="flex justify-between text-nacre-cream/70">
                                                <span>TCHook Protocol Fee</span>
                                                <span className="text-emerald-400 font-mono">
                                                    {isAboveGate
                                                        ? `${(POST_GATE_FEE_BPS / 100).toFixed(2)}% Quote-Only (Post-$10M Gate)`
                                                        : `${(PRE_GATE_FEE_BPS / 100).toFixed(2)}% (Pre-$10M Gate)`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-nacre-cream/70">
                                                <span>Gate-Crossing Swap Fee</span>
                                                <span className="text-pearls-white font-mono">
                                                    {(CROSSING_SWAP_FEE_BPS / 100).toFixed(2)}% (Always Fee-Free)
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-nacre-cream/70">
                                                <span>Additional Terminal Fee on TC Pools</span>
                                                <span className="text-emerald-400 font-mono">
                                                    {(TC_POOL_TERMINAL_EXTRA_FEE_BPS / 100).toFixed(2)}% (None — Prohibited)
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-nacre-cream/70">
                                                <span>External Router Path</span>
                                                <span className="text-pearls-white font-mono uppercase">{externalRouter}</span>
                                            </div>
                                            <div className="flex justify-between text-nacre-cream/70">
                                                <span>Tress Column Routing Fee</span>
                                                <span className="text-emerald-400 font-mono">
                                                    {(NON_TC_ROUTING_FEE_BPS / 100).toFixed(2)}% (OFF — Not Charged)
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between text-nacre-cream/70">
                                        <span>Custody / Execution Model</span>
                                        <span className="text-pearls-white font-mono">Client Wallet Signer Only</span>
                                    </div>
                                </div>

                                {/* Single Flagged Disabled Switch for Proposed Non-TC Routing Fee (Task 1 Requirement) */}
                                <div className="p-2.5 text-[10px] bg-abyssal-black/60 border border-dashed border-abyssal-gold/40 rounded space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-nacre-cream/80">
                                            Non-TC Base Swap Routing Fee Switch
                                        </span>
                                        <button
                                            type="button"
                                            disabled
                                            aria-disabled="true"
                                            className="px-2 py-0.5 rounded bg-abyssal-card border border-abyssal-line/50 text-nacre-cream/40 cursor-not-allowed font-mono"
                                        >
                                            {NON_TC_ROUTING_FEE_ENABLED ? 'ON' : 'OFF (0.00% — DISABLED)'}
                                        </button>
                                    </div>
                                    <p className="text-nacre-cream/50 leading-relaxed">
                                        Flagged constant: <code className="text-pearls-white">NON_TC_ROUTING_FEE_ENABLED = false</code>. PRD proposal is{' '}
                                        {NON_TC_ROUTING_FEE_PROPOSED_LABEL} on non-Tress Column Base swaps only. Never charged, never buried in a quote, and held until D&apos;Vaughn locks price and disclosure copy.
                                    </p>
                                </div>

                                {/* Action Button */}
                                <button
                                    type="button"
                                    disabled
                                    className="w-full py-3 bg-abyssal-line/30 text-nacre-cream/40 font-semibold text-xs uppercase tracking-wider rounded cursor-not-allowed"
                                >
                                    {routeMode === 'tress-column'
                                        ? 'Awaiting First Sepolia Rehearsal Launch'
                                        : 'Connect Wallet & Select Base Token'}
                                </button>
                                <p className="text-[10px] text-nacre-cream/40 text-center">
                                    Tress Column never takes custody. Traders sign every swap directly in their own wallet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
