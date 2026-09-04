<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Individual items within a return.
     *
     * Records which products were returned, their condition (good/damaged/
     * defective), refund value, and disposition (restock/write-off/supplier).
     */
    public function up(): void
    {
        Schema::create('returned_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('return_id')->constrained('returns')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->nullable()->constrained('variants')->cascadeOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->decimal('refund_amount', 12, 4);
            $table->string('condition')->default('good')->comment('good, damaged, defective');
            $table->string('disposition')->default('return_to_stock')->comment('return_to_stock, write_off, return_to_supplier');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('return_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returned_items');
    }
};
