<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;

class Authenticate extends Middleware
{
    /**
     * Handle an unauthenticated user by redirecting to login.
     *
     * We override the default behavior (which throws AuthenticationException)
     * because Laravel's exception handler converts it to JSON for XHR requests
     * — Inertia.js uses XHR, so it receives raw JSON instead of a redirect.
     */
    protected function unauthenticated($request, array $guards): void
    {
        throw new HttpResponseException(
            redirect()->guest(route('login'))
        );
    }
}
