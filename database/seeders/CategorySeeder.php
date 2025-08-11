<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Category::create(['category'=>'debt']); because we are going to add bill splits and money owned to someone else.
        Category::create(['category'=>'Credit']);
        Category::create(['category'=>'Debit']);

    }
}
