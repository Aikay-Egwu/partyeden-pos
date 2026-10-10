<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add reason column to auth_attempt_logs to record WHY a login failed
     * (e.g. "invalid_credentials", "throttled") or null for SUCCESS.
     */
    public function up(): void
    {
        Schema::table('auth_attempt_logs', function (Blueprint $table) {
            $table->string('reason')->nullable()->after('outcome');
        });
    }

    /**
     * Reverse the migration by dropping the reason column.
     */
    public function down(): void
    {
        Schema::table('auth_attempt_logs', function (Blueprint $table) {
            $table->dropColumn('reason');
        });
    }
};
