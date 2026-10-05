<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a `featured` flag to categories and occasions. When true, the record
     * is surfaced on the storefront home page (featured category grid and the
     * "Shop by Occasion" row).
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('featured')->default(false)->after('is_active')
                ->comment('Show this category on the storefront home page');
        });

        Schema::table('occasions', function (Blueprint $table) {
            $table->boolean('featured')->default(false)->after('is_active')
                ->comment('Show this occasion on the storefront home page');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('featured');
        });

        Schema::table('occasions', function (Blueprint $table) {
            $table->dropColumn('featured');
        });
    }
};
