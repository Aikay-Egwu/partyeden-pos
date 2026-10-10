<?php

declare(strict_types=1);

namespace App\Http\Responses;

use App\Models\Customer;
use App\Models\User;
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

        // Role-aware post-verification redirect, mirroring LoginResponse.
        $defaultPath = match (true) {
            $user instanceof User => route('admin.dashboard'),
            $user instanceof Customer => route('customer.dashboard'),
            default => route('dashboard'),
        };

        return redirect()->intended($defaultPath);
    }
}
