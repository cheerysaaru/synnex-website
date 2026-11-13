<?php

use App\Http\Controllers\ContactSubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'synnext-api']);
});

Route::post('/contact-submissions', [ContactSubmissionController::class, 'store']);
