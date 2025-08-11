<?php

namespace App\Http\Controllers\Expense;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;


class ExpenseController extends Controller
{
    public static function index(Request $request, $id = null)
    {
        $query = Expense::query();

        if ($request->id) {
            $query->where($id);
        } else {
            $query->with('category');
        }
        /**
         * 
         * select *, MONTH(expenses.created_at) as month,
         *  SUM( CASE WHEN categories.category='Debit' THEN expenses.amount ELSE 0 END ) AS total_debit, 
         * SUM( CASE WHEN categories.category='Credit' THEN expenses.amount ELSE 0 END ) AS total_credit, 
         * MONTHNAME(expenses.created_at) AS month_name from expenses 
         * inner join categories on expenses.category_id =categories.id group by 
         * month;
         */
        if ($request->year) {
            $query->whereYear('expenses.created_at', $request->year)
                ->select(
                    '*',
                    DB::Raw('MONTH(expenses.created_at) as month'),
                    DB::Raw("SUM( CASE WHEN categories.category='Debit' THEN expenses.amount ELSE 0 END ) AS total_debit"),
                    DB::Raw("SUM( CASE WHEN categories.category='Credit' THEN expenses.amount ELSE 0 END ) AS total_credit"),
                    DB::Raw("MONTHNAME(expenses.created_at) AS month_name")
                )->join('categories', 'expenses.category_id', '=', 'categories.id')->groupBy('month');
        }
        $data = $query->get();
        return $data->toArray();
    }

    public static function edit(Request $request, $id)
    {
        $data = Expense::find($id)->update($request->all());
        if ($data) {
            return json_encode(['status' => 200, 'data' => $request->all()]);

        }
    }


    public static function delete(Request $request, $id)
    {
        $deleted = Expense::find($id)->delete();
        if ($deleted) {
            return json_encode(['status' => 200, 'message' => 'deleted successfully']);
        }
    }


    public static function create(Request $request)
    {
        $data = Expense::create($request->all());
        return json_encode(['status' => 201, 'data' => $data]);
    }
    public static function categories(Request $request)
    {
        $data = Category::all();
        return json_encode(['data' => $data]);
    }
}
