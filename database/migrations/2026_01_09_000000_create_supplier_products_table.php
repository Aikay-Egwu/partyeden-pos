<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links suppliers to the products they supply with pricing and lead times.
     *
     * Tracks which suppliers can provide each product, their cost price,
     * minimum order quantities, and delivery lead times.
     */
    public function up(): void
    {
        Schema::create('supplier_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('supplier_sku')->nullable();
            $table->decimal('cost_price', 12, 4);
            $table->string('currency', 3)->default('GBP');
            $table->integer('lead_time_days')->nullable();
            $table->decimal('min_order_qty', 12, 4)->default(1);
            $table->boolean('is_preferred')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['supplier_id', 'product_id']);
            $table->index('supplier_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_products');
    }
};
