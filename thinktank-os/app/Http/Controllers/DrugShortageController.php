<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Public U.S. drug-shortage hub pages (dvaughnhouse.org/drug-shortages/*).
 *
 * Static pages, no database, no models, no live API calls. Every number
 * on them is a verified figure with its date and source shown on the
 * page. Figures are for research citation only; nothing here is
 * clinical guidance, and ASHP bulletin text is never republished.
 */
class DrugShortageController extends Controller
{
    /**
     * /drug-shortages/current — what is in shortage right now.
     */
    public function current(): Response
    {
        return Inertia::render('DrugShortages/Current');
    }

    /**
     * /drug-shortages/list — the U.S. drug shortage list, explained.
     */
    public function list(): Response
    {
        return Inertia::render('DrugShortages/List');
    }

    /**
     * /drug-shortages/fda-list — the FDA drug shortage list, explained.
     */
    public function fdaList(): Response
    {
        return Inertia::render('DrugShortages/FdaList');
    }

    /**
     * /drug-shortages/ashp-vs-fda — why the ASHP and FDA lists disagree.
     */
    public function ashpVsFda(): Response
    {
        return Inertia::render('DrugShortages/AshpVsFda');
    }
}
