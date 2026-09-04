<?php

namespace App\Providers;

use App\Events\OrderStatusChanged;
use App\Jobs\SendOrderStatusEmail;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureGates();
        $this->configureEventListeners();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // Fail loudly in dev/tests if a mass-assigned attribute is not in a
        // model's $fillable list — prevents silent data loss as models move
        // from $guarded = [] to explicit allow-lists.
        Model::preventSilentlyDiscardingAttributes(
            ! app()->isProduction(),
        );

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure gate checks using the user's JSON permissions column.
     * Wildcard '*' grants all permissions (super-admin).
     */
    protected function configureGates(): void
    {
        Gate::before(function ($user, string $ability) {
            if (method_exists($user, 'hasPermission')) {
                return $user->hasPermission($ability) ?: null;
            }

            return null;
        });

        Gate::define('admin', fn ($user) => method_exists($user, 'hasPermission') ? $user->hasPermission('admin') : false);

    }

    /**
     * Register event → listener mappings for the application.
     */
    protected function configureEventListeners(): void
    {
        // Send status-update email to the customer whenever an admin changes order status
        Event::listen(
            OrderStatusChanged::class,
            function (OrderStatusChanged $event): void {
                SendOrderStatusEmail::dispatch($event->order, $event->previousStatus);
            },
        );
    }
}
