<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add PayPal payment tracking fields to the orders table.
     *
     * Supports PayPal REST API v2 checkout integration with fields for
     * reconciliation: PayPal order ID, capture ID, payer details, and
     * the actual captured amount. Also adds a payment_method column for
     * future multi-provider support (paypal, gift_card, bank_transfer).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('payment_status')
                ->comment('paypal, gift_card, bank_transfer');
            $table->string('paypal_order_id')->nullable()->after('payment_method')
                ->comment('PayPal order ID from createOrder API call');
            $table->string('paypal_capture_id')->nullable()->after('paypal_order_id')
                ->comment('PayPal capture ID after successful captureOrder');
            $table->string('paypal_payer_email')->nullable()->after('paypal_capture_id');
            $table->string('paypal_payer_id')->nullable()->after('paypal_payer_email');
            $table->decimal('amount_paid', 12, 4)->nullable()->after('total')
                ->comment('Amount actually captured (may differ from total with adjustments)');
            $table->timestamp('paid_at')->nullable()->after('amount_paid');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'paypal_order_id',
                'paypal_capture_id',
                'paypal_payer_email',
                'paypal_payer_id',
                'amount_paid',
                'paid_at',
            ]);
        });
    }
};
