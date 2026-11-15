<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TressColumnController extends Controller
{
    /**
     * Display the Tress Column Launchpad staging preview.
     */
    public function index(): Response
    {
        return Inertia::render('TressColumn/Index');
    }
}
