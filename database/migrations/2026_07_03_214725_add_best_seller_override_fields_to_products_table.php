<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Manual homepage merchandising overrides for best sellers.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('best_seller_enabled')->default(false)->after('is_online_visible');
            $table->unsignedInteger('best_seller_rank')->nullable()->after('best_seller_enabled');

            $table->index(['best_seller_enabled', 'best_seller_rank']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['best_seller_enabled', 'best_seller_rank']);
            $table->dropColumn(['best_seller_enabled', 'best_seller_rank']);
        });
    }
};
