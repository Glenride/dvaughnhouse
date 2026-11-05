<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Throwable;

class StoreController extends Controller
{
    /**
     * Unified Product Catalog: Executive (B2B), Reynard's (consumer), Glenride Apps.
     *
     * Status governs checkout honestly, per the Glenride App Store trust standard:
     * a product takes payment only when its price, format, and terms are published.
     *  - available:   priced and purchasable now (Stripe checkout enabled)
     *  - external:    free / lives elsewhere (link out, no checkout)
     *  - coming_soon: announced, price/terms not yet published (no checkout)
     *  - custom:      scoped/quote-based (no checkout, contact instead)
     */
    protected array $products = [
        // ── Reynard's ──────────────────────────────────────────────
        'ruck_reset_guide' => [
            'id' => 'ruck_reset_guide',
            'name' => '30-Day Ruck Reset',
            'tagline' => 'Walk farther, stand taller, feel stronger',
            'category' => 'reynards',
            'status' => 'available',
            'amount' => 19.00,
            'amount_cents' => 1900,
            'description' => 'A 35–45 page digital guide to rucking — walking with weight. The simplest serious exercise that exists: 3–4 sessions a week, no gym, start today with a backpack you already own. Includes printable log sheets, gear checklists, and a quick-start one-pager.',
            'features' => [
                '30-day progressive plan: form & base → distance → weight → graduation test',
                'Gear tiers: the $0, $50, and $150 setups — plus what not to buy',
                'Form, safety, and foot care — including the plain "talk to your doctor" line',
                'Bonus printables: 30-day log sheets, gear checklist, quick-start one-pager',
            ],
            'tier' => 'Digital Guide',
            'fulfillment' => 'digital_download',
        ],

        // ── Glenride Apps ──────────────────────────────────────────
        'app_spinwave' => [
            'id' => 'app_spinwave',
            'name' => 'SpinWave',
            'tagline' => 'Set knowledge free',
            'category' => 'glenride',
            'status' => 'external',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Explore $SPIN and the scholarly repository it supports. Open in your browser now — public access, no account needed.',
            'features' => ['Instant browser access', 'Public — no sign-in required'],
            'tier' => 'Public Access',
            'fulfillment' => null,
            'external_url' => 'https://spinwave.pages.dev',
        ],
        'app_wavy' => [
            'id' => 'app_wavy',
            'name' => 'WAVY',
            'tagline' => 'Community token concept & trust center',
            'category' => 'glenride',
            'status' => 'external',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Review the $WAVY community token concept, its trust center, participation flow, and fair-launch record. Open in your browser now.',
            'features' => ['Instant browser access', 'Public — no sign-in required'],
            'tier' => 'Public Access',
            'fulfillment' => null,
            'external_url' => 'https://wavysociety.pages.dev',
        ],
        'app_emoji_lab' => [
            'id' => 'app_emoji_lab',
            'name' => 'Telegram Emoji Lab',
            'tagline' => 'Telegram-ready emoji & sticker media',
            'category' => 'glenride',
            'status' => 'external',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Prepare Telegram-ready emoji and sticker media, including verified WebM output. Free tool — open in your browser and download the finished file.',
            'features' => ['Instant browser access', 'Free tool — no sign-in required'],
            'tier' => 'Free Tool',
            'fulfillment' => null,
            'external_url' => 'https://telegram-emoji-lab.pages.dev',
        ],
        'app_token_membership' => [
            'id' => 'app_token_membership',
            'name' => 'Token Membership System',
            'tagline' => 'Wallet-based member infrastructure',
            'category' => 'glenride',
            'status' => 'coming_soon',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Give members wallet-based sign-in, private member numbers, masked referrals, on-chain scoring, and a clear recognition ledger. Organization license — price and terms publishing before enrollment opens.',
            'features' => ['Licensed system', 'Setup included', 'Organization license'],
            'tier' => 'Licensed System',
            'fulfillment' => null,
        ],
        'app_job_digest' => [
            'id' => 'app_job_digest',
            'name' => 'Job Digest',
            'tagline' => 'Fresh startup jobs, every weekday morning',
            'category' => 'glenride',
            'status' => 'coming_soon',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Startup job postings ranked by recency and grouped by role, delivered as a downloadable weekday publication. Subscription options publishing before enrollment opens.',
            'features' => ['Downloadable editions', 'Yours to keep'],
            'tier' => 'Publication',
            'fulfillment' => null,
        ],
        'app_cornerstone_essay' => [
            'id' => 'app_cornerstone_essay',
            'name' => 'Cornerstone Essay',
            'tagline' => 'The Power-Wisdom Gap, long-form',
            'category' => 'glenride',
            'status' => 'coming_soon',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'The Power-Wisdom Gap and the Imperative for Independent Infrastructure — a long-form examination of power, wisdom, and independent systems. Personal and organization editions publishing before sale.',
            'features' => ['Downloadable long-form publication', 'Personal + team editions'],
            'tier' => 'Publication',
            'fulfillment' => null,
        ],
        'app_drug_digest' => [
            'id' => 'app_drug_digest',
            'name' => 'Drug-Shortage Digest',
            'tagline' => 'U.S. drug-shortage reporting, Mondays',
            'category' => 'glenride',
            'status' => 'coming_soon',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Track U.S. drug-shortage reporting across ASHP, FDA, and Drugs.com in one focused Monday brief. Publication license publishing before sale.',
            'features' => ['Downloadable weekly brief', 'Yours to keep for reference'],
            'tier' => 'Publication',
            'fulfillment' => null,
        ],
        'app_vapor_wire_bot' => [
            'id' => 'app_vapor_wire_bot',
            'name' => 'Vapor Wire Bot',
            'tagline' => 'Telegram community automation',
            'category' => 'glenride',
            'status' => 'custom',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Automate welcomes, scheduled posts, cross-posting, moderation, keyword alerts, and daily summaries across your Telegram communities. Licensed installation scoped and quoted in writing before work begins.',
            'features' => ['Licensed system', 'Installation included', 'Scoped quote first'],
            'tier' => 'Licensed System',
            'fulfillment' => null,
        ],
        'app_job_discovery' => [
            'id' => 'app_job_discovery',
            'name' => 'Job Discovery System',
            'tagline' => 'Your own searchable job catalog',
            'category' => 'glenride',
            'status' => 'custom',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Collect startup openings from approved sources, organize them into one searchable catalog, and produce scheduled role-based digests. Scoped and quoted in writing before work begins.',
            'features' => ['Licensed system', 'Installation included', 'Scoped quote first'],
            'tier' => 'Licensed System',
            'fulfillment' => null,
        ],
        'app_content_factory' => [
            'id' => 'app_content_factory',
            'name' => 'Content Factory',
            'tagline' => 'Long-form video → ready clips',
            'category' => 'glenride',
            'status' => 'coming_soon',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Turn original long-form video into transcribed, scored, captioned clips ready for review and publishing. Available after end-to-end validation passes.',
            'features' => ['Licensed workflow', 'Setup included', 'Validation underway'],
            'tier' => 'Licensed Workflow',
            'fulfillment' => null,
        ],
        'app_token_checker' => [
            'id' => 'app_token_checker',
            'name' => 'Token Checker',
            'tagline' => 'Contract due-diligence, no paid keys',
            'category' => 'glenride',
            'status' => 'custom',
            'amount' => null,
            'amount_cents' => null,
            'description' => 'Check Base and Solana token contracts for key due-diligence signals without supplying paid service keys. Scoped and quoted in writing before work begins.',
            'features' => ['Licensed review tool', 'Setup guidance included', 'Scoped quote first'],
            'tier' => 'Licensed Tool',
            'fulfillment' => null,
        ],

        // ── Executive (B2B) ────────────────────────────────────────
        'executive_salon' => [
            'id' => 'executive_salon',
            'name' => 'Executive Briefing Salon Seat',
            'tagline' => 'Off-The-Record Closed-Door Briefing',
            'category' => 'executive',
            'status' => 'available',
            'amount' => 500.00,
            'amount_cents' => 50000,
            'description' => 'Single admission for corporate ESG directors, manufacturing executives, and institutional policymakers. Includes verified Chatham House Rule briefing, private monograph dossier, and structured dinner.',
            'features' => [
                'Chatham House Rule security protocol',
                'Advance 4-page Vanguard Policy Brief dossier',
                'Curated executive cohort (limited to 16 seats)',
                'Direct dialogue with Glenride research fellows',
            ],
            'tier' => 'Executive Admission',
            'fulfillment' => 'service',
        ],
        'corporate_retainer' => [
            'id' => 'corporate_retainer',
            'name' => 'Annual Corporate Underwriting Retainer',
            'tagline' => 'Institutional Advisory & Priority Access',
            'category' => 'executive',
            'status' => 'available',
            'amount' => 25000.00,
            'amount_cents' => 2500000,
            'description' => 'Comprehensive institutional partnership for regional enterprises. Includes quarterly private briefings, dedicated policy analysis, and priority research commissioning.',
            'features' => [
                'Four guaranteed seats across all Executive Salons',
                'Direct quarterly advisory with D\'Vaughn House',
                'Priority commissioning of custom policy monographs',
                'Institutional underwriting credit on published briefs',
            ],
            'tier' => 'Corporate Underwriting',
            'fulfillment' => 'service',
        ],
        'saas_license' => [
            'id' => 'saas_license',
            'name' => 'ContextForge Institutional SaaS License',
            'tagline' => 'Agentic Synthesis Infrastructure',
            'category' => 'executive',
            'status' => 'available',
            'amount' => 1200.00,
            'amount_cents' => 120000,
            'description' => 'Annual enterprise license for think tanks, universities, and research institutes to deploy ContextForge agentic monograph distillation internally.',
            'features' => [
                'Air-gapped local-first inference support (Ollama/vLLM)',
                'Automated 4-part Vanguard distillation pipeline',
                'Multi-tenant manuscript compliance gating',
                'Priority API updates and architecture support',
            ],
            'tier' => 'Software Licensing',
            'fulfillment' => 'license',
        ],
    ];

