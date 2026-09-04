<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// VariantID added — components can now be a specific variant (e.g. 12" red balloon)
return new class extends Migration
{
    /**
     * Defines which components make up a kit product and in what quantities.
     *
     * Pivot/mapping table linking a kit product to its components.
     * Each row specifies how many of a component are included in the kit.
     */
    public function up(): void
    {
        Schema::create('kit_mappings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kit_product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('component_id')->constrained('components')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->nullable()->constrained('variants')->cascadeOnDelete();
            $table->decimal('quantity', 12, 4)->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['kit_product_id', 'component_id']);
            $table->index('kit_product_id');
            $table->index('component_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kit_mappings');
    }
};
