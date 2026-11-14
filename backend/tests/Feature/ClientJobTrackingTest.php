<?php

namespace Tests\Feature;

use App\Models\ClientJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientJobTrackingTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $username, bool $admin = false): User
    {
        $user = User::create([
            'name' => ucfirst($username),
            'username' => $username,
            'email' => $username.'@example.com',
            'password' => 'secret-password',
        ]);
        $user->forceFill(['is_admin' => $admin])->save();
        return $user;
    }

    /** Session + matching CSRF header, as the browser sends them. */
    private function as(User $user)
    {
        return $this->actingAs($user, 'web')
            ->withSession(['_token' => 'test-token'])
            ->withHeaders(['X-CSRF-TOKEN' => 'test-token', 'Accept' => 'application/json']);
    }

    public function test_guests_cannot_see_jobs(): void
    {
        $this->getJson('/api/my/jobs')->assertStatus(401);
        // Even without an Accept header the API answers 401 in JSON (no redirect / 500).
        $this->get('/api/my/jobs')->assertStatus(401)->assertJson(['message' => 'Unauthenticated.']);
        $this->get('/api/admin/jobs')->assertStatus(401);
    }

    public function test_admin_creates_job_and_client_sees_only_their_own(): void
    {
        Storage::fake('local');
        $admin = $this->user('owner', true);
        $client = $this->user('nimal');
        $other = $this->user('kamal');

        $created = $this->as($admin)->postJson('/api/admin/jobs', [
            'user_id' => $client->id,
            'title' => 'Rooftop solar PV system',
            'location' => 'Nugegoda',
            'service' => 'Solar PV systems',
        ])->assertCreated()->json('job');

        $this->assertSame(0, $created['completed_steps']);
        $this->assertCount(5, $created['step_notes']);
        $this->assertSame('nimal', $created['client']['username']);

        $this->as($client)->getJson('/api/my/jobs')
            ->assertOk()
            ->assertJsonCount(1, 'jobs')
            ->assertJsonPath('jobs.0.title', 'Rooftop solar PV system')
            ->assertJsonMissingPath('jobs.0.client');

        $this->as($other)->getJson('/api/my/jobs')->assertOk()->assertJsonCount(0, 'jobs');
    }

    public function test_steps_notes_and_dates(): void
    {
        $admin = $this->user('owner', true);
        $client = $this->user('nimal');
        $job = ClientJob::create(['user_id' => $client->id, 'title' => 'Rewiring']);

        $res = $this->as($admin)->patchJson("/api/admin/jobs/{$job->id}", [
            'completed_steps' => 2,
            'step_notes' => ['Quote signed', '  Site checked  ', '', null, null],
        ])->assertOk()->json('job');

        $this->assertSame(2, $res['completed_steps']);
        $this->assertSame(['Quote signed', 'Site checked', null, null, null], $res['step_notes']);
        $this->assertNotNull($res['step_dates'][0]);
        $this->assertNotNull($res['step_dates'][1]);
        $this->assertNull($res['step_dates'][2]);

        // Un-ticking clears the later dates.
        $res = $this->as($admin)->patchJson("/api/admin/jobs/{$job->id}", ['completed_steps' => 1])->json('job');
        $this->assertNotNull($res['step_dates'][0]);
        $this->assertNull($res['step_dates'][1]);

        $this->as($admin)->patchJson("/api/admin/jobs/{$job->id}", ['completed_steps' => 9])->assertStatus(422);
    }

    public function test_only_admins_can_manage_jobs(): void
    {
        $client = $this->user('nimal');
        $job = ClientJob::create(['user_id' => $client->id, 'title' => 'Rewiring']);

        $this->as($client)->getJson('/api/admin/jobs')->assertStatus(403);
        $this->as($client)->patchJson("/api/admin/jobs/{$job->id}", ['completed_steps' => 5])->assertStatus(403);
        $this->assertSame(0, $job->fresh()->completed_steps);
    }

    public function test_admin_changes_need_the_csrf_token(): void
    {
        $admin = $this->user('owner', true);
        $client = $this->user('nimal');

        $this->actingAs($admin, 'web')
            ->withSession(['_token' => 'test-token'])
            ->postJson('/api/admin/jobs', ['user_id' => $client->id, 'title' => 'X'])
            ->assertStatus(419);
    }

    public function test_photos_are_private_to_the_client_and_admin(): void
    {
        Storage::fake('local');
        $admin = $this->user('owner', true);
        $client = $this->user('nimal');
        $other = $this->user('kamal');
        $job = ClientJob::create(['user_id' => $client->id, 'title' => 'Solar']);

        $res = $this->as($admin)->post("/api/admin/jobs/{$job->id}/photos", [
            'step' => 2,
            'caption' => 'Panels fitted',
            'photo' => UploadedFile::fake()->image('panels.jpg', 1200, 800),
        ])->assertCreated()->json();

        $url = '/api'.$res['photo']['url'];
        $this->assertSame(2, $res['photo']['step']);
        $this->assertCount(1, $res['job']['photos']);

        $this->as($client)->get($url)->assertOk();
        $this->as($admin)->get($url)->assertOk();
        $this->as($other)->get($url)->assertNotFound();

        // Non-images are rejected.
        $this->as($admin)->post("/api/admin/jobs/{$job->id}/photos", [
            'step' => 1,
            'photo' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'),
        ])->assertStatus(422);

        // Deleting the job removes its photo files.
        $path = $job->photos()->first()->path;
        Storage::disk('local')->assertExists($path);
        $this->as($admin)->deleteJson("/api/admin/jobs/{$job->id}")->assertOk();
        Storage::disk('local')->assertMissing($path);
    }
}
