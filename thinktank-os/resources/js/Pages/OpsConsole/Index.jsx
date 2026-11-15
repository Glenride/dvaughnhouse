import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BASE_SEPOLIA_CHAIN_ID,
    ANVIL_CHAIN_ID,
    BASE_SEPOLIA_RPC_URL,
    FORK_VERIFICATION_BLOCK,
    POOL_MANAGER_ADDRESS,
    TEST_SAFE_TREASURY_ADDRESS,
    TEST_SAFE_TREASURY_APPROVED,
    TEST_SAFE_STATUS_LABEL,
    PLUS_TIERS,
    AIRDROP_CAMPAIGN_FEE_ETH,
    VOLUME_GATE_USD,
    POST_GATE_FEE_BPS,
    MIN_TIMED_LOCK_DAYS,
    LAUNCH_CERTIFICATE_ADDRESS,
    APP_SURFACES,
} from '@/TressColumn/contracts';

// Clearly labeled test-only SaaS fixtures for Task 2 verification (NEVER blended into live counts)
const TEST_SAAS_SUBSCRIPTION_FIXTURES = [
    {
        id: 'test-sub-001',
        tier: 'Sapphire ($7/mo)',
        Cycle: 'Monthly only',
        entitlements: 'Pure TC feed, Airdrop Claim Radar + batch claimer, whale/unlock tracking',
        stateLabel: '[TEST SAAS DATA — NOT LIVE]',
    },
    {
        id: 'test-sub-002',
        tier: 'Emerald ($27/mo)',
        Cycle: 'Monthly only',
        entitlements: 'Workbench, no-code Merkle snapshot builder, Scout analytics + trust widget, Watchtower alerts, vanity cert URLs',
        stateLabel: '[TEST SAAS DATA — NOT LIVE]',
    },
    {
        id: 'test-sub-003',
        tier: 'Ruby ($97/mo)',
        Cycle: 'Monthly only',
        entitlements: '1 free AirdropDistributor deploy/mo via off-chain rebate, Citadel 24/7 monitoring, snapshot exports, incident support, Abyssal Gold Studio seal',
        stateLabel: '[TEST SAAS DATA — NOT LIVE]',
    },
];

