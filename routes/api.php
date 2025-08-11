<?php

use App\Http\Controllers\Budget\BudgetPlanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Expense\ExpenseController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::middleware('auth:api')->group(function () {

    Route::get('/categories/{id?}', [ExpenseController::class, 'categories'])->name('categories');
    Route::get('/expenses/{id?}', [ExpenseController::class, 'index'])->name('expenses');

    Route::post('/expense', [ExpenseController::class, 'create']);
    Route::post('/expenses/{id}/expense', [ExpenseController::class, 'edit']);
    Route::delete('/expense/{id}', [ExpenseController::class, 'delete']);

// });
    Route::group(['middleware' => ['auth:api']], function () {
        Route::get('/test', function (Request $request) {
             return response()->json(['name' => 'test']);
        });
    });

    Route::get('/budget-plan/{id?}', [BudgetPlanController::class, 'index']);
    Route::post('/budget-plan', [BudgetPlanController::class, 'create']);
    Route::post('/budget-plan/{id}', [BudgetPlanController::class, 'edit']);
    Route::delete('/budget-plan/{id}', [BudgetPlanController::class, 'delete']);