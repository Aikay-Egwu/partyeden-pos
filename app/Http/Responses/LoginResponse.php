<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response for a successful login.
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        // Send admins to the admin dashboard and keep everyone else
        // on the standard authenticated dashboard.
        $defaultPath = $request->user()?->can('admin')
            ? route('admin.dashboard')
            : route('dashboard');

        return redirect()->intended($defaultPath);
    }
}
