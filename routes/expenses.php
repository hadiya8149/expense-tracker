<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Route::middleware('auth')->group(function () {
    Route::get('dashboard/expenses', function () {
        return Inertia::render('Expenses/expenses');
    })->name('expenses');

});