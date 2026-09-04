<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot table linking variants to their attribute value combinations.
     *
     * Each row assigns a specific attribute value (e.g., "Red") to a
     * variant, building up the variant's full attribute set.
     */
    public function up(): void
    {
        Schema::create('variant_attributes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('variant_id')->constrained('variants')->cascadeOnDelete();
            $table->foreignUuid('attribute_value_id')->constrained('attribute_values')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['variant_id', 'attribute_value_id']);
            $table->index('variant_id');
            $table->index('attribute_value_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variant_attributes');
    }
};
