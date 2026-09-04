<?php

use App\Http\Controllers\Store\StoreHomeController;
use Illuminate\Support\Facades\Route;

// Storefront home at root — visitors land here directly
Route::get('/', [StoreHomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/store.php';
