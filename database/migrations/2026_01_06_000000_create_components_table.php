<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Individual items that can be assembled into kit/bundle products.
     *
     * Components are standalone sellable items that can also be bundled
     * together via kit_mappings to form a kit product.
     */
    public function up(): void
    {
        Schema::create('components', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->decimal('cost_price', 12, 4)->default(0);
            $table->decimal('selling_price', 12, 4)->default(0);
            $table->string('unit_type', 50)->default('piece')->comment('piece, set, metre kg, etc.');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('components');
    }
};
