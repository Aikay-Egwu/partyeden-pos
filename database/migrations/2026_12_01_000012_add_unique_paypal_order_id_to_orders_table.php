<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enforce idempotency at the database level: one PayPal order ID may
     * only ever produce one local order. NULLs are allowed (non-PayPal
     * orders), and SQLite/MySQL both permit multiple NULLs in a unique index.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unique('paypal_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['paypal_order_id']);
        });
    }
};
