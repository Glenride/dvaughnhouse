import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import SiteFooter from '@/Components/SiteFooter';
import ImageBand from '@/Components/ImageBand';

const STATUS_STYLES = {
    available: 'border-sienna-deep/40 bg-sienna/10 text-sienna-deep dark:border-sienna/40 dark:bg-sienna/10 dark:text-sienna',
    external: 'border-line bg-paper-deep text-ink-soft dark:border-line-dark dark:bg-night-deep dark:text-cream-soft',
    coming_soon: 'border-sienna/50 bg-paper-deep text-ink-soft dark:border-sienna/40 dark:bg-night-deep dark:text-cream-soft',
    custom: 'border-dashed border-line bg-paper text-ink-soft dark:border-line-dark dark:bg-night-card dark:text-cream-soft',
};

const STATUS_LABELS = {
    available: 'Available now',
    external: 'Free · opens in browser',
    coming_soon: 'Coming soon',
    custom: 'Custom setup',
};

function formatPrice(product) {
    if (product.amount_cents == null) return null;
    return `$${parseFloat(product.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function ProductCard({ product, onBuy }) {
    const price = formatPrice(product);
    const purchasable = product.status === 'available' && product.amount_cents != null;

    return (
        <article className="relative flex flex-col justify-between rounded-3xl p-8 border border-line bg-paper shadow-sm transition duration-200 hover:border-sienna-deep/40 dark:border-line-dark dark:bg-night-card dark:hover:border-sienna/50">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-sienna-deep dark:text-sienna font-semibold">
                        {product.tier}
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${STATUS_STYLES[product.status]}`}
                    >
                        {STATUS_LABELS[product.status]}
                    </span>
                </div>

                <h3 className="font-display text-xl font-bold text-ink dark:text-cream leading-snug">{product.name}</h3>
                <p className="mt-1 text-xs font-mono text-ink-soft dark:text-cream-soft">{product.tagline}</p>

                {price && (
                    <div className="mt-6 flex items-baseline space-x-2">
                        <span className="text-4xl font-extrabold font-mono text-ink dark:text-cream">{price}</span>
                        <span className="text-xs font-mono text-ink-soft dark:text-cream-soft">
                            {product.fulfillment === 'digital_download' ? 'one-time' : '/ year'}
                        </span>
                    </div>
                )}

                <p className="mt-4 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">{product.description}</p>

                {product.features?.length > 0 && (
                    <div className="mt-8 border-t border-line dark:border-line-dark pt-6 space-y-3">
                        <div className="text-xs font-mono font-semibold text-ink dark:text-cream uppercase tracking-wider">
                            What's included:
                        </div>
                        <ul className="space-y-2 text-xs text-ink-soft dark:text-cream-soft">
                            {product.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start">
                                    <svg
                                        className="h-4 w-4 text-sienna-deep dark:text-sienna mr-2 shrink-0 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-10">
                {purchasable && (
                    <button
                        type="button"
                        onClick={() => onBuy(product)}
                        className="w-full rounded-xl py-3.5 px-4 text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition bg-sienna text-ink hover:bg-sienna-deep hover:text-paper"
                    >
                        Buy now →
                    </button>
                )}
                {product.status === 'external' && product.external_url && (
                    <a
                        href={product.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-xl py-3.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-center transition border border-line bg-paper-deep text-ink hover:bg-sienna hover:text-ink dark:border-line-dark dark:bg-night-deep dark:text-cream dark:hover:bg-sienna dark:hover:text-ink"
                    >
                        Open in browser →
                    </a>
                )}
                {product.status === 'coming_soon' && (
                    <div className="w-full rounded-xl py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-center border border-line bg-paper-deep text-ink-soft cursor-not-allowed dark:border-line-dark dark:bg-night-deep dark:text-cream-soft">
                        Price & terms publishing soon
                    </div>
                )}
                {product.status === 'custom' && (
                    <div className="w-full rounded-xl py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-center border border-line bg-paper-deep text-ink-soft cursor-not-allowed dark:border-line-dark dark:bg-night-deep dark:text-cream-soft">
                        Scoped & quoted in writing first
                    </div>
                )}
            </div>
        </article>
    );
}

export default function Index({ categories = [], stripeKey = '' }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [attendeeNotes, setAttendeeNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderReceipt, setOrderReceipt] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [checkoutStep, setCheckoutStep] = useState('details');
    const [pendingOrder, setPendingOrder] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [paymentReady, setPaymentReady] = useState(false);

    const stripeRef = useRef(null);
    const elementsRef = useRef(null);
    const paymentElementRef = useRef(null);
    const paymentMountRef = useRef(null);
    const stripeJsPromiseRef = useRef(null);

    const loadStripeJs = () => {
        if (window.Stripe) return Promise.resolve();
        if (!stripeJsPromiseRef.current) {
            stripeJsPromiseRef.current = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3';
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Stripe.js failed to load.'));
                document.head.appendChild(script);
            });
        }
        return stripeJsPromiseRef.current;
    };

    const teardownPaymentElement = () => {
        try {
            paymentElementRef.current?.unmount();
        } catch (e) {
            // Element already gone; nothing to clean up.
        }
        paymentElementRef.current = null;
        elementsRef.current = null;
        stripeRef.current = null;
        setPaymentReady(false);
    };

    useEffect(() => {
        if (checkoutStep !== 'payment' || !clientSecret || !stripeKey) return undefined;
        setPaymentReady(false);
        let cancelled = false;
        let elementReady = false;
        const loadTimeout = setTimeout(() => {
            if (!cancelled && !elementReady) {
                setErrorMessage('Card payments failed to load. Please refresh and try again.');
            }
        }, 20000);
        loadStripeJs()
            .then(() => {
                if (cancelled) return;
                if (!paymentMountRef.current) {
                    console.error('Stripe mount target missing.');
                    return;
                }
                const stripe = window.Stripe(stripeKey);
                stripeRef.current = stripe;
                const elements = stripe.elements({
                    clientSecret,
                    appearance: {
                        theme: 'stripe',
                        variables: {
                            colorPrimary: '#E97451',
                            fontFamily: 'Georgia, serif',
                            borderRadius: '6px',
                        },
                    },
                });
                elementsRef.current = elements;
                const paymentElement = elements.create('payment');
                paymentElementRef.current = paymentElement;
                paymentElement.on('ready', () => {
                    if (cancelled) return;
                    elementReady = true;
                    setPaymentReady(true);
                });
                paymentElement.on('loaderror', (event) => {
                    if (cancelled) return;
                    console.error('Stripe Payment Element failed to load:', event.error);
                    setErrorMessage(
                        'Card form failed to load: ' + (event.error?.message || 'unknown error') + ' Please refresh and try again.'
                    );
                });
                paymentElement.mount(paymentMountRef.current);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Stripe.js failed to load:', err);
                setErrorMessage('Card payments failed to load. Please try again.');
            });
        return () => {
            cancelled = true;
            clearTimeout(loadTimeout);
            try {
                paymentElementRef.current?.unmount();
            } catch (e) {
                // Element already gone; nothing to clean up.
            }
            paymentElementRef.current = null;
            elementsRef.current = null;
        };
    }, [checkoutStep, clientSecret, stripeKey]);

    const openCheckout = (product) => {
        teardownPaymentElement();
        setSelectedProduct(product);
        setOrderReceipt(null);
        setErrorMessage(null);
        setCheckoutStep('details');
        setPendingOrder(null);
        setClientSecret(null);
    };

    const closeCheckout = () => {
        teardownPaymentElement();
        setSelectedProduct(null);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerCompany('');
        setAttendeeNotes('');
        setIsSubmitting(false);
        setIsConfirming(false);
        setCheckoutStep('details');
        setPendingOrder(null);
        setClientSecret(null);
    };

    const backToDetails = () => {
        teardownPaymentElement();
        setCheckoutStep('details');
        setErrorMessage(null);
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const intentRes = await window.axios.post(route('store.intent'), {
                product_type: selectedProduct.id,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_company: customerCompany,
                attendee_notes: attendeeNotes,
            });

            const { order, client_secret } = intentRes.data;

            if (!stripeKey) {
                setErrorMessage('Card payments are not configured yet. No payment was taken.');
                return;
            }

            setPendingOrder(order);
            setClientSecret(client_secret);
            setCheckoutStep('payment');
        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMessage(
                err.response?.data?.message || 'Payment authorization failed. Please verify your details.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!stripeRef.current || !elementsRef.current) return;
        setIsConfirming(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripeRef.current.confirmPayment({
                elements: elementsRef.current,
                confirmParams: { return_url: window.location.href },
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed. Please check your card details.');
                return;
            }

            if (!paymentIntent || paymentIntent.status !== 'succeeded') {
                setErrorMessage('Payment did not complete. No charge was confirmed.');
                return;
            }

            const confirmRes = await window.axios.post(route('store.confirm'), {
                order_id: pendingOrder.id,
                payment_intent_id: paymentIntent.id,
            });

            setOrderReceipt(confirmRes.data.order);
        } catch (err) {
            console.error('Payment confirmation error:', err);
            setErrorMessage(
                err.response?.data?.message || 'Payment verification failed. Please contact support with your order number.'
            );
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper text-ink font-serif selection:bg-sienna selection:text-ink dark:bg-night dark:text-cream">
            <Head title="The Store — store.dvaughnhouse.com" />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-line bg-paper dark:border-line-dark dark:bg-night">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sienna text-ink font-display font-bold text-lg shadow-sm">
                            $
                        </div>
                        <div>
                            <span className="block font-display font-bold tracking-tight text-ink dark:text-cream text-base">
                                The Store
                            </span>
                            <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                                store.dvaughnhouse.com
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs font-mono">
                        <Link href="/" className="text-ink-soft hover:text-ink transition dark:text-cream-soft dark:hover:text-cream">
                            ← Vanguard Library
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="rounded-lg border border-line bg-paper-deep px-3.5 py-2 text-ink transition hover:bg-sienna hover:text-ink dark:border-line-dark dark:bg-night-card dark:text-cream dark:hover:bg-sienna dark:hover:text-ink"
                        >
                            ThinkTank OS Portal
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section — full-bleed image, flat ink scrim */}
            <section className="relative overflow-hidden border-b border-ink bg-ink py-20 text-cream">
                <img
                    src="/images/heroes/hero-arrival.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
                />
                <div className="absolute inset-0 bg-ink/60" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-cream max-w-3xl mx-auto leading-tight">
                        Everything has a price. Nothing is promised.
                    </h1>

                    <p className="mt-4 text-base sm:text-lg text-cream-soft max-w-2xl mx-auto leading-relaxed">
                        Field guides from Reynard's, tools and publications from Glenride, and
                        executive briefings for institutions. Every listing tells you exactly
                        what you get — no product takes payment before its price and terms are published.
                    </p>
                    <p className="mt-4 text-[11px] font-mono uppercase tracking-widest text-cream-soft">
                        Prices as of October 2026 · Updated October 19, 2026
                    </p>
                    <div className="mt-6"><div className="inline-flex items-center space-x-2 rounded-full border border-paper/40 px-3.5 py-1 text-xs font-mono text-cream mb-6">
                        <span className="h-1.5 w-1.5 rounded-full bg-sienna"></span>
                        <span>Secure checkout · Stripe PCI Level 1</span>
                    </div></div>
                </div>
            </section>

            {/* Category Sections */}
            <main className="py-16 space-y-20">
                {categories.map((category) => (
                    <section key={category.id} className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mb-8">
                            <h2 className="font-display text-2xl font-bold text-ink dark:text-cream">{category.name}</h2>
                            <p className="mt-1 text-sm font-mono text-ink-soft dark:text-cream-soft">{category.tagline}</p>
                            {category.url && (
                                <a
                                    href={category.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center text-xs font-mono text-sienna-deep hover:text-sienna-deep dark:text-sienna dark:hover:text-sienna transition"
                                >
                                    {category.url_label || 'Visit the standalone store'} →
                                </a>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {category.products.map((product) => (
                                <ProductCard key={product.id} product={product} onBuy={openCheckout} />
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* FAQ — plain-English answers for readers and answer engines */}
            <section className="border-t border-line dark:border-line-dark py-16" aria-labelledby="store-faq-heading">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    <h2 id="store-faq-heading" className="font-display text-2xl font-bold text-ink dark:text-cream">
                        What can I buy from the store?
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
                        Field guides from Reynard's (the 30-Day Ruck Reset is $19), free Glenride apps and tools that open in your browser, and executive briefings for institutions — salon seats at $500, the ContextForge license at $1,200 per year, and annual corporate retainers at $25,000. Anything marked "Available now" can be bought today through Stripe. "Coming soon" means the price and terms aren't published yet, and nothing here takes payment before they are. Prices as of October 2026.
                    </p>
                </div>
            </section>

            {/* Supporting image band — green corridor ship */}
            <ImageBand src="/images/heroes/hero-green-corridor.jpg" />

            {/* Checkout Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Checkout"
                >
                    <div className="w-full max-w-xl rounded-3xl border border-line bg-paper dark:border-line-dark dark:bg-night-card p-8 shadow-2xl relative">
                        <button
                            type="button"
                            aria-label="Close checkout"
                            onClick={closeCheckout}
                            className="absolute top-6 right-6 text-ink-soft hover:text-ink transition dark:text-cream-soft dark:hover:text-cream"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {orderReceipt ? (
                            <div className="text-center py-4 space-y-6">
                                <div className="h-14 w-14 rounded-full bg-sienna/15 text-sienna-deep dark:text-sienna flex items-center justify-center mx-auto text-2xl">
                                    ✓
                                </div>

                                <div>
                                    <span className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
                                        Payment Authorized & Verified
                                    </span>
                                    <h3 className="font-display text-2xl font-bold text-ink dark:text-cream mt-1">
                                        Transaction Confirmed
                                    </h3>
                                    <p className="text-xs text-ink-soft dark:text-cream-soft mt-1">
                                        A formal receipt has been transmitted to your email.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-line bg-paper-deep dark:border-line-dark dark:bg-night-deep p-5 text-left text-xs space-y-2 font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft dark:text-cream-soft">Order Number:</span>
                                        <span className="font-bold text-sienna-deep dark:text-sienna">{orderReceipt.order_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft dark:text-cream-soft">Item:</span>
                                        <span className="text-ink dark:text-cream">{selectedProduct.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft dark:text-cream-soft">Authorized Amount:</span>
                                        <span className="font-bold text-sienna-deep dark:text-sienna">
                                            ${parseFloat(orderReceipt.amount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft dark:text-cream-soft">Recipient Email:</span>
                                        <span className="text-ink-soft dark:text-cream-soft">{orderReceipt.customer_email}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeCheckout}
                                    className="w-full rounded-xl bg-sienna py-3 text-xs font-mono font-bold uppercase tracking-wider text-ink hover:bg-sienna-deep hover:text-paper transition"
                                >
                                    Close & Return to Store
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={checkoutStep === 'payment' ? handlePaymentSubmit : handleCheckoutSubmit} className="space-y-6">
                                <div>
                                    <div className="flex items-center space-x-2 text-xs font-mono text-sienna-deep dark:text-sienna uppercase tracking-wider mb-1">
                                        <span>Stripe Secure Gateway</span>
                                        <span>•</span>
                                        <span>PCI Level 1</span>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                                        Complete Purchase: {selectedProduct.name}
                                    </h3>
                                    <div className="mt-1 text-2xl font-extrabold font-mono text-sienna-deep dark:text-sienna">
                                        ${parseFloat(selectedProduct.amount).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="rounded-xl border border-sienna-deep/40 bg-sienna/10 p-3 text-xs text-sienna-deep dark:text-sienna font-mono">
                                        {errorMessage}
                                    </div>
                                )}

                                {checkoutStep === 'details' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="checkout-name" className="block text-xs font-mono uppercase tracking-wider text-ink-soft dark:text-cream-soft mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            id="checkout-name"
                                            type="text"
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="e.g. Jordan Ellis"
                                            className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-sienna-deep focus:ring-sienna-deep dark:border-line-dark dark:bg-night-deep dark:text-cream dark:placeholder:text-cream-soft/70 dark:focus:border-sienna dark:focus:ring-sienna"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="checkout-email" className="block text-xs font-mono uppercase tracking-wider text-ink-soft dark:text-cream-soft mb-1">
                                            Email *
                                        </label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            required
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="e.g. you@example.com"
                                            className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-sienna-deep focus:ring-sienna-deep dark:border-line-dark dark:bg-night-deep dark:text-cream dark:placeholder:text-cream-soft/70 dark:focus:border-sienna dark:focus:ring-sienna"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="checkout-company" className="block text-xs font-mono uppercase tracking-wider text-ink-soft dark:text-cream-soft mb-1">
                                            Company / Organization
                                        </label>
                                        <input
                                            id="checkout-company"
                                            type="text"
                                            value={customerCompany}
                                            onChange={(e) => setCustomerCompany(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-sienna-deep focus:ring-sienna-deep dark:border-line-dark dark:bg-night-deep dark:text-cream dark:placeholder:text-cream-soft/70 dark:focus:border-sienna dark:focus:ring-sienna"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs font-mono text-ink-soft dark:text-cream-soft">
                                            Card details are entered securely on the next step. No payment is taken until you confirm the card.
                                        </p>
                                    </div>
                                </div>
                                ) : (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-line bg-paper-deep dark:border-line-dark dark:bg-night-deep p-5 text-left text-xs space-y-2 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-ink-soft dark:text-cream-soft">Item:</span>
                                            <span className="text-ink dark:text-cream">{selectedProduct.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-ink-soft dark:text-cream-soft">Email:</span>
                                            <span className="text-ink-soft dark:text-cream-soft">{customerEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-ink-soft dark:text-cream-soft">Order:</span>
                                            <span className="font-bold text-sienna-deep dark:text-sienna">{pendingOrder?.order_number}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft dark:text-cream-soft mb-1">
                                            Card payment
                                        </label>
                                        <div ref={paymentMountRef} className="rounded-xl border border-line bg-paper px-4 py-3 dark:border-line-dark dark:bg-night-deep" />
                                        {!paymentReady && (
                                            <p className="mt-2 text-xs font-mono text-ink-soft dark:text-cream-soft">
                                                Loading secure card form...
                                            </p>
                                        )}
                                    </div>
                                </div>
                                )}

                                <div className="pt-2 space-y-3">
                                    {checkoutStep === 'payment' ? (
                                        <>
                                            <button
                                                type="submit"
                                                disabled={isConfirming || !paymentReady}
                                                className="w-full rounded-xl bg-sienna py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-ink shadow-sm hover:bg-sienna-deep hover:text-paper disabled:opacity-50 transition"
                                            >
                                                {isConfirming ? 'Processing payment...' : `Pay $${parseFloat(selectedProduct.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} →`}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={backToDetails}
                                                disabled={isConfirming}
                                                className="w-full rounded-xl border border-line py-3 text-xs font-mono font-bold uppercase tracking-wider text-ink-soft hover:text-ink disabled:opacity-50 transition dark:border-line-dark dark:text-cream-soft dark:hover:text-cream"
                                            >
                                                ← Back to details
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full rounded-xl bg-sienna py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-ink shadow-sm hover:bg-sienna-deep hover:text-paper disabled:opacity-50 transition"
                                        >
                                            {isSubmitting ? 'Creating order...' : 'Continue to payment →'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <SiteFooter />
        </div>
    );
}
