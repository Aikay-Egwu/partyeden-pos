<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Auth attempt logs — records every login/authentication attempt
     * (both successes and failures) for audit/security purposes.
     *
     * Captures identifying context: email attempted, IP, browser/OS/device,
     * outcome, and resolved user (if any). Uses standard timestamps() for
     * simplicity (updated_at will remain unused but is harmlessly nullable).
     */
    public function up(): void
    {
        Schema::create('auth_attempt_logs', function (Blueprint $table) {
            $table->id();

            // The email that was submitted during the auth attempt
            $table->string('email')->index();

            // Client IP address (IPv4 up to 15 chars, IPv6 up to 45 chars)
            $table->string('ip_address', 45)->nullable();

            // Browser name extracted from user agent (Chrome, Safari, Firefox, etc.)
            $table->string('browser')->nullable();

            // Operating system extracted from user agent (Windows, macOS, iOS, etc.)
            $table->string('os')->nullable();

            // Device type: mobile / tablet / desktop
            $table->string('device_type')->nullable();

            // Outcome of the auth attempt: SUCCESS or FAIL
            $table->string('outcome');

            // Type of user attempting auth: admin / customer / unknown
            $table->string('user_type')->nullable();

            // UUID or int of the resolved user (null until matched)
            $table->string('user_id')->nullable();

            // created_at / updated_at (updated_at unused but kept for simplicity)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migration by dropping the auth_attempt_logs table entirely.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_attempt_logs');
    }
};
