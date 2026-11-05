<?php

use App\Http\Controllers\AttestationController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ManuscriptController;
use App\Http\Controllers\MarkdownController;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Controllers\PortfolioMatrixController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EssayController;
use App\Http\Controllers\ResearchController;
use App\Http\Controllers\SopController;
use App\Http\Controllers\StandardsController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\VanguardLibraryController;
use Illuminate\Support\Facades\Route;

// AI-readable surfaces (ScrollLaunch prompt 1): generated from code,
// never hand-written static files. robots.txt is served by a route so
// it stays in sync with llms.txt and ai.txt (public/robots.txt removed).
// These skip the Inertia middleware: it force-sets `Vary: X-Inertia`,
// which would overwrite the `Vary: Accept` these responses must carry.
Route::get('/llms.txt', [MarkdownController::class, 'llmsTxt'])->name('ai.llms')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/llms-full.txt', [MarkdownController::class, 'llmsFullTxt'])->name('ai.llmsFull')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/ai.txt', [MarkdownController::class, 'aiTxt'])->name('ai.policy')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/robots.txt', [MarkdownController::class, 'robotsTxt'])->name('ai.robots')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/sitemap.xml', [MarkdownController::class, 'sitemapXml'])->name('ai.sitemap')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/api/md/_catalog', [MarkdownController::class, 'catalog'])->name('md.catalog')->withoutMiddleware(HandleInertiaRequests::class);
Route::get('/api/md/{path}', [MarkdownController::class, 'showApi'])->where('path', '.*')->name('md.api')->withoutMiddleware(HandleInertiaRequests::class);
// .md suffix for every public page (registered before the HTML routes;
// the pattern only matches paths ending in .md).
Route::get('/{path}.md', [MarkdownController::class, 'showMd'])->where('path', '.*')->name('md.page')->withoutMiddleware(HandleInertiaRequests::class);

// Research (ScrollLaunch prompt 2): original statistics from Glenride's own data.
Route::get('/research', [ResearchController::class, 'index'])->name('research.index');
Route::get('/research/attestations', [ResearchController::class, 'attestations'])->name('research.attestations');

// store.dvaughnhouse.com lands on the storefront, not the library
Route::domain('store.dvaughnhouse.com')->group(function () {
    Route::get('/', fn () => redirect()->route('store.index'));
});

// Glenride institutional front door; the Vanguard Library lives at /library
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/library', [VanguardLibraryController::class, 'index'])->name('library.index');
Route::get('/briefs/{manuscript}', [VanguardLibraryController::class, 'show'])->name('briefs.show');
Route::get('/thesis', [VanguardLibraryController::class, 'thesis'])->name('thesis.index');

// Glenride Attestations — manual entry + anchor recording (auth, issuers only).
// The create route MUST register before the public /attestations/{key} route,
// otherwise "create" is captured as an attestation key.
Route::middleware('auth')->group(function () {
    Route::get('/attestations/create', [AttestationController::class, 'create'])->name('attestations.create');
    Route::post('/attestations/manual', [AttestationController::class, 'storeManual'])->name('attestations.storeManual');
    Route::post('/attestations/{attestation}/anchor', [AttestationController::class, 'recordAnchor'])->name('attestations.recordAnchor');
});

// Public Glenride Attestations (Witness) — verify must register before show
Route::get('/attestations', [AttestationController::class, 'index'])->name('attestations.index');
Route::post('/attestations/verify', [AttestationController::class, 'verify'])->name('attestations.verify');
Route::get('/attestations/{key}', [AttestationController::class, 'show'])->name('attestations.show');

// Public Glenride standards
Route::get('/standards', [StandardsController::class, 'show'])->name('standards.show');

// Public Essays
Route::get('/essays', [EssayController::class, 'index'])->name('essays.index');
Route::get('/essays/{slug}', [EssayController::class, 'show'])->name('essays.show');

// The Economic Engine (Commercial Monetization & Executive Salons)
Route::get('/store', [StoreController::class, 'index'])->name('store.index');
Route::post('/store/checkout/intent', [StoreController::class, 'createPaymentIntent'])->name('store.intent');
Route::post('/store/checkout/confirm', [StoreController::class, 'confirmOrder'])->name('store.confirm');
Route::post('/store/webhook', [StoreController::class, 'webhook'])->name('store.webhook');

Route::get('/dashboard', [PortfolioMatrixController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Institutional Portfolio Matrix
    Route::get('/matrix', [PortfolioMatrixController::class, 'index'])->name('matrix.index');
    Route::get('/matrix/manuscripts/{manuscript}', [PortfolioMatrixController::class, 'show'])->name('matrix.show');
    Route::patch('/matrix/manuscripts/{manuscript}/status', [PortfolioMatrixController::class, 'updateStatus'])->name('matrix.updateStatus');
    Route::patch('/matrix/manuscripts/{manuscript}/content', [PortfolioMatrixController::class, 'updateContent'])->name('matrix.updateContent');

    // Manuscript Ingestion Dropzone
    Route::get('/manuscripts/intake', [ManuscriptController::class, 'create'])->name('manuscripts.create');
    Route::post('/manuscripts/intake', [ManuscriptController::class, 'store'])->name('manuscripts.store');
    Route::get('/manuscripts', [ManuscriptController::class, 'index'])->name('manuscripts.index');

    // STANZA Credit Ledger (orchestrator/admin only, enforced in controller)
    Route::get('/credits', [CreditController::class, 'index'])->name('credits.index');
    Route::post('/credits', [CreditController::class, 'store'])->name('credits.store');
    Route::get('/credits/{account}', [CreditController::class, 'show'])->name('credits.show');
    Route::post('/credits/{account}/grant', [CreditController::class, 'grant'])->name('credits.grant');
    Route::post('/credits/{account}/deposit', [CreditController::class, 'deposit'])->name('credits.deposit');
    Route::post('/credits/{account}/refund', [CreditController::class, 'refund'])->name('credits.refund');

    // Glenride Attestations — issue, challenge, revoke
    Route::post('/manuscripts/{manuscript}/attestations', [AttestationController::class, 'store'])->name('attestations.store');
    Route::post('/attestations/{attestation}/challenges', [AttestationController::class, 'challenge'])->name('attestations.challenge');
    Route::post('/attestations/{attestation}/revoke', [AttestationController::class, 'revoke'])->name('attestations.revoke');

    // Internal Standard Operating Procedures (Fellow Access Only)
    Route::get('/sops', [SopController::class, 'index'])->name('sops.index');
    Route::get('/sops/{slug}', [SopController::class, 'show'])->name('sops.show');
});

require __DIR__.'/auth.php';
