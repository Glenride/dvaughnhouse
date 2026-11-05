<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts: self-hosted (see @font-face in resources/css/app.css) -->

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        {{-- Server-rendered AI head signals (prompt 1 §6): ai-summary + the
             markdown alternate, in the raw HTML. This app has no SSR, so
             React <Head> alone would only reach crawlers that run JS. --}}
        @php($aiHead = \App\Support\SiteConfig::headSignals($page ?? []))
        @if($aiHead)
        <meta name="ai-summary" content="{{ $aiHead['summary'] }}">
        <link rel="alternate" type="text/markdown" href="{{ $aiHead['md_url'] }}">
        @endif
        {{-- AEO: structured data for answer engines (store page only; harmless elsewhere) --}}
        @isset($storeSeo)
        <script type="application/ld+json">{!! $storeSeo['jsonLd'] !!}</script>
        @endisset
        {{-- JSON-LD shared by a controller (homepage Organization/WebSite, research Dataset/FAQPage) --}}
        @isset($pageJsonLd)
        <script type="application/ld+json">{!! $pageJsonLd !!}</script>
        @endisset
    </head>
    <body class="bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        @inertia
        {{-- Global Mission Control backlink — every ThinkTank OS page carries a visible link back to Mission Control. --}}
        <footer style="border-top:1px solid #3a352a;background:#171410;color:#e8e0cf;text-align:center;padding:14px 20px;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">
            <a href="https://mission.dvaughnhouse.com" style="color:#e8e0cf;text-decoration:underline;text-underline-offset:3px;">Mission Control</a>
            · <a href="/llms.txt" style="color:#e8e0cf;text-decoration:underline;text-underline-offset:3px;">For AI agents</a>
        </footer>
        {{-- AEO: plain-text catalog summary for crawlers that don't run JS.
             Same offers and prices as the interactive storefront — no cloaking. --}}
        @if(isset($storeSeo) && ($page['component'] ?? null) === 'Store/Index')
        <noscript>
            <div>
                <h1>The Store</h1>
                <p>The Glenride store: field guides from Reynard's, tools and publications from Glenride, and executive briefings for institutions. Every listing tells you exactly what you get — no product takes payment before its price and terms are published.</p>
                <h2>What can I buy from the store?</h2>
                <p>{{ $storeSeo['faqAnswer'] }}</p>
                <h2>Products and prices (as of {{ $storeSeo['asOf'] }})</h2>
                <ul>
                    @foreach($storeSeo['products'] as $sp)
                    <li><strong>{{ $sp['name'] }}</strong> — {{ $sp['tagline'] }}@if($sp['priceLabel']) — {{ $sp['priceLabel'] }}@endif ({{ $sp['statusLabel'] }}). {{ $sp['description'] }}</li>
                    @endforeach
                </ul>
                <p>Updated: {{ $storeSeo['updated'] }}.</p>
            </div>
        </noscript>
        @endif
    </body>
</html>
