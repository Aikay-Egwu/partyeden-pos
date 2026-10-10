<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add authentication columns (password, remember_token, email_verified_at)
     * to the customers table to enable customer login/auth.
     *
     * Note: The existing `email` column is NOT changed from nullable to NOT NULL
     * in this migration because `change()` requires doctrine/dbal which is not
     * currently installed. This change should be applied in a future migration
     * once the dependency is available.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Password column for customer authentication. Nullable because
            // customers can be created without credentials (guest checkout,
            // admin CRM entry) and only gain a password when they register.
            $table->string('password')->nullable()->after('email');

            // Remember token for "remember me" sessions
            $table->string('remember_token', 100)->nullable()->after('password');

            // Email verification timestamp
            $table->timestamp('email_verified_at')->nullable()->after('remember_token');
        });
    }

    /**
     * Reverse the migration by dropping the three new auth columns.
     * Email column remains nullable (was never changed in up()).
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'password',
                'remember_token',
                'email_verified_at',
            ]);
        });
    }
};
