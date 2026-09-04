<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Current stock levels per product/variant per location.
     *
     * One row per unique (product, variant, location) combination.
     * Tracked separately from movements for fast lookups.
     */
    public function up(): void
    {
        Schema::create('inventory_balances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->nullable()->constrained('variants')->cascadeOnDelete();
            $table->foreignUuid('location_id')->constrained('locations')->cascadeOnDelete();
            $table->decimal('quantity', 12, 4)->default(0);
            $table->decimal('reserved_quantity', 12, 4)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['product_id', 'variant_id', 'location_id'], 'inv_balance_unique');
            $table->index('product_id');
            $table->index('variant_id');
            $table->index('location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_balances');
    }
};
