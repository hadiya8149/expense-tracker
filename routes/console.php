<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function() {
    $prevMonth = date('n');
    // select all where status is paid change and is_recurring is true;
    $recurrringItems = DB::table('budget_plans')->where('is_recurring', '=', 1)->whereMonth('created_at', $prevMonth)->get();
    foreach($recurrringItems as $item) {
        $x ='<pre>'.print_r($item, true).'</pre>';
        Log::info($x);
        $itemdto = ['description'=> $item->description, 'amount'=> $item->amount, 'due_date'=> $item->due_date];
        if($item->status !== 'Paid') {
            $itemdto['status']= $item->status;
            $itemdto['amount']+=$itemdto['amount'];
        }
        DB::table('budget_plans')->insert($itemdto);
    }

})->everyMinute();