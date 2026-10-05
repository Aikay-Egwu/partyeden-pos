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
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();

            // Salted, rotating pseudonym. Not reversible, not an address, not a cookie.
            $table->char('visit_hash', 16);
            $table->string('kind', 24)->default('page_view');
            $table->string('path', 160);
            $table->string('referrer_host', 128)->nullable();

            // Derived from the user agent, which is then discarded.
            $table->string('browser', 24)->nullable();
            $table->string('os', 24)->nullable();
            $table->string('device_type', 12)->nullable();
            $table->char('locale', 5)->nullable();
            $table->char('country', 2)->nullable();

            $table->boolean('is_new_visitor')->nullable();
            $table->unsignedSmallInteger('viewport_width')->nullable();
            $table->unsignedSmallInteger('viewport_height')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->json('properties')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['path', 'recorded_at']);
            $table->index(['visit_hash', 'recorded_at']);
            $table->index(['kind', 'recorded_at']);
            $table->index(['country', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
