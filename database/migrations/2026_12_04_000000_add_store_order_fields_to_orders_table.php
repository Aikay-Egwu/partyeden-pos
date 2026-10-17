<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add store order fields to the orders table.
     *
     * Tracks order origin (online, phone, whatsapp) and Stripe Payment Link
     * details for orders placed manually via the admin interface.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_source')->default('online')
                ->after('status')
                ->comment('online, phone, whatsapp — how the order was placed');
            $table->string('stripe_payment_link_id')->nullable()
                ->after('stripe_card_brand')
                ->comment('Stripe Payment Link ID for phone/WhatsApp orders');
            $table->string('stripe_payment_link_url')->nullable()
                ->after('stripe_payment_link_id')
                ->comment('Shareable Stripe Payment Link URL');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_source',
                'stripe_payment_link_id',
                'stripe_payment_link_url',
            ]);
        });
    }
};
