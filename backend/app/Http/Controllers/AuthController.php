<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /** Issue the CSRF token the client sends with auth mutations. */
    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['token' => $request->session()->token()]);
    }

    public function signup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[A-Za-z0-9._-]+$/'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ]);

        $username = Str::lower($data['username']);

        // Case-insensitive uniqueness, regardless of database collation.
        if (User::whereRaw('LOWER(username) = ?', [$username])->exists()) {
            return response()->json([
                'message' => 'That username is already taken.',
                'errors' => ['username' => ['That username is already taken.']],
            ], 422);
        }

        $user = User::create([
            'name' => $data['fullName'],
            'username' => $username,
            'email' => null,
            'password' => $data['password'],
        ]);

        Auth::guard('web')->login($user, false);
        $request->session()->regenerate();

        return $this->authResponse($request, $user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::whereRaw('LOWER(username) = ?', [Str::lower($data['username'])])->first();

        // Same generic message for an unknown user and a wrong password.
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect username or password.'], 422);
        }

        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
            'login_count' => ((int) $user->login_count) + 1,
        ])->save();

        return $this->authResponse($request, $user);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'user' => null,
            'csrfToken' => $request->session()->token(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->publicUser(Auth::guard('web')->user()),
            'csrfToken' => $request->session()->token(),
        ]);
    }

    protected function authResponse(Request $request, User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'user' => $this->publicUser($user),
            'csrfToken' => $request->session()->token(),
        ], $status);
    }

    protected function publicUser(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'username' => $user->username,
            'fullName' => $user->name,
            'is_admin' => (bool) $user->is_admin,
        ];
    }
}
