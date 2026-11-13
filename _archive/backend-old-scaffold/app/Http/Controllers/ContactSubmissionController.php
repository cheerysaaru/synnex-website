<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;

class ContactSubmissionController extends Controller
{
    public function store(StoreContactSubmissionRequest $request): JsonResponse
    {
        $submission = ContactSubmission::create($request->validated());

        return response()->json([
            'message' => 'Your enquiry has been received.',
            'id' => $submission->id,
        ], 201);
    }
}
