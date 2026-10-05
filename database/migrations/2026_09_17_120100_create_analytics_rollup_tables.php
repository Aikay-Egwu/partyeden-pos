<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The two counters below are sharded across ANALYTICS_SHARDS rows per day so
     * that a busy path (the homepage) spreads its writes over several rows instead
     * of serialising every page view onto one hot primary key. Reads sum the
     * shards, which is free because there are only ever a handful per day.
     *
     * Unique visitors are never incremented. They are derived from the two
     * ledgers, which makes them exact rather than approximated, and those ledgers
     * hold nothing but a rotating salted hash, a date and a country code. The
     * ledgers carry a surrogate id so pruning can delete in bounded chunks, and
     * so InnoDB appends inserts instead of splitting pages at a composite key.
     */
    public function up(): void
    {
        Schema::create('analytics_daily_stats', function (Blueprint $table) {
            $table->date('date');
            $table->unsignedTinyInteger('shard')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('new_visitors')->default(0);

            $table->primary(['date', 'shard'], 'analytics_daily_stats_pk');
        });

        Schema::create('analytics_daily_pages', function (Blueprint $table) {
            $table->date('date');
            $table->string('path', 160);
            $table->unsignedTinyInteger('shard')->default(0);
            $table->unsignedBigInteger('views')->default(0);

            $table->primary(['date', 'path', 'shard'], 'analytics_daily_pages_pk');
            $table->index('path');
        });

        Schema::create('analytics_daily_visitors', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->char('visit_hash', 16);
            $table->char('country', 2)->nullable();
            $table->timestamp('first_seen_at');

            $table->unique(['date', 'visit_hash'], 'analytics_daily_visitors_unique');
            $table->index(['date', 'country']);
        });

        Schema::create('analytics_daily_page_visitors', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('path', 160);
            $table->char('visit_hash', 16);

            $table->unique(['date', 'path', 'visit_hash'], 'analytics_daily_page_visitors_unique');
            $table->index(['date', 'path']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_page_visitors');
        Schema::dropIfExists('analytics_daily_visitors');
        Schema::dropIfExists('analytics_daily_pages');
        Schema::dropIfExists('analytics_daily_stats');
    }
};
