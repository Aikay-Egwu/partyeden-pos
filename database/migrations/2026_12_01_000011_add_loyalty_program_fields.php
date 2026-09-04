<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds persistent loyalty configuration plus order/transaction fields
     * needed for redemption, earning, and admin adjustments.
     */
    public function up(): void
    {
        Schema::create('loyalty_settings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->decimal('points_per_currency_unit', 12, 4)->default(1);
            $table->decimal('currency_value_per_point', 12, 4)->default(0.01);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('loyalty_points_redeemed', 12, 4)->default(0)->after('discount_amount');
            $table->decimal('loyalty_points_earned', 12, 4)->default(0)->after('loyalty_points_redeemed');
        });

        Schema::table('loyalty_transactions', function (Blueprint $table): void {
            $table->foreignUuid('order_id')->nullable()->after('transaction_id')
                ->constrained('orders')->nullOnDelete();
            $table->index(['order_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::table('loyalty_transactions', function (Blueprint $table): void {
            $table->dropIndex(['order_id', 'type']);
            $table->dropConstrainedForeignId('order_id');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['loyalty_points_redeemed', 'loyalty_points_earned']);
        });

        Schema::dropIfExists('loyalty_settings');
    }
};