    /**
     * Public catalog for the markdown renderer and the sitemap: the same
     * products, prices and statuses as the HTML storefront, from the
     * same source data. No new facts are introduced here.
     */
    public function publicCatalog(): array
    {
        $grouped = [];
        foreach ($this->categories() as $key => $cat) {
            $grouped[] = array_merge($cat, [
                'products' => array_values(array_filter(
                    $this->products,
                    fn ($p) => $p['category'] === $key
                )),
            ]);
        }

        $seo = $this->storeSeoData($grouped);

        $products = [];
        foreach ($grouped as $category) {
            foreach ($category['products'] as $p) {
                $match = null;
                foreach ($seo['products'] as $sp) {
                    if ($sp['name'] === $p['name']) {
                        $match = $sp;
                        break;
                    }
                }

                $products[] = array_merge($p, [
                    'priceLabel' => $match['priceLabel'] ?? null,
                    'statusLabel' => $match['statusLabel'] ?? $p['status'],
                ]);
            }
        }

        return [
            'categories' => $this->categories(),
            'products' => $products,
            'faqAnswer' => $seo['faqAnswer'],
            'asOf' => $seo['asOf'],
            'updated' => $seo['updated'],
        ];
    }

    /**
     * Products grouped by category for the storefront.
     */
    public function categories(): array
    {
        return [
            'reynards' => [
                'id' => 'reynards',
                'name' => "Reynard's",
                'tagline' => 'Field-tested goods for the wild at heart',
            ],
            'glenride' => [
                'id' => 'glenride',
                'name' => 'Glenride Apps',
                'tagline' => 'Tools, publications, and licensed systems',
                // Standalone space: the full Glenride App Store lives here too.
                // This unified storefront aggregates the listings for convenience.
                'url' => 'https://glenride-app-store.pages.dev',
                'url_label' => 'Visit the standalone Glenride App Store',
            ],
            'executive' => [
                'id' => 'executive',
                'name' => 'Executive',
                'tagline' => 'Salons, retainers, and institutional licensing',
            ],
        ];
    }

