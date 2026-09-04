<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot: product_main_colors
 * Links products to colors marked as main colors.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_main_colors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // Product uses UUID
            $table->foreignUuid('product_id')->references('id')->on('products')->cascadeOnDelete();
            // Color uses integer id
            $table->foreignId('color_id')->constrained('colors')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'color_id']);
            $table->index('product_id');
            $table->index('color_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_main_colors');
    }
};
