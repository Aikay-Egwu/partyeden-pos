<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link customer reviews to the order they relate to, so feedback-request
     * emails sent after delivery can attribute a review to a specific order.
     * Additive only — existing reviews keep a null order_id.
     */
    public function up(): void
    {
        Schema::table('customer_reviews', function (Blueprint $table) {
            $table->foreignUuid('order_id')
                ->nullable()
                ->after('occasion_id')
                ->constrained('orders')
                ->nullOnDelete();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::table('customer_reviews', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropConstrainedForeignId('order_id');
        });
    }
};
