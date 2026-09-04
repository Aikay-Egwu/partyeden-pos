<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\GiftCard\StoreGiftCardRequest;
use App\Http\Requests\GiftCard\UpdateGiftCardRequest;
use App\Models\Customer;
use App\Models\GiftCard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Gift Cards CRUD.
 * Issue and manage gift cards with balance adjustments.
 */
class AdminGiftCardController extends Controller
{
    public function index(Request $request): Response
    {
        $giftCards = GiftCard::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('code', 'like', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with('customer')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/gift-cards/index', [
            'giftCards' => $giftCards,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/gift-cards/form', [
            'giftCard' => null,
            'customers' => Customer::where('is_active', true)->orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(StoreGiftCardRequest $request)
    {
        // Generate the code and opening balance server-side (same as the API controller)
        GiftCard::create(array_merge($request->validated(), [
            'code' => 'GC-'.strtoupper(Str::random(10)),
            'current_balance' => $request->validated('original_amount'),
            'status' => 'active',
            'issued_at' => now(),
            'issued_by' => $request->user()?->id,
        ]));

        return redirect()->route('gift-cards.index')
            ->with('success', 'Gift card created successfully.');
    }

    public function edit(GiftCard $giftCard): Response
    {
        return Inertia::render('admin/gift-cards/form', [
            'giftCard' => $giftCard->load('customer'),
            'customers' => Customer::where('is_active', true)->orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function update(UpdateGiftCardRequest $request, GiftCard $giftCard)
    {
        $giftCard->update($request->validated());

        return redirect()->route('gift-cards.index')
            ->with('success', 'Gift card updated successfully.');
    }

    public function destroy(GiftCard $giftCard)
    {
        $giftCard->delete();

        return redirect()->route('gift-cards.index')
            ->with('success', 'Gift card deleted successfully.');
    }
}
