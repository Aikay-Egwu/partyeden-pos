<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite does not support changing column types directly,
        // so we drop and recreate the affected columns.
        DB::statement('ALTER TABLE products ADD COLUMN cost_price_new NUMERIC(12, 2) DEFAULT 0 NOT NULL');
        DB::statement('UPDATE products SET cost_price_new = ROUND(cost_price, 2)');
        DB::statement('ALTER TABLE products DROP COLUMN cost_price');
        DB::statement('ALTER TABLE products RENAME COLUMN cost_price_new TO cost_price');

        DB::statement('ALTER TABLE products ADD COLUMN selling_price_new NUMERIC(12, 2) DEFAULT 0 NOT NULL');
        DB::statement('UPDATE products SET selling_price_new = ROUND(selling_price, 2)');
        DB::statement('ALTER TABLE products DROP COLUMN selling_price');
        DB::statement('ALTER TABLE products RENAME COLUMN selling_price_new TO selling_price');

        DB::statement('ALTER TABLE products ADD COLUMN reorder_level_new NUMERIC(12, 2)');
        DB::statement('UPDATE products SET reorder_level_new = ROUND(reorder_level, 2)');
        DB::statement('ALTER TABLE products DROP COLUMN reorder_level');
        DB::statement('ALTER TABLE products RENAME COLUMN reorder_level_new TO reorder_level');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE products ADD COLUMN cost_price_new NUMERIC(12, 4) DEFAULT 0 NOT NULL');
        DB::statement('UPDATE products SET cost_price_new = cost_price');
        DB::statement('ALTER TABLE products DROP COLUMN cost_price');
        DB::statement('ALTER TABLE products RENAME COLUMN cost_price_new TO cost_price');

        DB::statement('ALTER TABLE products ADD COLUMN selling_price_new NUMERIC(12, 4) DEFAULT 0 NOT NULL');
        DB::statement('UPDATE products SET selling_price_new = selling_price');
        DB::statement('ALTER TABLE products DROP COLUMN selling_price');
        DB::statement('ALTER TABLE products RENAME COLUMN selling_price_new TO selling_price');

        DB::statement('ALTER TABLE products ADD COLUMN reorder_level_new NUMERIC(12, 4)');
        DB::statement('UPDATE products SET reorder_level_new = reorder_level');
        DB::statement('ALTER TABLE products DROP COLUMN reorder_level');
        DB::statement('ALTER TABLE products RENAME COLUMN reorder_level_new TO reorder_level');
    }
};
