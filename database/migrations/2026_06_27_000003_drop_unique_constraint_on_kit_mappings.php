<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the overly restrictive unique constraint on (kit_product_id, product_id).
     *
     * The constraint prevented adding the same product twice to a kit,
     * even when using different variants or quantities — a valid use case
     * (e.g., 2× red balloon + 3× blue balloon in the same kit).
     */
    public function up(): void
    {
        Schema::table('kit_mappings', function (Blueprint $table) {
            $table->dropUnique(['kit_product_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('kit_mappings', function (Blueprint $table) {
            $table->unique(['kit_product_id', 'product_id']);
        });
    }
};
