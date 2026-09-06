<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Colors reference table.
 *
 * Used by product_main_colors and product_secondary_colors pivot tables,
 * and by order_items for customer color customization choices.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('colors')) {
            return; // Table already exists, skip creation
        }

        Schema::create('colors', function (Blueprint $table) {
            $table->id(); // Integer auto-increment (matches existing pivot FK references)
            $table->string('name')->unique();
            $table->string('hex_code', 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('colors');
    }
};
