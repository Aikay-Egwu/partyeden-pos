<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Line items on a customer order.
     *
     * Same structure as transaction_items but for orders. Snapshot
     * product_name preserves what the product was called at order time.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('parent_order_item_id')
                ->nullable()
                ->constrained('order_items')
                ->nullOnDelete()
                ->comment('Links add-on order items back to the main product line');
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->nullable()->constrained('variants')->cascadeOnDelete();
            $table->string('product_name')->comment('Snapshot at time of order');
            $table->decimal('quantity', 12, 4);
            $table->decimal('unit_price', 12, 4);
            $table->decimal('tax_amount', 12, 4)->default(0);
            $table->decimal('discount_amount', 12, 4)->default(0);
            $table->decimal('total', 12, 4);
            $table->string('status')->default('pending')->comment('pending, fulfilled, cancelled');
            $table->text('customization_text')->nullable()
                ->comment('Free-text customization entered by customer (e.g., "Happy Birthday John!")');
            $table->string('customization_font')->nullable()
                ->comment('Font selection for customization text (e.g., "Arial", "Script")');
            $table->foreignId('customization_primary_color_id')->nullable()
                ->constrained('colors')->nullOnDelete()
                ->comment('Primary color chosen by customer from available product colors');
            $table->foreignId('customization_secondary_color_id')->nullable()
                ->constrained('colors')->nullOnDelete()
                ->comment('Secondary color chosen by customer from available product colors');
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
