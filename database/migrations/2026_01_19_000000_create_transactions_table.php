<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * POS sales transactions — the core operational table.
     *
     * Links a sale to the till session, staff member, customer (optional),
     * location, and discount. Stores the financial summary (subtotal, tax,
     * discount, total). Line items in transaction_items, payments in
     * transaction_payments.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('transaction_number')->unique();
            $table->foreignUuid('till_session_id')->nullable()->constrained('till_sessions')->nullOnDelete();
            $table->uuid('staff_id');
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->uuid('location_id');
            $table->string('status')->default('completed')->comment('completed, voided, refunded');
            $table->decimal('subtotal', 12, 4)->default(0);
            $table->decimal('tax_amount', 12, 4)->default(0);
            $table->decimal('discount_amount', 12, 4)->default(0);
            $table->decimal('total', 12, 4)->default(0);
            $table->foreignUuid('discount_id')->nullable()->constrained('discounts')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('staff_id');
            $table->index('location_id');
            $table->index('till_session_id');
            $table->index('customer_id');
            $table->index('status');
            $table->index('transaction_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
