<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot: product_add_ons
 *
 * Links a parent product to other products offered as add-ons.
 * Both product_id and add_on_product_id reference the products table.
 *
 * Example: "Number Stack" (parent) can have add-ons
 * "2 Helium Bunch" and "5 Helium Bunch" (both are products themselves).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_add_ons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')
                ->constrained('products')->cascadeOnDelete()
                ->comment('The parent product that offers add-ons');
            $table->foreignUuid('add_on_product_id')
                ->constrained('products')->cascadeOnDelete()
                ->comment('The product offered as an add-on');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->nullable();
            $table->timestamps();

            // Prevent duplicate product/add-on pairs
            $table->unique(
                ['product_id', 'add_on_product_id'],
                'product_add_on_unique'
            );
            $table->index('product_id');
            $table->index('add_on_product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_add_ons');
    }
};