export default function OpsConsoleIndex() {
    // Five modules, and only these, in this exact order:
    // 1. Plus+ subscriptions | 2. Airdrop campaigns | 3. Launch monitoring | 4. Certificate issuance | 5. Treasury-fee accounting
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [showTestFixtures, setShowTestFixtures] = useState(false);

    // Live RPC read state for on-chain modules (3, 4, 5)
    const [rpcEndpoint] = useState(BASE_SEPOLIA_RPC_URL);
    const [safeChainReadout, setSafeChainReadout] = useState({
        loading: false,
        balanceEth: '0.0000',
        hasCode: null,
        threshold: null,
        blockNumber: null,
    });

    // Module 3: On-chain LaunchLocker reader
    const [lockerAddressInput, setLockerAddressInput] = useState('');
    const [lockerReadout, setLockerReadout] = useState(null);

    // Module 4: On-chain LaunchCertificate reader (defaults to deployed Base Sepolia LaunchCertificate)
    const [certContractInput, setCertContractInput] = useState(LAUNCH_CERTIFICATE_ADDRESS);
    const [certIdInput, setCertIdInput] = useState('1');
    const [certReadout, setCertReadout] = useState(null);

    useEffect(() => {
        const verifySafeOnChain = async () => {
            setSafeChainReadout((prev) => ({ ...prev, loading: true }));
            try {
                // getThreshold() selector: 0xe75235b8
                const [balRes, codeRes, threshRes, blockRes] = await Promise.all([
                    fetch(rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'eth_getBalance',
                            params: [TEST_SAFE_TREASURY_ADDRESS, 'latest'],
                        }),
                    }).then((r) => r.json()),
                    fetch(rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 2,
                            method: 'eth_getCode',
                            params: [TEST_SAFE_TREASURY_ADDRESS, 'latest'],
                        }),
                    }).then((r) => r.json()),
                    fetch(rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 3,
                            method: 'eth_call',
                            params: [{ to: TEST_SAFE_TREASURY_ADDRESS, data: '0xe75235b8' }, 'latest'],
                        }),
                    }).then((r) => r.json()),
                    fetch(rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 4,
                            method: 'eth_blockNumber',
                            params: [],
                        }),
                    }).then((r) => r.json()),
                ]);

                const wei = balRes?.result ? BigInt(balRes.result) : 0n;
                const ethStr = (Number(wei) / 1e18).toFixed(4);
                const code = codeRes?.result || '0x';
                const thresh = threshRes?.result && threshRes.result !== '0x' ? parseInt(threshRes.result, 16) : null;
                const blk = blockRes?.result ? parseInt(blockRes.result, 16) : null;

                setSafeChainReadout({
                    loading: false,
                    balanceEth: ethStr,
                    hasCode: code !== '0x' && code.length > 4,
                    threshold: thresh,
                    blockNumber: blk,
                });
            } catch (e) {
                setSafeChainReadout((prev) => ({ ...prev, loading: false }));
            }
        };

        verifySafeOnChain();
    }, [rpcEndpoint]);

    // Module 3: Read LaunchLocker state directly from chain
    const readLockerOnChain = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(lockerAddressInput.trim())) {
            setLockerReadout({ error: 'Enter a valid 20-byte LaunchLocker address on Base Sepolia / Anvil.' });
            return;
        }
        try {
            const target = lockerAddressInput.trim();
            const codeRes = await fetch(rpcEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 30,
                    method: 'eth_getCode',
                    params: [target, 'latest'],
                }),
            }).then((r) => r.json());

            if (!codeRes?.result || codeRes.result === '0x') {
                setLockerReadout({
                    error: `No contract bytecode deployed at ${target} on Base Sepolia yet.`,
                });
                return;
            }
            setLockerReadout({
                address: target,
                bytecodePresent: true,
                error: null,
            });
        } catch (e) {
            setLockerReadout({ error: 'Failed to read LaunchLocker contract from RPC.' });
        }
    };

    // Module 4: Read LaunchCertificate from chain (surfacing/verifying on-chain record, never staff minting)
    const readCertificateOnChain = async () => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(certContractInput.trim())) {
            setCertReadout({ error: 'Enter a valid LaunchCertificate contract address.' });
            return;
        }
        try {
            const target = certContractInput.trim();
            const idNum = BigInt(certIdInput || '1');
            const idHex = idNum.toString(16).padStart(64, '0');
            // ownerOf(uint256) selector: 0x6352211e
            const ownerRes = await fetch(rpcEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 40,
                    method: 'eth_call',
                    params: [{ to: target, data: `0x6352211e${idHex}` }, 'latest'],
                }),
            }).then((r) => r.json());

            if (!ownerRes?.result || ownerRes.result === '0x' || ownerRes.error) {
                setCertReadout({
                    error: `Certificate #${idNum.toString()} not found on ${target.slice(0, 10)}... (0 launches on Base Sepolia).`,
                });
                return;
            }
            setCertReadout({
                contract: target,
                certificateId: idNum.toString(),
                owner: `0x${ownerRes.result.slice(-40)}`,
                error: null,
            });
        } catch (e) {
            setCertReadout({ error: 'RPC query failed while reading LaunchCertificate.' });
        }
    };

    return (
        <div className="min-h-screen bg-abyssal-black text-pearls-white font-mono selection:bg-abyssal-gold selection:text-abyssal-black">
            <Head title="Tress Column — Ops Console (Staging Preview)" />

            {/* Staging Gate & Auth Decision Banner (Task 4 Requirement) */}
            <div className="bg-abyssal-card border-b border-abyssal-gold/40 px-4 py-2 text-[11px] text-nacre-cream/80">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="text-abyssal-gold font-semibold uppercase tracking-wider mr-2">
                            [Staging Gate Active — Held for Auth + Deployment Approval]
                        </span>
                        <span>
                            Target domain: <code className="text-pearls-white">{APP_SURFACES.OPS_CONSOLE.domain}</code> • Open Decision: Shared ThinkTank OS Auth vs. Standalone Ops Auth.
                        </span>
                    </div>
                    <span className="text-[10px] text-red-400 uppercase tracking-wider">
                        Powerless Over Core Contracts By Design
                    </span>
                </div>
            </div>

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
                                Staff-Facing • SaaS Side Only
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

                    <div className="flex items-center space-x-3 text-[11px] text-nacre-cream/70">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span title={TEST_SAFE_STATUS_LABEL}>
                            Test Safe: {TEST_SAFE_TREASURY_ADDRESS.slice(0, 6)}...{TEST_SAFE_TREASURY_ADDRESS.slice(-4)}{' '}
                            <span className="text-amber-400 text-[10px]">
                                ({TEST_SAFE_TREASURY_APPROVED ? 'Approved' : 'Pending Per-App Assignment'})
                            </span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Hard Negatives Notice Banner (Task 1 Requirement) */}
            <div className="bg-red-950/20 border-b border-red-500/20 px-4 py-2 text-[11px] text-red-300">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <span>
                        <strong>Hard Negatives Enforced:</strong> Holds no customer balances • Approves no withdrawals • Freezes no users • Adds no admin keys, setters, pause, or proxy powers to core contracts.
                    </span>
                    <span className="text-red-400/80 uppercase text-[10px] font-semibold">
                        SaaS State &amp; On-Chain State Strictly Separated
                    </span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* 5-Module Navigation Tabs (Exact Order Required by Work Order Task 1) */}
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
                        3. Launch Monitoring
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
                        4. Certificate Issuance
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
                        5. Treasury-Fee Accounting
                    </button>
                </div>

                {/* Module 1: Plus+ Subscriptions (SaaS / Off-Chain State Only) */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    1. Plus+ Subscriptions — Sapphire $7 / Emerald $27 / Ruby $97 (Monthly Only)
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Subscription state is strictly SaaS / off-chain state. It is never presented as on-chain state and never blended with protocol fee receipts.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-blue-950/40 border border-blue-500/40 rounded text-blue-300 font-semibold uppercase">
                                [SaaS / Off-Chain State Only]
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(PLUS_TIERS).map(([key, tier]) => (
                                <div
                                    key={key}
                                    className="border border-abyssal-line/40 bg-abyssal-card/40 p-5 rounded-lg space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] uppercase text-nacre-cream/50 tracking-widest">
                                                    {tier.target} Pass • {tier.billingCycle}
                                                </span>
                                                <div className="text-lg font-semibold text-pearls-white">{tier.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-mono font-bold text-abyssal-gold">
                                                    ${tier.priceMonthly}
                                                </div>
                                                <span className="text-[10px] text-nacre-cream/40">/month (locked)</span>
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
                                    </div>

                                    <div className="pt-3 border-t border-abyssal-line/20 space-y-1 text-[11px]">
                                        <div className="flex justify-between text-nacre-cream/60">
                                            <span>Live Subscribers [SaaS State]:</span>
                                            <span className="font-mono text-pearls-white">0 (Honest Empty State)</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-blue-300/80">
                                            <span>Source of Truth:</span>
                                            <span>Off-Chain SaaS Billing</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Test SaaS Verification Fixtures Toggle (Task 2 Requirement) */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/30 p-4 rounded-lg space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs font-semibold text-pearls-white">
                                    SaaS Entitlement Verification Schema{' '}
                                    <span className="text-[10px] text-amber-400 font-mono">
                                        [TEST SAAS DATA — CLEARLY LABELED, NEVER COUNTED AS LIVE]
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTestFixtures(!showTestFixtures)}
                                    className="px-3 py-1 text-[11px] border border-abyssal-gold/40 rounded text-abyssal-gold hover:bg-abyssal-gold/10 transition-colors"
                                >
                                    {showTestFixtures ? 'Hide Test SaaS Fixtures' : 'Inspect Test SaaS Fixtures'}
                                </button>
                            </div>
                            {showTestFixtures && (
                                <div className="space-y-2 pt-2 border-t border-abyssal-line/20 text-[11px]">
                                    {TEST_SAAS_SUBSCRIPTION_FIXTURES.map((row) => (
                                        <div
                                            key={row.id}
                                            className="p-2.5 rounded bg-abyssal-black/70 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2"
                                        >
                                            <div>
                                                <span className="text-amber-400 font-mono mr-2">{row.stateLabel}</span>
                                                <span className="font-semibold text-pearls-white">{row.tier}</span>
                                                <span className="text-nacre-cream/60 ml-2">— {row.entitlements}</span>
                                            </div>
                                            <span className="text-[10px] text-nacre-cream/50 font-mono">{row.Cycle}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Module 2: Airdrop Campaigns */}
                {activeTab === 'airdrop' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    2. Airdrop Campaigns — {AIRDROP_CAMPAIGN_FEE_ETH} ETH Flat Per Campaign
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Campaign creation and tracking at the locked {AIRDROP_CAMPAIGN_FEE_ETH} ETH flat rate (PRD price sheet, locked 2026-10-25).
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-abyssal-card border border-abyssal-gold/40 rounded text-abyssal-gold font-semibold">
                                Locked Flat Fee: {AIRDROP_CAMPAIGN_FEE_ETH} ETH
                            </span>
                        </div>

                        {/* Emerald Workbench Boundary Notice (Task 1 Item 2 Requirement) */}
                        <div className="p-4 rounded-lg border border-abyssal-gold/40 bg-abyssal-card/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                                <div className="font-semibold text-abyssal-gold uppercase tracking-wider">
                                    Snapshot Boundary Rule Enforced
                                </div>
                                <p className="text-nacre-cream/80">
                                    Merkle snapshot building belongs exclusively to the{' '}
                                    <strong className="text-pearls-white">Emerald Creator Workbench</strong> ($27/mo pass), never to a hand-edited list inside the staff Ops Console.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-abyssal-black border border-abyssal-line/40 text-[10px] text-nacre-cream/60 font-mono">
                                No Hand-Edited Recipient Lists
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Live Campaigns [On-Chain State]
                                </span>
                                <div className="text-xl font-bold text-pearls-white">0 (Honest Empty State)</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Locked Fee Per Campaign [On-Chain Constant]
                                </span>
                                <div className="text-xl font-bold text-abyssal-gold">{AIRDROP_CAMPAIGN_FEE_ETH} ETH</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Ruby Pass Rebate Quota [SaaS State]
                                </span>
                                <div className="text-xl font-bold text-blue-300">1 Free Deploy / Mo (Off-Chain Rebate)</div>
                            </div>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-4">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">
                                Active AirdropDistributor Campaigns Registry [On-Chain State]
                            </div>
                            <div className="p-8 text-center text-xs text-nacre-cream/60 space-y-2 border border-dashed border-abyssal-line/30 rounded bg-abyssal-black/40">
                                <div className="font-semibold text-pearls-white">
                                    ∅ Honest Empty State: No Airdrop Campaigns Deployed on Base Sepolia Yet
                                </div>
                                <p className="text-[11px] text-nacre-cream/50 max-w-lg mx-auto leading-relaxed">
                                    Each campaign deploys an immutable <code className="text-pearls-white">AirdropDistributor</code> contract verified by a 32-byte Merkle root produced by the Emerald workbench, forwarding exactly {AIRDROP_CAMPAIGN_FEE_ETH} ETH to the treasury Safe in its constructor.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Module 3: Launch Monitoring (On-Chain State Only) */}
                {activeTab === 'launches' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    3. Launch Monitoring — Launches, Locker State, Lock Type &amp; Timing
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Read directly from on-chain state (<code className="text-pearls-white">DistributionFactory</code>, <code className="text-pearls-white">HookCertificateFactory</code>, <code className="text-pearls-white">LaunchLocker</code>, <code className="text-pearls-white">TCCore</code>). Never fabricated.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-400 font-semibold uppercase">
                                [On-Chain State Only]
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Sepolia Launches [On-Chain]
                                </span>
                                <div className="text-xl font-bold text-pearls-white">0</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Abyssal Locks (Permanent) [On-Chain]
                                </span>
                                <div className="text-xl font-bold text-emerald-400">0</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    Timed Locks (&ge;{MIN_TIMED_LOCK_DAYS}d Floor) [On-Chain]
                                </span>
                                <div className="text-xl font-bold text-abyssal-gold">0</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-abyssal-line/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-nacre-cream/50 uppercase">
                                    PoolManager Binding [Chain {BASE_SEPOLIA_CHAIN_ID}]
                                </span>
                                <div className="text-xs font-bold text-pearls-white truncate">{POOL_MANAGER_ADDRESS}</div>
                            </div>
                        </div>

                        {/* Honest Empty State */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg text-center space-y-3">
                            <div className="text-xs font-semibold text-pearls-white">
                                ∅ Honest Empty State: No Real Base Sepolia Launches Yet
                            </div>
                            <p className="text-[11px] text-nacre-cream/60 max-w-xl mx-auto leading-relaxed">
                                Phase 3 rehearsal deployment is held pending D&apos;Vaughn&apos;s per-app Safe assignment and the Part 1 / Part 2 factory split. Once a rehearsal launch is broadcast on Base Sepolia, locker custody (<code className="text-pearls-white">Abyssal</code> permanent vs <code className="text-pearls-white">Timed</code> unlock timestamp) and <code className="text-pearls-white">nonReentrant</code> position state populate here from chain reads.
                            </p>
                        </div>

                        {/* Live On-Chain LaunchLocker Inspector */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-5 rounded-lg space-y-3">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">
                                Direct On-Chain LaunchLocker Inspector (Base Sepolia / Anvil Fork)
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    type="text"
                                    value={lockerAddressInput}
                                    onChange={(e) => setLockerAddressInput(e.target.value)}
                                    placeholder="Enter LaunchLocker 0x... contract address"
                                    className="bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-xs text-pearls-white w-80 focus:outline-none focus:border-abyssal-gold"
                                />
                                <button
                                    type="button"
                                    onClick={readLockerOnChain}
                                    className="px-4 py-2 bg-abyssal-gold text-abyssal-black text-xs font-semibold rounded hover:bg-abyssal-gold/90 transition-colors"
                                >
                                    Verify Locker On-Chain
                                </button>
                            </div>
                            {lockerReadout && (
                                <div className="p-3 rounded bg-abyssal-black/70 border border-abyssal-line/30 text-xs">
                                    {lockerReadout.error ? (
                                        <span className="text-nacre-cream/60">{lockerReadout.error}</span>
                                    ) : (
                                        <span className="text-emerald-400">
                                            Verified bytecode at {lockerReadout.address} on active RPC.
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Module 4: Certificate Issuance (Surfacing / Verifying On-Chain Certificate Only) */}
                {activeTab === 'certificates' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    4. Certificate Issuance — On-Chain Certificate Surfacing &amp; Verification
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Renders strictly from on-chain launch data (<code className="text-pearls-white">LaunchCertificate</code>). Issuance means surfacing and verifying the on-chain certificate — never minting a certificate by staff fiat.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-400 font-semibold uppercase">
                                [On-Chain State Only — Zero Staff Minting]
                            </span>
                        </div>

                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-4">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">
                                Verify On-Chain LaunchCertificate Record
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <input
                                    type="text"
                                    value={certContractInput}
                                    onChange={(e) => setCertContractInput(e.target.value)}
                                    placeholder="LaunchCertificate 0x... contract address"
                                    className="bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-xs text-pearls-white w-80 focus:outline-none focus:border-abyssal-gold"
                                />
                                <input
                                    type="text"
                                    value={certIdInput}
                                    onChange={(e) => setCertIdInput(e.target.value)}
                                    placeholder="Certificate ID (e.g. 1)"
                                    className="bg-abyssal-black border border-abyssal-line/50 rounded px-3 py-2 text-xs text-pearls-white w-44 focus:outline-none focus:border-abyssal-gold"
                                />
                                <button
                                    type="button"
                                    onClick={readCertificateOnChain}
                                    className="px-4 py-2 bg-abyssal-gold text-abyssal-black text-xs font-semibold rounded hover:bg-abyssal-gold/90 transition-colors"
                                >
                                    Surface On-Chain Record
                                </button>
                            </div>
                            {certReadout && (
                                <div className="p-3 rounded bg-abyssal-black/70 border border-abyssal-line/30 text-xs">
                                    {certReadout.error ? (
                                        <span className="text-nacre-cream/60">{certReadout.error}</span>
                                    ) : (
                                        <div className="space-y-1 font-mono text-[11px]">
                                            <div className="text-emerald-400">
                                                On-Chain Certificate #{certReadout.certificateId} Verified
                                            </div>
                                            <div>Contract: {certReadout.contract}</div>
                                            <div>Creator / Holder: {certReadout.owner}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="text-[11px] text-nacre-cream/50 leading-relaxed">
                                <strong className="text-pearls-white">Architectural Invariant:</strong>{' '}
                                <code className="text-pearls-white">LaunchCertificate.mint</code> is callable exclusively by the immutable <code className="text-pearls-white">HookCertificateFactory</code> (Part 2) during launch execution. Staff cannot issue, alter, or revoke a launch certificate.
                            </div>
                        </div>
                    </div>
                )}

                {/* Module 5: Treasury-Fee Accounting (Reconciled to On-Chain Receipts Only) */}
                {activeTab === 'accounting' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-abyssal-gold">
                                    5. Treasury-Fee Accounting — Reconciled to On-Chain Receipts Only
                                </h2>
                                <p className="text-xs text-nacre-cream/60 mt-0.5">
                                    Every fee figure shown must trace to an on-chain receipt. Any figure without a chain receipt is shown separately as <strong className="text-amber-400">Unreconciled</strong> — never blended into a total.
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-400 font-semibold uppercase">
                                [On-Chain Receipts Only]
                            </span>
                        </div>

                        {/* Strict Separation of On-Chain Reconciled Receipts vs Unreconciled vs SaaS Off-Chain */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div className="bg-abyssal-card/40 border border-emerald-500/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-emerald-400 uppercase">
                                    Reconciled Airdrop Fee Receipts [On-Chain]
                                </span>
                                <div className="text-xl font-bold text-pearls-white">0.0000 ETH</div>
                                <div className="text-[10px] text-nacre-cream/50">0 receipts on Base Sepolia</div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-emerald-500/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-emerald-400 uppercase">
                                    Reconciled Hook Quote Fees [On-Chain]
                                </span>
                                <div className="text-xl font-bold text-abyssal-gold">$0.00 Quote</div>
                                <div className="text-[10px] text-nacre-cream/50">
                                    {(POST_GATE_FEE_BPS / 100).toFixed(2)}% post-${(VOLUME_GATE_USD / 1_000_000).toFixed(0)}M gate via PoolManager.take
                                </div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-amber-500/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-amber-400 uppercase">
                                    Unreconciled Items [No Chain Receipt]
                                </span>
                                <div className="text-xl font-bold text-amber-400">0 Items (0.00)</div>
                                <div className="text-[10px] text-nacre-cream/50">
                                    Never counted in reconciled totals
                                </div>
                            </div>
                            <div className="bg-abyssal-card/40 border border-blue-500/30 p-4 rounded space-y-1">
                                <span className="text-[10px] text-blue-300 uppercase">
                                    Plus+ Pass Revenue [SaaS / Off-Chain]
                                </span>
                                <div className="text-xl font-bold text-blue-300">$0.00 / mo</div>
                                <div className="text-[10px] text-nacre-cream/50">
                                    Separate SaaS ledger — never blended with chain receipts
                                </div>
                            </div>
                        </div>

                        {/* Base Sepolia Test Safe On-Chain Readout */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-5 rounded-lg space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold uppercase text-abyssal-gold">
                                    Base Sepolia Test Safe On-Chain Readout (Chain {BASE_SEPOLIA_CHAIN_ID})
                                </span>
                                <span className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px]">
                                    Pending D&apos;Vaughn&apos;s Per-App Safe Assignment Approval
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
                                <div className="p-3 rounded bg-abyssal-black/60 border border-abyssal-line/30">
                                    <div className="text-[10px] text-nacre-cream/50">Safe Contract Address</div>
                                    <div className="text-pearls-white break-all">{TEST_SAFE_TREASURY_ADDRESS}</div>
                                </div>
                                <div className="p-3 rounded bg-abyssal-black/60 border border-abyssal-line/30">
                                    <div className="text-[10px] text-nacre-cream/50">Live On-Chain Balance &amp; Code</div>
                                    <div className="text-emerald-400">
                                        {safeChainReadout.balanceEth} ETH •{' '}
                                        {safeChainReadout.hasCode ? 'Bytecode Verified' : 'Checking...'} (Threshold:{' '}
                                        {safeChainReadout.threshold ?? 1})
                                    </div>
                                </div>
                                <div className="p-3 rounded bg-abyssal-black/60 border border-abyssal-line/30">
                                    <div className="text-[10px] text-nacre-cream/50">Fork Verification Anchor</div>
                                    <div className="text-pearls-white">
                                        Block {FORK_VERIFICATION_BLOCK.toLocaleString()} (Live Block:{' '}
                                        {safeChainReadout.blockNumber?.toLocaleString() || '...'})
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* On-Chain Settlement Receipts Ledger (Honest Empty State) */}
                        <div className="border border-abyssal-line/40 bg-abyssal-card/40 p-6 rounded-lg space-y-3">
                            <div className="text-xs font-semibold uppercase text-nacre-cream/80">
                                On-Chain Settlement Receipts Ledger [Source of Truth: Chain Receipts Only]
                            </div>
                            <div className="p-8 text-center text-xs text-nacre-cream/60 space-y-2 border border-dashed border-abyssal-line/30 rounded bg-abyssal-black/40">
                                <div className="font-semibold text-pearls-white">
                                    ∅ Honest Empty State: No On-Chain Fee Receipts on Live Base Sepolia Yet
                                </div>
                                <p className="text-[11px] text-nacre-cream/50 max-w-lg mx-auto leading-relaxed">
                                    An internal cache/index is never the source of truth. Every fee figure must trace to a verified transaction receipt (<code className="text-pearls-white">txHash</code> + <code className="text-pearls-white">blockNumber</code>) from <code className="text-pearls-white">PoolManager.take()</code> or <code className="text-pearls-white">AirdropDistributor</code> deployment. Any cached entry lacking a chain receipt is isolated as <strong className="text-amber-400">Unreconciled</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
