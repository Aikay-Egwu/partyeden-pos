<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Individual loyalty point transactions (earn, redeem, adjust, expire).
     *
     * Records every points change with the resulting balance.
     * Can link back to the POS transaction that triggered the change.
     */
    public function up(): void
    {
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('loyalty_account_id')->constrained('loyalty_accounts')->cascadeOnDelete();
            $table->string('type')->comment('earn, redeem, adjust, expire');
            $table->decimal('points', 12, 4);
            $table->decimal('balance_after', 12, 4);
            $table->uuid('transaction_id')->nullable()->comment('Linked POS transaction');
            $table->text('description')->nullable();
            $table->foreignId('staff_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('loyalty_account_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};
