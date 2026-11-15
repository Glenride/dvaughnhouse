<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_storefront(): void
    {
        $response = $this->get(route('store.index'));
        $response->assertOk();
    }

    public function test_intent_returns_unavailable_when_stripe_is_unconfigured(): void
    {
        $response = $this->postJson(route('store.intent'), [
            'product_type' => 'executive_salon',
            'customer_name' => 'John Henderson',
            'customer_email' => 'esg.director@industrial.com',
            'customer_company' => 'Apex Manufacturing Base',
            'attendee_notes' => 'Dietary restriction: vegetarian.',
        ]);

        // No Stripe secret is configured in the test environment, so checkout
        // must fail honestly instead of minting a mock intent and order.
        $response->assertStatus(503);
        $this->assertDatabaseMissing('orders', [
            'customer_email' => 'esg.director@industrial.com',
        ]);
    }

    public function test_confirm_leaves_order_pending_when_payment_cannot_be_verified(): void
    {
        $order = Order::create([
            'order_number' => 'GLEN-TEST1234',
            'product_type' => 'corporate_retainer',
            'customer_name' => 'Elena Rostova',
            'customer_email' => 'elena@enterprise.org',
            'amount' => 25000.00,
            'status' => 'pending',
        ]);

        $response = $this->postJson(route('store.confirm'), [
            'order_id' => $order->id,
            'payment_intent_id' => 'pi_mock_confirmed_test',
        ]);

        // No Stripe secret is configured in the test environment, so the
        // intent cannot be verified and the order must stay pending.
        $response->assertStatus(503);
        $order->refresh();

        $this->assertEquals('pending', $order->status);
        $this->assertNull($order->paid_at);
    }

    public function test_signed_stripe_webhook_marks_order_succeeded(): void
    {
        Config::set('services.stripe.webhook_secret', 'whsec_test_signing_secret');

        $order = Order::create([
            'order_number' => 'GLEN-WEBHOOK1',
            'product_type' => 'saas_license',
            'customer_name' => 'Policy Director',
            'customer_email' => 'director@thinktank.org',
            'amount' => 1200.00,
            'status' => 'pending',
            'stripe_payment_intent_id' => 'pi_test_webhook_123',
        ]);

        $payload = json_encode([
            'type' => 'payment_intent.succeeded',
            'data' => ['object' => ['id' => 'pi_test_webhook_123']],
        ]);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test_signing_secret');

        $response = $this->call('POST', route('store.webhook'), [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
        ], $payload);

        $response->assertOk();
        $order->refresh();
        $this->assertEquals('succeeded', $order->status);
        $this->assertNotNull($order->paid_at);
    }

    public function test_unsigned_stripe_webhook_is_rejected_and_order_stays_pending(): void
    {
        Config::set('services.stripe.webhook_secret', 'whsec_test_signing_secret');

        $order = Order::create([
            'order_number' => 'GLEN-WEBHOOK2',
            'product_type' => 'saas_license',
            'customer_name' => 'Policy Director',
            'customer_email' => 'director2@thinktank.org',
            'amount' => 1200.00,
            'status' => 'pending',
            'stripe_payment_intent_id' => 'pi_test_webhook_456',
        ]);

        $response = $this->postJson(route('store.webhook'), [
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_test_webhook_456',
                ],
            ],
        ]);

        $response->assertStatus(400);
        $order->refresh();
        $this->assertEquals('pending', $order->status);
        $this->assertNull($order->paid_at);
    }

    public function test_storefront_exposes_all_three_categories(): void
    {
        $response = $this->get(route('store.index'));
        $response->assertOk();
        // Inertia page receives grouped categories
        $page = $response->viewData('page');
        $categories = $page['props']['categories'];
        $ids = array_column($categories, 'id');
        $this->assertContains('reynards', $ids);
        $this->assertContains('glenride', $ids);
        $this->assertContains('executive', $ids);

        // Reynard's has the Ruck Reset guide; Glenride has 11 apps
        $byId = array_column($categories, null, 'id');
        $reynardsIds = array_column($byId['reynards']['products'], 'id');
        $this->assertContains('ruck_reset_guide', $reynardsIds);
        $this->assertCount(11, $byId['glenride']['products']);
    }

    public function test_reynards_guide_intent_returns_unavailable_when_stripe_is_unconfigured(): void
    {
        $response = $this->postJson(route('store.intent'), [
            'product_type' => 'ruck_reset_guide',
            'customer_name' => 'Alex Carter',
            'customer_email' => 'alex@example.com',
        ]);

        $response->assertStatus(503);
        $this->assertDatabaseMissing('orders', [
            'customer_email' => 'alex@example.com',
            'product_type' => 'ruck_reset_guide',
        ]);
    }

    public function test_cannot_purchase_coming_soon_product(): void
    {
        $response = $this->postJson(route('store.intent'), [
            'product_type' => 'app_job_digest',
            'customer_name' => 'Sam Lee',
            'customer_email' => 'sam@example.com',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('orders', ['customer_email' => 'sam@example.com']);
    }

    public function test_cannot_purchase_external_product(): void
    {
        $response = $this->postJson(route('store.intent'), [
            'product_type' => 'app_spinwave',
            'customer_name' => 'Sam Lee',
            'customer_email' => 'sam2@example.com',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('orders', ['customer_email' => 'sam2@example.com']);
    }

    public function test_cannot_purchase_custom_setup_product(): void
    {
        $response = $this->postJson(route('store.intent'), [
            'product_type' => 'app_vapor_wire_bot',
            'customer_name' => 'Sam Lee',
            'customer_email' => 'sam3@example.com',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('orders', ['customer_email' => 'sam3@example.com']);
    }
}
