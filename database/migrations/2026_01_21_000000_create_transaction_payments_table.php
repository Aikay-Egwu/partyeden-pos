<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Payment records for a POS transaction.
     *
     * A transaction can have multiple payments (split payment).
     * Records the method (cash/card/gift_card/mobile/other), amount,
     * change, and a reference for card transactions.
     */
    public function up(): void
    {
        Schema::create('transaction_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->string('payment_method')->comment('cash, card, gift_card, mobile, other');
            $table->decimal('amount', 12, 4);
            $table->decimal('change_amount', 12, 4)->default(0);
            $table->string('reference')->nullable()->comment('Card transaction ref, cheque number, etc.');
            $table->string('status')->default('completed')->comment('completed, pending, failed, refunded');
            $table->timestamps();
            $table->softDeletes();

            $table->index('transaction_id');
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_payments');
    }
};
