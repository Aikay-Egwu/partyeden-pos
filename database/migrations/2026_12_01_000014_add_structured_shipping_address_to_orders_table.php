<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add structured shipping address fields to orders.
     *
     * The legacy single-string shipping_address / billing_address columns are
     * kept for backward compatibility; new checkout flows persist the address
     * as separate line1/line2/city fields (postcode already exists as
     * delivery_postcode). Additive only — no data loss.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_address_line1')->nullable()->after('shipping_address');
            $table->string('shipping_address_line2')->nullable()->after('shipping_address_line1');
            $table->string('shipping_city')->nullable()->after('shipping_address_line2');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_address_line1',
                'shipping_address_line2',
                'shipping_city',
            ]);
        });
    }
};
