<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Product variants with distinct SKUs (e.g., sizes, colors).
     *
     * Each variant belongs to a parent product and can override the base
     * price/cost via adjustment fields. Linked to attributes via variant_attributes.
     */
    public function up(): void
    {
        Schema::create('variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->string('name')->nullable()->comment('Variant-specific name, falls back to product name');
            $table->decimal('price_adjustment', 12, 4)->default(0);
            $table->decimal('cost_price_adjustment', 12, 4)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variants');
    }
};
