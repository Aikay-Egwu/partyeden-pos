<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * POS till opening/closing sessions for cash management.
     *
     * Logs when a staff member opens and closes a till at a location,
     * with opening/closing balances and cash sales reconciliation.
     */
    public function up(): void
    {
        Schema::create('till_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('staff_id');
            $table->uuid('location_id');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_balance', 12, 4)->default(0);
            $table->decimal('closing_balance', 12, 4)->nullable();
            $table->decimal('expected_balance', 12, 4)->nullable();
            $table->decimal('cash_sales', 12, 4)->default(0);
            $table->string('status')->default('open')->comment('open, closed, suspended');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('staff_id');
            $table->index('location_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('till_sessions');
    }
};
