<?php

use App\Http\Middleware\Authenticate;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsCustomer;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogAuthAttempt;
use App\Http\Middleware\RecordPageView;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            RecordPageView::class,
            LogAuthAttempt::class,
        ]);

        // Exempt PayPal + Stripe webhooks from CSRF — called by payment servers directly
        $middleware->validateCsrfTokens(except: [
            'api/paypal/webhook',
            'payment/stripe-webhook',
        ]);

        // Role-based redirect for already-authenticated users visiting guest pages
        // (login, register, password reset). Overrides the default RedirectIfAuthenticated target.
        $middleware->redirectUsersTo(function (Request $request): string {
            /** @var User|Customer|null $user */
            $user = $request->user();

            return match (true) {
                $user instanceof User => route('admin.dashboard'),
                $user instanceof Customer => route('customer.dashboard'),
                default => route('dashboard'),
            };
        });

        // Auth alias + role guard aliases
        $middleware->alias([
            'auth' => Authenticate::class,
            'role.admin' => EnsureIsAdmin::class,
            'role.customer' => EnsureIsCustomer::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('analytics:prune')->dailyAt('03:10')->withoutOverlapping(30);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
