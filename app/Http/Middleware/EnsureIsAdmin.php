<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Allow only authenticated User (admin) instances to proceed.
     * Guests → login redirect; Customers → redirected to /customer with a flash message.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->guest(route('login'));
        }

        /** @var Authenticatable|null $authUser */
        $authUser = Auth::user();

        if (! ($authUser instanceof User)) {
            // Authenticated customer trying to reach admin: redirect to customer home
            return redirect()->route('customer.dashboard')->with('status', __('This area is for staff only.'));
        }

        return $next($request);
    }
}
