<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Http\Responses\LoginResponse as AuthenticatedLoginResponse;
use App\Http\Responses\VerifyEmailResponse as AuthenticatedVerifyEmailResponse;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, AuthenticatedLoginResponse::class);
        $this->app->singleton(VerifyEmailResponseContract::class, AuthenticatedVerifyEmailResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        // Sequential authentication: admin (users) table first, fall back to customers table.
        // If admin authentication fails (no match OR wrong password), automatically retry
        // the SAME credentials against the customers table.
        // Returning null always produces the exact same generic validation error message
        // regardless of the failure reason (prevents email enumeration).
        // IMPORTANT: do NOT call Auth::login() here — Fortify does that internally AFTER
        // checking two-factor / confirming the pipeline. Calling login() here would bypass
        // 2FA challenges (user would be fully authenticated before Fortify's 2FA guard).
        Fortify::authenticateUsing(function (Request $request) {
            $email = $request->input(Fortify::username());
            $password = $request->input('password');

            // STEP 1: Try admin User model first.
            $adminUser = User::query()
                ->where(Fortify::username(), $email)
                ->first();

            if ($adminUser !== null && Hash::check($password, $adminUser->getAuthPassword())) {
                return $adminUser;
            }

            // STEP 2: Fall through to Customer. Per spec we retry on both no-match AND wrong password.
            $customer = Customer::query()
                ->where(Fortify::username(), $email)
                ->first();

            if ($customer !== null && Hash::check($password, $customer->getAuthPassword())) {
                return $customer;
            }

            // BOTH failed. Return null so Fortify emits generic "credentials do not match" error.
            return null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
    }
}
