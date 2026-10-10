<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Customer;
use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsCustomer
{
    /**
     * Allow only authenticated Customer instances to proceed.
     * Guests → login redirect; User (admin) → redirected to /admin.
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

        if (! ($authUser instanceof Customer)) {
            // Authenticated admin trying to reach customer area: redirect to admin
            return redirect()->route('admin.dashboard')->with('status', __('This area is for customer accounts only.'));
        }

        return $next($request);
    }
}
