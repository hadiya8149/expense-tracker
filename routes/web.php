<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

     Route::get('dashboard/budget-plan', function () {
        return Inertia::render('Budget/budget');
    })->name('budget');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/expenses.php';
