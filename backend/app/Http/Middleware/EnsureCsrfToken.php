<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CSRF check for session-authenticated API mutations. The token is issued by
 * GET /api/auth/csrf and sent back in the X-CSRF-TOKEN header.
 */
class EnsureCsrfToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $sent = $request->header('X-CSRF-TOKEN');
        $session = $request->session()->token();

        if (! is_string($sent) || ! is_string($session) || ! hash_equals($session, $sent)) {
            abort(419, 'CSRF token mismatch.');
        }

        return $next($request);
    }
}
