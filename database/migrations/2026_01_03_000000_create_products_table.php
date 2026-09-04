ffffffffff<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Core product catalog — the sellable items in the EPOS system.
     *
     * Each product can be a standard item, a kit (bundle of components),
     * or a service. Products link to categories and tax rates.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignUuid('tax_category_id')->nullable()->constrained('tax_categories')->nullOnDelete();
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->string('product_type')->default('standard')->comment('standard, kit, service');
            $table->boolean('customise_color')->default(false)
                ->comment('Allow customer to pick primary/secondary color at order time');
            $table->boolean('customise_text')->default(false)
                ->comment('Allow customer to enter free-text customization at order time');
            $table->boolean('preorder')->default(false)
                ->comment('Product available for preorder before stock arrives');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_kit')->default(false)
                ->comment('True when product_type is "kit"; used to filter component selection dropdowns');
            $table->boolean('track_inventory')->default(true);
            $table->decimal('reorder_level', 12, 2)->nullable();
            $table->string('unit')->default('each');
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('tax_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
