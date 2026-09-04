<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Physical store, warehouse, and pop-up locations.
     *
     * Used for inventory tracking (per-location stock), till sessions,
     * purchase orders, and order fulfillment. Also adds deferred foreign
     * keys on tables that reference locations.
     */
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('manager_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('type')->default('store')->comment('store, warehouse, pop-up');
            $table->timestamps();
            $table->softDeletes();
        });

        // Add deferred foreign keys for tables that referenced locations before it existed
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreign('location_id')->references('id')->on('locations')->nullOnDelete();
        });
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreign('staff_id')->references('id')->on('staff')->cascadeOnDelete();
            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
        });
        Schema::table('till_sessions', function (Blueprint $table) {
            $table->foreign('staff_id')->references('id')->on('staff')->cascadeOnDelete();
            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        // Drop deferred foreign keys before dropping the table
        Schema::table('till_sessions', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->dropForeign(['location_id']);
        });
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->dropForeign(['location_id']);
        });
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
        });

        Schema::dropIfExists('locations');
    }
};
