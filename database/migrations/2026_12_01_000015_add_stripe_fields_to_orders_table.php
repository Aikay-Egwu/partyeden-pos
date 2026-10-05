<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Stripe payment tracking fields to the orders table.
     *
     * Supports Stripe PaymentIntents checkout integration with fields for
     * reconciliation: PaymentIntent ID (unique idempotency key), charge ID,
     * customer ID (for future reuse), card brand + last4 for receipts,
     * and payment method type. Also widens the payment_method comment to
     * include 'stripe' alongside existing providers.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('stripe_payment_intent_id')->nullable()->unique()
                ->after('paypal_payer_id')
                ->comment('Stripe PaymentIntent ID — unique idempotency key');
            $table->string('stripe_charge_id')->nullable()
                ->after('stripe_payment_intent_id')
                ->comment('Stripe charge ID from the successful PaymentIntent');
            $table->string('stripe_customer_id')->nullable()
                ->after('stripe_charge_id')
                ->comment('Stripe customer ID (optional — future reuse)');
            $table->string('stripe_payment_method_type')->nullable()
                ->after('stripe_customer_id')
                ->comment('e.g. card, ideal, apple_pay');
            $table->string('stripe_card_last4', 4)->nullable()
                ->after('stripe_payment_method_type')
                ->comment('Last 4 digits of card for receipt display');
            $table->string('stripe_card_brand')->nullable()
                ->after('stripe_card_last4')
                ->comment('Card brand: visa, mastercard, amex, etc.');
        });

        // Expand the payment_method column comment to list stripe as an option.
        // Column itself is already nullable string from the PayPal migration.
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable()
                ->comment('paypal, stripe, gift_card, bank_transfer')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_payment_intent_id',
                'stripe_charge_id',
                'stripe_customer_id',
                'stripe_payment_method_type',
                'stripe_card_last4',
                'stripe_card_brand',
            ]);
        });

        // Revert the comment back to pre-stripe list.
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable()
                ->comment('paypal, gift_card, bank_transfer')
                ->change();
        });
    }
};