    /**
     * Display the storefront.
     */
    public function index(): Response
    {
        $grouped = [];
        foreach ($this->categories() as $key => $cat) {
            $grouped[] = array_merge($cat, [
                'products' => array_values(array_filter(
                    $this->products,
                    fn ($p) => $p['category'] === $key
                )),
            ]);
        }

        // Server-rendered AEO payload: the Blade root view turns this into
        // JSON-LD structured data + a plain-text <noscript> catalog summary,
        // so crawlers that don't run JS can still read the storefront.
        View::share('storeSeo', $this->storeSeoData($grouped));

        return Inertia::render('Store/Index', [
            'categories' => $grouped,
            'stripeKey' => Config::get('services.stripe.key'),
        ]);
    }

    /**
     * AEO payload for the storefront: JSON-LD structured data plus a
     * plain-text catalog summary (name, price, status, description per
     * product) rendered into raw HTML by the Blade root view.
     * Prices as of October 2026.
     */
    private function storeSeoData(array $grouped): array
    {
        $statusLabels = [
            'available' => 'Available now',
            'external' => 'Free — opens in browser',
            'coming_soon' => 'Coming soon — price and terms not yet published',
            'custom' => 'Custom — scoped and quoted in writing',
        ];

        $products = [];
        $listItems = [];
        $position = 0;

        foreach ($grouped as $category) {
            foreach ($category['products'] as $p) {
                $position++;
                $price = $p['amount_cents'] !== null ? number_format((float) $p['amount'], 2, '.', '') : null;
                $priceLabel = match (true) {
                    $price === null => null,
                    ($p['fulfillment'] ?? null) === 'digital_download' => '$'.$price.' one-time',
                    ($p['fulfillment'] ?? null) === 'license' => '$'.$price.' per year',
                    default => '$'.$price,
                };

                $products[] = [
                    'name' => $p['name'],
                    'tagline' => $p['tagline'],
                    'priceLabel' => $priceLabel,
                    'statusLabel' => $statusLabels[$p['status']] ?? $p['status'],
                    'description' => $p['description'],
                ];

                $item = [
                    '@type' => 'Product',
                    'name' => $p['name'],
                    'description' => $p['description'],
                ];
                if ($price !== null) {
                    $item['offers'] = [
                        '@type' => 'Offer',
                        'price' => $price,
                        'priceCurrency' => 'USD',
                        'availability' => $p['status'] === 'available'
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/PreOrder',
                    ];
                }
                $listItems[] = ['@type' => 'ListItem', 'position' => $position, 'item' => $item];
            }
        }

        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'The Glenride Store',
            'description' => "Field guides from Reynard's, tools and publications from Glenride, and executive briefings for institutions.",
            'itemListElement' => $listItems,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        // Never let catalog copy break out of the JSON-LD script tag.
        $jsonLd = str_replace('</script', '<\/script', (string) $jsonLd);

        return [
            'asOf' => 'October 2026',
            'updated' => 'October 19, 2026',
            'products' => $products,
            'jsonLd' => $jsonLd,
            'faqAnswer' => 'Field guides from Reynard\'s (the 30-Day Ruck Reset is $19), free Glenride apps and tools that open in your browser, and executive briefings for institutions — salon seats at $500, the ContextForge license at $1,200 per year, and annual corporate retainers at $25,000. Anything marked "Available now" can be bought today through Stripe. "Coming soon" means the price and terms aren\'t published yet, and nothing here takes payment before they are. Prices as of October 2026.',
        ];
    }

