<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot table for assigning products to occasions.
     */
    public function up(): void
    {
        Schema::create('occasion_product', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('occasion_id')->constrained('occasions')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['occasion_id', 'product_id']);
            $table->index(['occasion_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('occasion_product');
    }
};
