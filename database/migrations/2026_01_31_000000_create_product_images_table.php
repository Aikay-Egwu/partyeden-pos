<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Product image attachments with ordering and primary image flag.
     *
     * Stores file metadata (path, name, mime type, size) and supports
     * sort order and a boolean flag for the primary/hero image.
     */
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('variant_id')
                ->nullable()
                ->constrained('variants')
                ->nullOnDelete();
            $table->foreignId('primary_color_id')
                ->nullable()
                ->constrained('colors')
                ->nullOnDelete();
            $table->foreignUuid('addon_product_id')
                ->nullable()
                ->constrained('products')
                ->nullOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->string('alt_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['product_id', 'variant_id']);
            $table->index(['product_id', 'primary_color_id']);
            $table->index(['product_id', 'addon_product_id']);
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
