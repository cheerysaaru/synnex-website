<?php

namespace App\Http\Controllers;

use App\Models\ClientJob;
use App\Models\ClientJobPhoto;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/** Owner-only: create client jobs, move them through the steps, add notes and photos. */
class AdminJobController extends Controller
{
    public function index(): JsonResponse
    {
        $jobs = ClientJob::query()
            ->with(['photos', 'user'])
            ->latest('updated_at')
            ->get()
            ->map(fn (ClientJob $job) => $job->toTrackingArray(true));

        return response()->json(['jobs' => $jobs]);
    }

    /** Client accounts to pick from when creating a job. */
    public function clients(): JsonResponse
    {
        return response()->json([
            'clients' => User::query()->orderBy('name')->get(['id', 'name', 'username', 'email']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:160'],
            'location' => ['nullable', 'string', 'max:160'],
            'service' => ['nullable', 'string', 'max:160'],
        ]);

        $job = ClientJob::create([...$data, 'completed_steps' => 0]);

        return response()->json(['job' => $job->load(['photos', 'user'])->toTrackingArray(true)], 201);
    }

    public function update(Request $request, ClientJob $job): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'location' => ['sometimes', 'nullable', 'string', 'max:160'],
            'service' => ['sometimes', 'nullable', 'string', 'max:160'],
            'completed_steps' => ['sometimes', 'integer', 'min:0', 'max:'.ClientJob::STEPS],
            'step_notes' => ['sometimes', 'array', 'max:'.ClientJob::STEPS],
            'step_notes.*' => ['nullable', 'string', 'max:1000'],
            'quote_amount' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100000000000'],
            'deposit_percent' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'deposit_paid' => ['sometimes', 'boolean'],
            'final_paid' => ['sometimes', 'boolean'],
        ]);

        // ---- payments: mark received / not received
        if (array_key_exists('final_paid', $data)) {
            if ($data['final_paid']) {
                $data['final_paid_at'] = $job->final_paid_at ?? now()->toDateString();
                // full payment includes the deposit
                $data['deposit_paid_at'] = $job->deposit_paid_at ?? now()->toDateString();
            } else {
                if ($job->completed_steps >= ClientJob::STEPS) {
                    abort(422, 'Untick Handover before marking the final payment as not received.');
                }
                $data['final_paid_at'] = null;
            }
            unset($data['final_paid']);
        }
        if (array_key_exists('deposit_paid', $data)) {
            if ($data['deposit_paid']) {
                $data['deposit_paid_at'] = $data['deposit_paid_at'] ?? $job->deposit_paid_at ?? now()->toDateString();
            } else {
                if ($job->completed_steps > ClientJob::DEPOSIT_GATE) {
                    abort(422, 'Untick the later steps before marking the deposit as not received.');
                }
                if (($data['final_paid_at'] ?? $job->final_paid_at) !== null) {
                    abort(422, 'The final payment is marked as received. Unmark it first.');
                }
                $data['deposit_paid_at'] = null;
            }
            unset($data['deposit_paid']);
        }

        // ---- steps cannot go past an unpaid checkpoint
        if (array_key_exists('completed_steps', $data)) {
            $preview = $job->replicate();
            $preview->fill(array_intersect_key($data, array_flip(['deposit_paid_at', 'final_paid_at'])));
            $max = $preview->maxCompletableSteps();
            if ($data['completed_steps'] > $max) {
                abort(422, $max < ClientJob::FINAL_GATE
                    ? 'Mark the deposit as received before starting the work.'
                    : 'Mark the final payment as received before handover.');
            }
        }

        if (array_key_exists('step_notes', $data)) {
            $notes = [];
            for ($i = 0; $i < ClientJob::STEPS; $i++) {
                $value = $data['step_notes'][$i] ?? null;
                $notes[] = is_string($value) && trim($value) !== '' ? trim($value) : null;
            }
            $data['step_notes'] = $notes;
        }

        // Date each step when it is ticked off; clear the date when it is un-ticked.
        if (array_key_exists('completed_steps', $data)) {
            $dates = $job->datesList();
            for ($i = 0; $i < ClientJob::STEPS; $i++) {
                if ($i < $data['completed_steps']) {
                    $dates[$i] ??= now()->toDateString();
                } else {
                    $dates[$i] = null;
                }
            }
            $data['step_dates'] = $dates;
        }

        $job->update($data);

        return response()->json(['job' => $job->fresh(['photos', 'user'])->toTrackingArray(true)]);
    }

    public function destroy(ClientJob $job): JsonResponse
    {
        foreach ($job->photos as $photo) {
            Storage::disk('local')->delete($photo->path);
        }
        $job->delete();

        return response()->json(['deleted' => true]);
    }

    public function storePhoto(Request $request, ClientJob $job): JsonResponse
    {
        $data = $request->validate([
            'step' => ['required', 'integer', 'min:0', 'max:'.(ClientJob::STEPS - 1)],
            'photo' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:200'],
        ]);

        $path = $request->file('photo')->store('job-photos/'.$job->id, 'local');

        $photo = $job->photos()->create([
            'step' => $data['step'],
            'path' => $path,
            'caption' => $data['caption'] ?? null,
        ]);
        $job->touch();

        return response()->json([
            'photo' => ['id' => $photo->id, 'step' => $photo->step, 'caption' => $photo->caption, 'url' => '/job-photos/'.$photo->id],
            'job' => $job->fresh(['photos', 'user'])->toTrackingArray(true),
        ], 201);
    }

    public function destroyPhoto(ClientJobPhoto $photo): JsonResponse
    {
        $job = $photo->job;
        Storage::disk('local')->delete($photo->path);
        $photo->delete();
        $job?->touch();

        return response()->json(['deleted' => true, 'job' => $job?->fresh(['photos', 'user'])->toTrackingArray(true)]);
    }
}
