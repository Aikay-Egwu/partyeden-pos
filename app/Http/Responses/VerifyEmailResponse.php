<?php

declare(strict_types=1);

namespace App\Http\Responses;

use App\Models\Customer;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    /**
     * Create an HTTP response for a successful email verification.
     *
     * @return JsonResponse|RedirectResponse
     */
    public function toResponse(mixed $request): mixed
    {
        if ($request->wantsJson()) {
            return response()->json('', 204);
        }

        /** @var Authenticatable|null $user */
        $user = $request->user();

        // Customers land in their own portal after verifying. Admins keep the
        // default dashboard, mirroring Fortify's standard post-verification
        // redirect (which appends ?verified=1 for the UI confirmation banner).
        $defaultPath = $user instanceof Customer
            ? route('customer.dashboard', absolute: false)
            : route('dashboard', absolute: false);

        return redirect()->intended($defaultPath.'?verified=1');
    }
}
