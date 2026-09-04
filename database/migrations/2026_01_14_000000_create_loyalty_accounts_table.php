<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Customer loyalty program accounts (one per customer).
     *
     * Tracks points balance with lifetime earned/redeemed totals.
     * Individual transactions are recorded in loyalty_transactions.
     */
    public function up(): void
    {
        Schema::create('loyalty_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->decimal('points_balance', 12, 4)->default(0);
            $table->decimal('total_points_earned', 12, 4)->default(0);
            $table->decimal('total_points_redeemed', 12, 4)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_accounts');
    }
};
