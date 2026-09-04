<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delivery_zone_postcode_prefixes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_zone_id')->constrained('delivery_zones')->cascadeOnDelete();
            $table->string('code_prefix'); // normalized uppercase, no spaces e.g., "SW1A", "E2", "W105"
            $table->string('level')->nullable(); // outward|sector|full (optional for UI)
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['delivery_zone_id', 'code_prefix', 'level'], 'dz_prefix_unique');
            $table->index('code_prefix');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_zone_postcode_prefixes');
    }
};
