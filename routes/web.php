<?php

use App\Http\Controllers\Auth\CustomerRegisterController;
use App\Http\Controllers\Store\StoreHomeController;
use Illuminate\Support\Facades\Route;

// Customer-only public registration routes. Placed with high precedence so any
// residual Fortify registration route cannot shadow them — and since we disabled
// the registration feature entirely in config/fortify.php, Fortify will never
// even attempt to register those routes. Admin writes are impossible because
// CustomerRegisterController + CreateNewCustomer ONLY touch the `customers` table.
Route::middleware('guest')->group(function () {
    Route::get('/register', [CustomerRegisterController::class, 'create'])
        ->name('register');
    Route::post('/register', [CustomerRegisterController::class, 'store'])
        ->name('register.store');
});

// Storefront home at root — visitors land here directly
Route::get('/', [StoreHomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/customer.php';
require __DIR__.'/store.php';
