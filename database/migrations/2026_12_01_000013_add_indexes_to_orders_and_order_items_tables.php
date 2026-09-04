<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing indexes on frequently filtered order columns.
     *
     * SQLite does not auto-index foreign keys, so admin/report filters on
     * these columns were scanning. Also drops the redundant plain index on
     * orders.order_number (the column already has a unique index).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index('payment_status');
            $table->index('placed_at');
            $table->index('fulfillment_type');
            $table->dropIndex(['order_number']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('variant_id');
            $table->index('parent_order_item_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['placed_at']);
            $table->dropIndex(['fulfillment_type']);
            $table->index('order_number');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['variant_id']);
            $table->dropIndex(['parent_order_item_id']);
            $table->dropIndex(['status']);
        });
    }
};
