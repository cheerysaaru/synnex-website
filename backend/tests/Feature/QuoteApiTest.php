<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** /api/quotes: the owner's quotation tool. Ported from the app's own API tests. */
class QuoteApiTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $username, bool $admin = false): User
    {
        $user = User::create(['name' => ucfirst($username), 'username' => $username, 'email' => $username.'@example.com', 'password' => 'secret-password']);
        $user->forceFill(['is_admin' => $admin])->save();

        return $user;
    }

    private function admin()
    {
        return $this->actingAs($this->user('owner', true), 'web')
            ->withSession(['_token' => 'test-token'])
            ->withHeaders(['X-CSRF-TOKEN' => 'test-token', 'Accept' => 'application/json']);
    }

    public function test_only_admins_can_use_the_quotation_api(): void
    {
        $this->getJson('/api/quotes/health')->assertStatus(401);
        $this->get('/api/quotes/documents')->assertStatus(401);
        $this->postJson('/api/quotes/documents', ['type' => 'quotation'])->assertStatus(401);

        $client = $this->user('nimal');
        $this->actingAs($client, 'web')->getJson('/api/quotes/documents')->assertStatus(403);
        $this->actingAs($client, 'web')->withSession(['_token' => 't'])->withHeaders(['X-CSRF-TOKEN' => 't'])
            ->postJson('/api/quotes/documents', ['type' => 'quotation'])->assertStatus(403);
        $this->assertDatabaseCount('quote_documents', 0);
    }

    public function test_changes_need_the_csrf_token(): void
    {
        $admin = $this->user('owner', true);
        $this->actingAs($admin, 'web')->withSession(['_token' => 'right'])->withHeaders(['X-CSRF-TOKEN' => 'wrong'])
            ->postJson('/api/quotes/documents', ['type' => 'quotation'])->assertStatus(419);
        $this->actingAs($admin, 'web')->getJson('/api/quotes/health')->assertOk()->assertJson(['ok' => true]);
    }

    public function test_numbers_due_dates_and_totals(): void
    {
        $api = $this->admin();
        $a = $api->postJson('/api/quotes/documents', ['type' => 'invoice', 'data' => ['issueDate' => '2026-11-19']])->assertCreated()->json();
        $b = $api->postJson('/api/quotes/documents', ['type' => 'invoice', 'data' => ['issueDate' => '2026-11-20']])->json();
        $this->assertSame('SX-INV-2026-001', $a['number']);
        $this->assertSame('SX-INV-2026-002', $b['number']);
        $this->assertSame('2026-12-03', $a['data']['dueDate']);

        $q = $api->postJson('/api/quotes/documents', ['type' => 'quotation', 'data' => [
            'columns' => ['discount' => true],
            'items' => [
                ['kind' => 'heading', 'description' => 'Electrical'],
                ['kind' => 'item', 'description' => 'Surge point', 'qty' => 10, 'rate' => 1000, 'discount' => 500],
                ['kind' => 'item', 'description' => 'Incomplete row', 'qty' => null, 'rate' => 2000],
            ],
            'discount' => ['mode' => 'percent', 'value' => 10],
            'tax' => ['percent' => 18],
            'paid' => 1000,
        ]])->json();
        $this->assertEquals(['subtotal' => 9500, 'discount' => 950, 'tax' => 1539, 'total' => 10089, 'paid' => 1000, 'balance' => 9089], $q['data']['totals']);
        $this->assertEquals(10089, $q['total']);
    }

    public function test_empty_objects_stay_objects(): void
    {
        $api = $this->admin();
        $doc = $api->postJson('/api/quotes/documents', ['type' => 'quotation', 'data' => ['customer' => new \stdClass(), 'meta' => new \stdClass(), 'items' => []]])->json();
        $raw = $api->get('/api/quotes/documents/'.$doc['id'])->getContent();
        $this->assertStringContainsString('"customer":{}', $raw);
        $this->assertStringContainsString('"items":[]', $raw);
    }

    public function test_update_status_search_delete(): void
    {
        $api = $this->admin();
        $doc = $api->postJson('/api/quotes/documents', ['type' => 'quotation', 'data' => ['customer' => ['name' => 'Kopay Hospital'], 'subject' => 'Network points']])->json();
        $data = $doc['data'];
        $data['subject'] = 'Network & surge points';
        $up = $api->putJson('/api/quotes/documents/'.$doc['id'], ['data' => $data, 'status' => 'sent'])->assertOk()->json();
        $this->assertSame('sent', $up['status']);
        $this->assertSame('Network & surge points', $up['subject']);
        $api->patchJson('/api/quotes/documents/'.$doc['id'], ['status' => 'paid'])->assertStatus(422);
        $this->assertCount(1, $api->getJson('/api/quotes/documents?q=hospital')->json());
        $this->assertCount(0, $api->getJson('/api/quotes/documents?type=invoice')->json());
        $api->deleteJson('/api/quotes/documents/'.$doc['id'])->assertOk();
        $api->getJson('/api/quotes/documents/'.$doc['id'])->assertStatus(404)->assertJson(['error' => 'Document not found.']);
    }

    public function test_duplicate_and_convert(): void
    {
        $api = $this->admin();
        $q = $api->postJson('/api/quotes/documents', ['type' => 'quotation', 'status' => 'sent', 'data' => ['customer' => ['name' => 'ABC Stores'], 'items' => [['kind' => 'item', 'description' => 'UPS', 'qty' => 1, 'rate' => 50000]]]])->json();
        $dup = $api->postJson('/api/quotes/documents/'.$q['id'].'/duplicate')->assertCreated()->json();
        $this->assertNotSame($q['number'], $dup['number']);
        $this->assertEquals(50000, $dup['total']);
        $inv = $api->postJson('/api/quotes/documents/'.$q['id'].'/convert')->assertCreated()->json();
        $this->assertSame('invoice', $inv['type']);
        $this->assertSame($q['id'], $inv['source_id']);
        $this->assertSame('Quotation '.$q['number'], $inv['data']['reference']);
        $this->assertSame('accepted', $api->getJson('/api/quotes/documents/'.$q['id'])->json('status'));
        $api->postJson('/api/quotes/documents/'.$inv['id'].'/convert')->assertStatus(422);
    }

    public function test_customers_catalog_settings_stats(): void
    {
        $api = $this->admin();
        $api->postJson('/api/quotes/customers', ['name' => ' '])->assertStatus(422)->assertJsonPath('details.name', 'Enter a name.');
        $c = $api->postJson('/api/quotes/customers', ['name' => 'Jaffna College', 'line1' => 'Vaddukoddai'])->assertCreated()->json();
        $upd = $api->putJson('/api/quotes/customers/'.$c['id'], ['phone' => '0771234567'])->json();
        $this->assertSame('Vaddukoddai', $upd['line1']);
        $this->assertSame('0771234567', $upd['phone']);
        $item = $api->postJson('/api/quotes/catalog', ['description' => 'CAT6 network point', 'unit' => 'Nos.', 'rate' => '3200'])->json();
        $this->assertEquals(3200, $item['rate']);
        $this->assertCount(1, $api->getJson('/api/quotes/catalog')->json());
        $api->deleteJson('/api/quotes/customers/'.$c['id'])->assertOk();
        $api->getJson('/api/quotes/other')->assertStatus(404);

        $r = $api->putJson('/api/quotes/settings', ['settings' => ['company' => ['phone' => '021 000 0000'], 'numbering' => ['quotationPrefix' => 'Q']], 'counters' => ['quotation:2027' => 41]])->json();
        $this->assertSame('021 000 0000', $r['settings']['company']['phone']);
        $this->assertSame('SYNNEX TECHNOLOGY', $r['settings']['company']['name']);
        $this->assertSame('Q-2027-042', $api->postJson('/api/quotes/documents', ['type' => 'quotation', 'data' => ['issueDate' => '2027-02-01']])->json('number'));
        $api->putJson('/api/quotes/settings', ['settings' => ['company' => ['logo' => 'javascript:alert(1)']]])->assertStatus(422);

        $s = $api->getJson('/api/quotes/stats')->assertOk()->json();
        $this->assertSame(1, $s['quotations']);
        $this->assertCount(6, $s['monthly']);
    }

    public function test_backup_restore_and_legacy_import(): void
    {
        $api = $this->admin();
        $api->postJson('/api/quotes/import', ['quotations' => [['name' => 'Old Shop', 'data' => ['recipient1' => 'Old Shop', 'date' => '05/01/2026', 'items' => [['description' => 'Camera', 'unit' => 'Nos.', 'qty' => '4', 'rate' => '12000']], 'discount' => '1000', 'showDiscount' => true]]], 'invoices' => []])
            ->assertOk()->assertJson(['imported' => 1]);
        $doc = $api->getJson('/api/quotes/documents')->json()[0];
        $this->assertEquals(47000, $doc['total']);
        $api->postJson('/api/quotes/customers', ['name' => 'Kytes Hospital']);

        $backup = $api->getJson('/api/quotes/backup')->assertOk()->json();
        $this->assertSame('synnex-quotations', $backup['app']);

        \Illuminate\Support\Facades\DB::table('quote_documents')->delete();
        \Illuminate\Support\Facades\DB::table('quote_customers')->delete();
        $api->postJson('/api/quotes/restore', ['app' => 'other'])->assertStatus(422);
        $res = $api->postJson('/api/quotes/restore', $backup)->assertOk()->json();
        $this->assertSame(2, $res['restored']);
        $this->assertCount(1, $api->getJson('/api/quotes/documents')->json());
        $this->assertSame('Kytes Hospital', $api->getJson('/api/quotes/customers')->json()[0]['name']);
        $api->withHeaders(['Content-Type' => 'application/json'])->call('POST', '/api/quotes/documents', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_CSRF_TOKEN' => 'test-token', 'HTTP_ACCEPT' => 'application/json'], '{not json')->assertStatus(400);
    }
}
