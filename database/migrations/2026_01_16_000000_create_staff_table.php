<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Staff member profiles linked to user accounts.
     *
     * Tracks employment details: role (admin/manager/cashier/staff),
     * PIN for POS login, hourly rate, and hire/termination dates.
     */
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('role')->default('cashier')->comment('admin, manager, cashier, staff');
            $table->string('employee_code')->nullable()->unique();
            $table->string('pin')->nullable()->comment('POS login PIN');
            $table->decimal('hourly_rate', 10, 4)->nullable();
            $table->date('hire_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
