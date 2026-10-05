<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot table for the many-to-many relationship between products and categories.
     * Replaces the 1-to-1 category_id column on the products table.
     *
     * Migration steps:
     *   1. Create the pivot table.
     *   2. Seed it with existing category_id values so no data is lost.
     *   3. Drop the old category_id column from products.
     */
    public function up(): void
    {
        // 1. Create the pivot table
        Schema::create('category_product', function (Blueprint $table) {
            $table->uuid('category_id');
            $table->uuid('product_id');
            $table->timestamps();

            $table->primary(['category_id', 'product_id']);
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        // 2. Migrate existing category_id data into the pivot table
        DB::statement('
            INSERT INTO category_product (category_id, product_id, created_at, updated_at)
            SELECT category_id, id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM products
            WHERE category_id IS NOT NULL
        ');

        // 3. Drop the old column (index is dropped automatically by Laravel)
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    public function down(): void
    {
        // Re-add the column and restore a single category per product
        Schema::table('products', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->index('category_id');
        });

        // Restore one category per product (pick the first one alphabetically)
        DB::statement('
            UPDATE products
            SET category_id = (
                SELECT cp.category_id
                FROM category_product cp
                WHERE cp.product_id = products.id
                ORDER BY cp.created_at
                LIMIT 1
            )
        ');

        Schema::dropIfExists('category_product');
    }
};
