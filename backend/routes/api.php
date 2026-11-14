<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminJobController;
use App\Http\Controllers\ClientJobController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactSubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'synnext-api']);
});

// Session-authenticated auth endpoints. Mutations require the CSRF token that
// GET /auth/csrf issues and the client returns in the X-CSRF-TOKEN header.
Route::get('/auth/csrf', [AuthController::class, 'csrf']);

Route::post('/auth/signup', [AuthController::class, 'signup'])
    ->middleware(['throttle:6,1', 'csrf']);

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware(['throttle:6,1', 'csrf']);

Route::post('/auth/logout', [AuthController::class, 'logout'])
    ->middleware('csrf');

Route::get('/auth/me', [AuthController::class, 'me']);

// Public form, but optionally linked to the signed-in user when a session exists.
Route::post('/contact-submissions', [ContactSubmissionController::class, 'store'])
    ->middleware(['throttle:20,1', 'api.optional', 'csrf']);

Route::middleware('auth:web')->group(function () {
    Route::get('/my/enquiries', [ContactSubmissionController::class, 'index']);

    // Job tracking: the client's own jobs, and their private photos.
    Route::get('/my/jobs', [ClientJobController::class, 'index']);
    Route::get('/job-photos/{photo}', [ClientJobController::class, 'photo']);
});

// Owner-only. Not linked anywhere public; the route also returns 403 for non-admins.
Route::middleware(['auth:web', 'admin'])->group(function () {
    Route::get('/admin/overview', [AdminController::class, 'overview']);

    // Client job tracking (manage jobs, steps, notes and photos).
    Route::get('/admin/clients', [AdminJobController::class, 'clients']);
    Route::get('/admin/jobs', [AdminJobController::class, 'index']);
    Route::middleware('csrf')->group(function () {
        Route::post('/admin/jobs', [AdminJobController::class, 'store']);
        Route::patch('/admin/jobs/{job}', [AdminJobController::class, 'update']);
        Route::delete('/admin/jobs/{job}', [AdminJobController::class, 'destroy']);
        Route::post('/admin/jobs/{job}/photos', [AdminJobController::class, 'storePhoto']);
        Route::delete('/admin/job-photos/{photo}', [AdminJobController::class, 'destroyPhoto']);
    });
});
