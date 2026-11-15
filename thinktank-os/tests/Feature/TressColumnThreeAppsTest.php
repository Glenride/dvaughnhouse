<?php

namespace Tests\Feature;

use Tests\TestCase;

class TressColumnThreeAppsTest extends TestCase
{
    /**
     * Staging routes return successful Inertia responses for all 3 apps.
     */
    public function test_staging_routes_render_three_apps(): void
    {
        $response = $this->get('/staging/tress-column');
        $response->assertStatus(200);

        $response = $this->get('/staging/terminal');
        $response->assertStatus(200);

        $response = $this->get('/staging/ops-console');
        $response->assertStatus(200);
    }

    /**
     * Dedicated domain routes render corresponding apps.
     */
    public function test_subdomain_routes_render_corresponding_apps(): void
    {
        $response = $this->get('http://tc.dvaughnhouse.com/');
        $response->assertStatus(200);

        $response = $this->get('http://trade.dvaughnhouse.com/');
        $response->assertStatus(200);

        $response = $this->get('http://ops.dvaughnhouse.com/');
        $response->assertStatus(200);
    }
}
