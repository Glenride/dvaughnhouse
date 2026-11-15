<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TradingTerminalController extends Controller
{
    /**
     * Display the Tress Column Trading Terminal staging preview.
     */
    public function index(): Response
    {
        return Inertia::render('TradingTerminal/Index');
    }
}
