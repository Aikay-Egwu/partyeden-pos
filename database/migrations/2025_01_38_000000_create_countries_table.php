<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ISO country reference data.
     *
     * Normalized country list with ISO alpha-2/3 codes, phone dialing
     * codes, and currency info. Referenced by suppliers and customer
     * addresses. Also adds FK constraints on existing country_id columns.
     */
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 2)->unique()->comment('ISO 3166-1 alpha-2 country code');
            $table->string('code3', 3)->nullable()->comment('ISO 3166-1 alpha-3 country code');
            $table->string('phone_code')->nullable()->comment('International dialing code');
            $table->string('currency', 3)->nullable()->comment('ISO 4217 currency code');
            $table->string('currency_symbol')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

    }

    public function down(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
        });

        Schema::dropIfExists('countries');
    }
};
