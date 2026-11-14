<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Session cookies for the API routes: the React app calls /api through
        // the Vite proxy, so requests are same-origin and SameSite=Lax works.
        $middleware->api(prepend: [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        // API visitors who are not logged in get a 401, not a redirect.
        $middleware->redirectGuestsTo(fn ($request) => $request->is('api/*') ? null : '/login');

        $middleware->alias([
            'api.optional' => \App\Http\Middleware\ResolveApiUser::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'csrf' => \App\Http\Middleware\EnsureCsrfToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // The API always answers in JSON (e.g. 401 when not logged in), never
        // with a redirect to a login page that does not exist on the API.
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
