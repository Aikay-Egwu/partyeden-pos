<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltySetting;
use App\Models\LoyaltyTransaction;
use App\Models\Order;

/**
 * Centralises loyalty settings, point earning, and checkout redemption rules.
 */
class LoyaltyService
{
    public function settings(): LoyaltySetting
    {
        /** @var LoyaltySetting $settings */
        $settings = LoyaltySetting::query()->firstOrCreate([], [
            'points_per_currency_unit' => 1,
            'currency_value_per_point' => 0.01,
            'is_active' => true,
        ]);

        return $settings;
    }

    public function updateSettings(float $pointsPerCurrencyUnit, float $currencyValuePerPoint, bool $isActive = true): LoyaltySetting
    {
        $settings = $this->settings();

        $settings->update([
            'points_per_currency_unit' => round(max($pointsPerCurrencyUnit, 0), 4),
            'currency_value_per_point' => round(max($currencyValuePerPoint, 0), 4),
            'is_active' => $isActive,
        ]);

        return $settings->refresh();
    }

    public function accountForEmail(?string $email): ?LoyaltyAccount
    {
        if ($email === null || trim($email) === '') {
            return null;
        }

        return LoyaltyAccount::query()
            ->with('customer')
            ->whereHas('customer', fn ($query) => $query->where('email', trim($email)))
            ->where('is_active', true)
            ->first();
    }

    public function ensureAccount(Customer $customer): LoyaltyAccount
    {
        /** @var LoyaltyAccount $account */
        $account = $customer->loyaltyAccount()->firstOrCreate([], [
            'points_balance' => 0,
            'total_points_earned' => 0,
            'total_points_redeemed' => 0,
            'is_active' => true,
        ]);

        return $account;
    }

    /**
     * Returns the valid points/discount pair for the requested order total.
     *
     * @return array{points: float, amount: float}
     */
    public function redemptionPreview(?LoyaltyAccount $account, float $requestedPoints, float $orderTotal): array
    {
        $settings = $this->settings();

        if (
            ! $settings->is_active ||
            ! $account instanceof LoyaltyAccount ||
            ! $account->is_active ||
            $requestedPoints <= 0 ||
            $orderTotal <= 0
        ) {
            return ['points' => 0.0, 'amount' => 0.0];
        }

        $valuePerPoint = (float) $settings->currency_value_per_point;

        if ($valuePerPoint <= 0) {
            return ['points' => 0.0, 'amount' => 0.0];
        }

        $maxPointsForTotal = floor(($orderTotal / $valuePerPoint) * 10000) / 10000;
        $points = min(
            round($requestedPoints, 4),
            (float) $account->points_balance,
            $maxPointsForTotal,
        );

        if ($points <= 0) {
            return ['points' => 0.0, 'amount' => 0.0];
        }

        $amount = round($points * $valuePerPoint, 2);

        return [
            'points' => $points,
            'amount' => min($amount, round($orderTotal, 2)),
        ];
    }

    public function applyRedemption(LoyaltyAccount $account, Order $order, float $points): ?LoyaltyTransaction
    {
        $preview = $this->redemptionPreview($account, $points, (float) $order->subtotal + (float) $order->shipping_amount);

        if ($preview['points'] <= 0 || $preview['amount'] <= 0) {
            return null;
        }

        $existingTransaction = LoyaltyTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'redeem')
            ->first();

        if ($existingTransaction instanceof LoyaltyTransaction) {
            return $existingTransaction;
        }

        $newBalance = round((float) $account->points_balance - $preview['points'], 4);

        $account->update([
            'points_balance' => $newBalance,
            'total_points_redeemed' => round((float) $account->total_points_redeemed + $preview['points'], 4),
        ]);

        /** @var LoyaltyTransaction $transaction */
        $transaction = $account->transactions()->create([
            'type' => 'redeem',
            'points' => -$preview['points'],
            'balance_after' => $newBalance,
            'order_id' => $order->id,
            'description' => "Redeemed on order {$order->order_number}",
            'staff_id' => null,
        ]);

        return $transaction;
    }

    public function awardForOrder(Order $order): ?LoyaltyTransaction
    {
        if ($order->customer_id === null) {
            return null;
        }

        $existingTransaction = LoyaltyTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'earn')
            ->first();

        if ($existingTransaction instanceof LoyaltyTransaction) {
            return $existingTransaction;
        }

        $settings = $this->settings();

        if (! $settings->is_active || (float) $settings->points_per_currency_unit <= 0) {
            return null;
        }

        $customer = $order->customer;

        if (! $customer instanceof Customer) {
            return null;
        }

        $earnableAmount = max((float) $order->subtotal - (float) $order->discount_amount, 0);
        $points = round($earnableAmount * (float) $settings->points_per_currency_unit, 4);

        if ($points <= 0) {
            return null;
        }

        $account = $this->ensureAccount($customer);
        $newBalance = round((float) $account->points_balance + $points, 4);

        $account->update([
            'points_balance' => $newBalance,
            'total_points_earned' => round((float) $account->total_points_earned + $points, 4),
        ]);

        $order->forceFill([
            'loyalty_points_earned' => $points,
        ])->save();

        /** @var LoyaltyTransaction $transaction */
        $transaction = $account->transactions()->create([
            'type' => 'earn',
            'points' => $points,
            'balance_after' => $newBalance,
            'order_id' => $order->id,
            'description' => "Earned from order {$order->order_number}",
            'staff_id' => null,
        ]);

        return $transaction;
    }

    public function adjust(LoyaltyAccount $account, float $points, string $reason): LoyaltyTransaction
    {
        $newBalance = round((float) $account->points_balance + $points, 4);

        $updateData = [
            'points_balance' => $newBalance,
        ];

        if ($points > 0) {
            $updateData['total_points_earned'] = round((float) $account->total_points_earned + $points, 4);
        }

        if ($points < 0) {
            $updateData['total_points_redeemed'] = round((float) $account->total_points_redeemed + abs($points), 4);
        }

        $account->update($updateData);

        /** @var LoyaltyTransaction $transaction */
        $transaction = $account->transactions()->create([
            'type' => 'adjust',
            'points' => $points,
            'balance_after' => $newBalance,
            'description' => $reason,
            'staff_id' => null,
        ]);

        return $transaction;
    }
}
