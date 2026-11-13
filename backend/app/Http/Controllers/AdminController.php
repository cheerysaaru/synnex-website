<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /** Owner-only dashboard data: accounts, sign-in stats and enquiries. */
    public function overview(): JsonResponse
    {
        return response()->json([
            'totals' => [
                'accounts' => User::count(),
                'signed_in_users' => User::where('login_count', '>', 0)->count(),
                'total_logins' => (int) User::sum('login_count'),
                'active_last_7_days' => User::where('last_login_at', '>=', now()->subDays(7))->count(),
                'enquiries' => ContactSubmission::count(),
                'enquiries_last_7_days' => ContactSubmission::where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'users' => User::query()
                ->orderByDesc('last_login_at')
                ->limit(200)
                ->get(['id', 'name', 'username', 'email', 'login_count', 'last_login_at', 'created_at']),
            'enquiries' => ContactSubmission::query()
                ->latest()
                ->limit(100)
                ->get(['id', 'name', 'email', 'phone', 'service', 'message', 'user_id', 'created_at']),
        ]);
    }
}