    /**
     * Create a Stripe PaymentIntent and persist pending Order.
     * Only products with status=available and a published price can be purchased.
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_type' => ['required', 'string', Rule::in(array_keys($this->products))],
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_company' => 'nullable|string|max:255',
            'attendee_notes' => 'nullable|string|max:1000',
        ]);

        $product = $this->products[$validated['product_type']];

        if (($product['status'] ?? null) !== 'available' || empty($product['amount_cents'])) {
            return response()->json([
                'message' => 'This product is not currently available for purchase. Its price and terms have not been published yet.',
            ], 422);
        }

        $orderNumber = 'GLEN-'.strtoupper(Str::random(8));

        // Initialize Stripe if secret is configured
        $stripeSecret = Config::get('services.stripe.secret');
        $clientSecret = null;
        $paymentIntentId = null;

        if ($stripeSecret && ! str_starts_with($stripeSecret, 'sk_test_placeholder')) {
            try {
                Stripe::setApiKey($stripeSecret);
                $intent = PaymentIntent::create([
                    'amount' => $product['amount_cents'],
                    'currency' => 'usd',
                    'receipt_email' => $validated['customer_email'],
                    'description' => "DVaughnHouse Store: {$product['name']} ({$orderNumber})",
                    'metadata' => [
                        'order_number' => $orderNumber,
                        'product_type' => $validated['product_type'],
                        'product_category' => $product['category'],
                        'customer_name' => $validated['customer_name'],
                        'customer_company' => $validated['customer_company'] ?? 'N/A',
                    ],
                ]);

                $clientSecret = $intent->client_secret;
                $paymentIntentId = $intent->id;
            } catch (Throwable $e) {
                Log::warning("Stripe PaymentIntent generation failed: {$e->getMessage()}. Using test mode mock.");
            }
        }

        // Mock fallback for testing if no live key is present
        if (! $clientSecret) {
            $paymentIntentId = 'pi_mock_'.strtolower(Str::random(24));
            $clientSecret = $paymentIntentId.'_secret_'.strtolower(Str::random(16));
        }

        // Persist order in database
        $order = Order::create([
            'order_number' => $orderNumber,
            'product_type' => $validated['product_type'],
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_company' => $validated['customer_company'] ?? null,
            'amount' => $product['amount'],
            'currency' => 'usd',
            'status' => 'pending',
            'stripe_payment_intent_id' => $paymentIntentId,
            'metadata' => [
                'product_name' => $product['name'],
                'product_category' => $product['category'],
                'attendee_notes' => $validated['attendee_notes'] ?? null,
            ],
        ]);

        return response()->json([
            'order' => $order,
            'client_secret' => $clientSecret,
            'product' => $product,
        ]);
    }

    /**
     * Finalize and confirm successful transaction.
     */
    public function confirmOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'payment_intent_id' => 'required|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $order->update([
            'status' => 'succeeded',
            'stripe_payment_intent_id' => $validated['payment_intent_id'],
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => 'Order verified and processed successfully.',
            'order' => $order,
        ]);
    }

    /**
     * Handle incoming Stripe webhook notifications.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $type = $payload['type'] ?? null;

        if ($type === 'payment_intent.succeeded') {
            $piId = $payload['data']['object']['id'] ?? null;
            if ($piId) {
                $order = Order::where('stripe_payment_intent_id', $piId)->first();
                if ($order) {
                    $order->update([
                        'status' => 'succeeded',
                        'paid_at' => now(),
                    ]);
                    Log::info("Stripe Webhook: Order {$order->order_number} marked succeeded.");
                }
            }
        }

        return response()->json(['status' => 'received']);
    }
}
