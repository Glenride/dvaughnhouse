<?php

namespace App\Http\Controllers;

use App\Models\Attestation;
use App\Models\Manuscript;
use App\Support\SiteConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * The Glenride institutional front door (dvaughnhouse.org root).
     *
     * The Vanguard Library lives at /library; this page introduces the
     * institution, its research areas, its attestation proof layer, and
     * the latest published briefs.
     */
    public function index(Request $request): Response
    {
        // Homepage Organization + WebSite JSON-LD, from the same site
        // config as llms.txt and ai.txt (rendered by the Blade root view).
        View::share('pageJsonLd', SiteConfig::organizationJsonLdString());

        $featuredBriefs = Manuscript::published()
            ->latest('published_at')
            ->take(3)
            ->get(['id', 'title', 'abstract', 'published_at'])
            ->map(function (Manuscript $brief) {
                return [
                    'id' => $brief->id,
                    'title' => $brief->title,
                    'abstract' => $brief->abstract,
                    'published_at' => $brief->published_at,
                    'attestation_public_id' => $brief->activeAttestation()?->public_id,
                    'record_version' => $brief->latestRecord?->version,
                ];
            });

        return Inertia::render('Home/Landing', [
            'featuredBriefs' => $featuredBriefs,
            'publishedCount' => Manuscript::published()->count(),
            'attestationCount' => Attestation::active()->count(),
            'essayCount' => count(EssayController::publishedSlugs()),
        ]);
    }
}
