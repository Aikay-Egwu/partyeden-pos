<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyAccount;
use App\Services\LoyaltyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Loyalty Accounts (view + adjust).
 */
class AdminLoyaltyController extends Controller
{
    public function index(Request $request, LoyaltyService $loyalty): Response
    {
        $accounts = LoyaltyAccount::query()
            ->when($request->search, fn ($q, $s) => $q->whereHas('customer', function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            }))
            ->with('customer')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/loyalty/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search']),
            'settings' => $loyalty->settings(),
            'summary' => [
                'active_accounts' => LoyaltyAccount::query()->where('is_active', true)->count(),
                'points_balance_total' => (float) LoyaltyAccount::query()->sum('points_balance'),
                'points_earned_total' => (float) LoyaltyAccount::query()->sum('total_points_earned'),
                'points_redeemed_total' => (float) LoyaltyAccount::query()->sum('total_points_redeemed'),
            ],
        ]);
    }

    public function show(LoyaltyAccount $loyaltyAccount, LoyaltyService $loyalty): Response
    {
        return Inertia::render('admin/loyalty/show', [
            'account' => $loyaltyAccount->load(['customer', 'transactions' => fn ($q) => $q->latest()->limit(50)]),
            'settings' => $loyalty->settings(),
        ]);
    }

    public function updateSettings(Request $request, LoyaltyService $loyalty): RedirectResponse
    {
        $validated = $request->validate([
            'points_per_currency_unit' => ['required', 'numeric', 'min:0'],
            'currency_value_per_point' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $loyalty->updateSettings(
            (float) $validated['points_per_currency_unit'],
            (float) $validated['currency_value_per_point'],
            (bool) $validated['is_active'],
        );

        return back()->with('success', 'Loyalty settings updated.');
    }

    public function adjust(
        Request $request,
        LoyaltyAccount $loyaltyAccount,
        LoyaltyService $loyalty,
    ): RedirectResponse {
        $validated = $request->validate([
            'points' => ['required', 'numeric'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $points = round((float) $validated['points'], 4);

        if ($points === 0.0) {
            return back()->withErrors([
                'points' => 'Enter a point adjustment greater than zero or less than zero.',
            ]);
        }

        if ($points < 0 && abs($points) > (float) $loyaltyAccount->points_balance) {
            return back()->withErrors([
                'points' => 'You cannot debit more points than the current balance.',
            ]);
        }

        $loyalty->adjust($loyaltyAccount, $points, $validated['reason']);

        return back()->with('success', 'Loyalty balance updated.');
    }
}
