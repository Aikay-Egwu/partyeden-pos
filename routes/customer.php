<?php

use App\Http\Controllers\Customer\CustomerDashboardController;
use Illuminate\Support\Facades\Route;

// Customer portal — only authenticated Customer instances.
// role.customer middleware: guests → /login redirect, admins → /admin redirect.
Route::middleware(['auth', 'verified', 'role.customer'])->prefix('customer')->group(function () {
    Route::get('/', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
});
