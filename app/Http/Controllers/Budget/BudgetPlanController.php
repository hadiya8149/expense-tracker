<?php

namespace App\Http\Controllers\Budget;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\BudgetPlan;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

use Carbon\Carbon;


class BudgetPlanController extends Controller
{
    public static function index(Request $request, $id = null)
    {
        $currentMonth = BudgetPlan::select('*')->whereMonth('created_at', date('n'))->get();
        $overview =  BudgetPlan::all();
//         SELECT *, count(*) as no_of_rows, MONTH(expenses.created_at) as month, sum(expenses.amount) as total
// FROM expenses  inner join categories on expenses.category_id =categories.id where category='Debit' group by expenses.label, MONTH(expenses.created_at);
        $spendingOverview = Expense::select('*', DB::raw('MONTH(expenses.created_at) as month'), DB::Raw('sum(expenses.amount) as total'))
        ->join('categories', 'expenses.category_id', '=', 'categories.id')->where('categories.category', 'Debit')
        ->groupBy(['expenses.label', 'month'])->get();
        return json_encode(['status' => 200, 'data' =>['monthly'=> $currentMonth->toArray(), 'data'=>$overview->toArray(), 'spending_overview'=>$spendingOverview]]);
    }


    public static function edit(Request $request, $id)
    {
        if($request->status=='Paid'){
            $request->date_paid = Carbon::now();
        }
        else{
            $request->date_paid = null;
        }
        $data = BudgetPlan::find($id)->update($request->all());
        if ($data) {
            return json_encode(['status' => 200, 'data' => $request->all()]);

        }
    }


    public static function delete(Request $request, $id)
    {
        $deleted = BudgetPlan::find($id)->delete();
        if ($deleted) {
            return json_encode(['status' => 200, 'message' => 'deleted successfully']);
        }
    }


    public static function create(Request $request)
    {
        $data = BudgetPlan::create($request->all());
        return json_encode(['status' => 201, 'data' => $data]);
    }
    
}
