<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class OpsConsoleController extends Controller
{
    /**
     * Display the Back Office Ops Console staging preview.
     */
    public function index(): Response
    {
        return Inertia::render('OpsConsole/Index');
    }
}
