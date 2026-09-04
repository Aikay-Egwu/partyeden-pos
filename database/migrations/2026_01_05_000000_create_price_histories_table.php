<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Audit trail for product/variant price changes.
     *
     * Records every price update with old/new values, who made the change,
     * and the reason. Used for reporting and compliance.
     */
    public function up(): void
    {
        Schema::create('price_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('variant_id')->nullable()->constrained('variants')->cascadeOnDelete();
            $table->decimal('cost_price', 12, 4);
            $table->decimal('retail_price', 12, 4);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('product_id');
            $table->index('variant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_histories');
    }
};
