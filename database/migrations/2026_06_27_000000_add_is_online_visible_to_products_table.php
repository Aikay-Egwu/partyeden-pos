<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add is_online_visible flag to distinguish between retail products
     * (shown on the storefront) and internal stock products
     * (used as kit components, not available for direct online purchase).
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_online_visible')->default(true)
                ->comment('Controls visibility on the public storefront; false = internal stock only');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_online_visible');
        });
    }
};
