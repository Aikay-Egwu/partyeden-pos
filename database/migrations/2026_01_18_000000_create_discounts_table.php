<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discount definitions applied at transaction or item level.
     *
     * Supports percentage and fixed-amount discounts with optional date
     * ranges, minimum purchase requirements, and stackable rules.
     */
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('type')->comment('percentage, fixed');
            $table->decimal('value', 12, 4);
            $table->decimal('min_purchase_amount', 12, 4)->nullable();
            $table->decimal('max_discount_amount', 12, 4)->nullable();
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_stackable')->default(false);
            $table->boolean('apply_to_all')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
