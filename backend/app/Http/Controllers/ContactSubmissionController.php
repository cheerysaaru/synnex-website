<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Mail\NewContactSubmission;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactSubmissionController extends Controller
{
    /** The signed-in user's own enquiries, newest first. */
    public function index(Request $request): JsonResponse
    {
        $enquiries = ContactSubmission::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get([
                'id',
                'name',
                'email',
                'phone',
                'service',
                'message',
                'created_at',
            ]);

        return response()->json(['enquiries' => $enquiries]);
    }

    public function store(StoreContactSubmissionRequest $request): JsonResponse
    {
        $submission = ContactSubmission::create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
        ]);

        $this->notifyOwner($submission);

        return response()->json([
            'message' => 'Your enquiry has been received.',
            'id' => $submission->id,
        ], 201);
    }

    /**
     * Email the owner a copy of the enquiry. Failure to send must never make
     * a successfully stored enquiry look like an error to the visitor.
     */
    protected function notifyOwner(ContactSubmission $submission): void
    {
        try {
            Mail::to(config('mail.owner_address'))->send(new NewContactSubmission($submission));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
