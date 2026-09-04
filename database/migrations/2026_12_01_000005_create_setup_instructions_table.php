<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Setup instructions — one-to-one reference per product.
 *
 * Admin fills this after product configuration for future reference.
 * Contains tools, items, step-by-step instructions, and general notes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('setup_instructions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // Unique FK ensures one-to-one relationship with products
            $table->foreignUuid('product_id')->unique()
                ->constrained('products')->cascadeOnDelete()
                ->comment('Each product has at most one setup instruction');
            $table->text('tools')->nullable()
                ->comment('Tools needed for setup (e.g., "Helium tank, ribbon scissors")');
            $table->text('items')->nullable()
                ->comment('Items/materials needed (e.g., "Latex balloons x50, curling ribbon")');
            $table->text('instructions')->nullable()
                ->comment('Step-by-step setup guide');
            $table->text('notes')->nullable()
                ->comment('Additional reference notes');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('setup_instructions');
    }
};
