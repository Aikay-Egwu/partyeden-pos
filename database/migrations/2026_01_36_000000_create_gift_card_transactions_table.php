<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Transaction log for gift card usage.
     *
     * Records every purchase, redemption, refund, or adjustment on a gift
     * card with the resulting balance. Links to the POS transaction.
     */
    public function up(): void
    {
        Schema::create('gift_card_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('gift_card_id')->constrained('gift_cards')->cascadeOnDelete();
            $table->string('type')->comment('purchase, redemption, refund, adjustment');
            $table->decimal('amount', 12, 4);
            $table->decimal('balance_after', 12, 4);
            $table->uuid('transaction_id')->nullable()->comment('Linked POS transaction');
            $table->text('description')->nullable();
            $table->foreignId('staff_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('gift_card_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_card_transactions');
    }
};
