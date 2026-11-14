<?php

namespace App\Http\Controllers;

use App\Models\ClientJob;
use App\Models\ClientJobPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/** What a signed-in client sees: their own jobs and photos. */
class ClientJobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = ClientJob::query()
            ->where('user_id', $request->user()->id)
            ->with('photos')
            ->latest('updated_at')
            ->get()
            ->map(fn (ClientJob $job) => $job->toTrackingArray());

        return response()->json(['jobs' => $jobs]);
    }

    /** Photos are private: only the job's client or an admin can open them. */
    public function photo(Request $request, ClientJobPhoto $photo): Response
    {
        $user = $request->user();
        $job = $photo->job;

        if (! $job || (! $user->is_admin && $job->user_id !== $user->id)) {
            abort(404);
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($photo->path)) {
            abort(404);
        }

        return $disk->response($photo->path, null, [
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }
}
