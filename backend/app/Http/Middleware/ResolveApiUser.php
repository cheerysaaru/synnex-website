<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves a session user when one is present, but never rejects the request
 * when the visitor is a guest. Used on public endpoints (e.g. the contact
 * form) that want to optionally link a submission to the signed-in user.
 */
class ResolveApiUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if ($user) {
            $request->setUserResolver(fn () => $user);
        }

        return $next($request);
    }
}
