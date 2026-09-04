<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Switch kit_mappings FK from the components table to the products table.
     *
     * Previously, kit_mappings.component_id referenced components.id.
     * Now it references products.id so that kit components are actual
     * products filtered by is_kit = false, preventing kits from
     * containing other kits as components.
     */
    public function up(): void
    {
        Schema::table('kit_mappings', function (Blueprint $table) {
            // Drop the old foreign key and unique/index constraints on component_id
            $table->dropForeign(['component_id']);
            $table->dropUnique(['kit_product_id', 'component_id']);
            $table->dropIndex(['component_id']);

            // Rename the column to reflect the new relationship target
            $table->renameColumn('component_id', 'product_id');
        });

        // Re-add constraints targeting the products table (must be in a
        // separate Schema call because renameColumn in SQLite needs isolation)
        Schema::table('kit_mappings', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->unique(['kit_product_id', 'product_id']);
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('kit_mappings', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropUnique(['kit_product_id', 'product_id']);
            $table->dropIndex(['product_id']);

            $table->renameColumn('product_id', 'component_id');
        });

        Schema::table('kit_mappings', function (Blueprint $table) {
            $table->foreign('component_id')->references('id')->on('components')->cascadeOnDelete();
            $table->unique(['kit_product_id', 'component_id']);
            $table->index('component_id');
        });
    }
};
