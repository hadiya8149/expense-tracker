import AppLayout from '@/layouts/app-layout';
import Chart from "chart.js/auto";
import { type BreadcrumbItem, type Expense, type BarChartDataset } from '@/types';
import { useState, useEffect } from 'react';
import PieChart from '@/components/PieChart';
import { CategoryScale } from 'chart.js';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
// debit means withdrawal
// credit means deposit
interface BarChartState {
    labels: string[];
    datasets: BarChartDataset[];
}
// Initial state with empty arrays
const initialBarChartState: BarChartState = {
    labels: [],
    datasets: [
        {
            label: 'Expense',
            data: [],
            backgroundColor: [
                '#52D726',
                '#007ED6',
                '#FF7300',
            ],
            borderColor: 'black',
            borderWidth: 2,
        },
    ],
};
Chart.register(CategoryScale);

export default function Dashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [debit, setDebit] = useState(0);
    const [credit, setCredit] = useState(0);
    const [debt, setDebt] = useState(0);
    const [balance, setBalance] = useState(0);

    const [linechartData, setLineChartData] = useState({
        labels: expenses.map((expense) => expense.created_at),
        datasets: [
            {
                label: "Amount spent",
                data: expenses.map((expense) => expense.amount),
                backgroundColor: [
                    "#2C3E50",
                    "#3498DB",
                    "#2ECC71 ",
                    "#1ABC9C ",
                    "#9B59B6", "#34495E", "#7F8C8D ", "#BDC3C7", "#16A085", "#27AE60"
                ],
                borderColor: "black",
                borderWidth: 2,
            }
        ]
    });
    const [pieChartData, setPieChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Users Gained ",
                data: [],
                backgroundColor: [
                    "rgba(75,192,192,1)",
                    "#50AF95",
                    "#f3ba2f",
                    "#2a71d0"
                ],
                borderColor: "black",
                borderWidth: 2
            }
        ],

    })
    const [barChartData, setBarChartData] = useState<BarChartState>(initialBarChartState);

    async function fetchExpenses() {
        const response = await fetch('http://localhost:8000/api/expenses')
        const result = await response.json();
        setExpenses(result);
        return response;
    }
    function calculateTotalExpense() {
        let total = expenses.reduce((sum, expense) => { return sum + expense.amount }, 0);
        setTotalExpense(total);
    }
    function calculateAmountInCategory(category: string) {
        let initial = 0
        expenses.forEach(expense => {
            if (expense.category_id && expense.category?.category == category) {
                initial += expense.amount
            }
        });
        return initial;
    }
    function getDaysInMonth(month: number, year: number, date = 1, endDate: number = 0) {
        var date = new Date(year, month, date);
        var days = [];
        while (date.getMonth() === month) {
            if (endDate && date.getDate() > endDate) {
                break;
            }
            var day = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
            days.push(day);
            date.setDate(date.getDate() + 1);
        }
        return days;
    }
    function getLast30Days() {
        let currentMonthDays = getDaysInMonth(7, 2025)
        let currDate = new Date().getDate()
        currentMonthDays = currentMonthDays.slice(0, currDate);
        let prevMonth = new Date().getMonth() - 1
        let prevMonthDays = getDaysInMonth(prevMonth, 2025);
        let remainingDays = prevMonthDays.length - currentMonthDays.length // if there are more days in current month then this value is already going to be -
        let result = prevMonthDays.slice(-remainingDays).concat(currentMonthDays)
        return result;
    }
    function getRecordsBetweenDateRange(start_date: Date, end_date: Date) {
        let x: Expense[] = [];
        expenses.forEach(expense => {
            if (new Date(expense.created_at) > start_date && new Date(expense.created_at) < end_date) {
                x.push(expense);
            }
        });
        return x;
    }
    function filterDates(formData: any) {
        let startDate = new Date(formData.get('start_date'));
        let endDate = new Date(formData.get('end_date'));
        let filtered_expenses = getRecordsBetweenDateRange(startDate, endDate);
        let startingMonth = startDate.getMonth();
        let endingMonth = endDate.getMonth()
        let days = getDaysInMonth(startingMonth, startDate.getFullYear(), startDate.getDate());
        let diffMonths = endingMonth - startingMonth;
        let counter = startingMonth + 1;
        while (diffMonths > 1) {
            days = days.concat(getDaysInMonth(counter, 2025))
            diffMonths--;
            counter++;
        }
        days = days.concat(getDaysInMonth(endingMonth, 2025, 1, endDate.getDate()));
        setLineData(filtered_expenses, days)
    }
    function setLineData(expenses: Expense[], days: Array<string> = []) {
        var amountSpent = {};
        expenses.forEach(expense => {
            if (expense.category?.category == 'Debit' && !amountSpent[new Date(expense.created_at).toISOString().split('T')[0]]) {
                amountSpent[new Date(expense.created_at).toISOString().split('T')[0]] = expense.amount;
            }
            else if (expense.category?.category == 'Debit' && amountSpent[new Date(expense.created_at).toISOString().split('T')[0]]) {
                amountSpent[new Date(expense.created_at).toISOString().split('T')[0]] += expense.amount
            }
            else if (expense.category?.category !== 'Debit' && !amountSpent[new Date(expense.created_at).toISOString().split('T')[0]]) {
                amountSpent[new Date(expense.created_at).toISOString().split('T')[0]] = 0;

            }
        });
        if (!days.length) {
            var allDays = getLast30Days();
        }
        else {
            var allDays = days;
        }
        var newdata = [];
        allDays.forEach(date => {
            if (amountSpent[date]) {
                newdata.push(amountSpent[date]);
            }
            else{
                newdata.push(0);
            }
        });
        setLineChartData({
            labels: allDays,
            datasets: [
                {
                    label: "Amount spent",
                    data: newdata,
                    backgroundColor: [
                        "#007dd694",
                        "#3498DB",
                        "#2ECC71 ",
                        "#1ABC9C ",
                        "#9B59B6", "#34495E", "#7F8C8D ", "#BDC3C7", "#16A085", "#27AE60"
                    ],
                    borderColor: "#007dd694",
                    borderWidth: 2,

                }
            ]
        })
    }
    useEffect(() => {
        fetchExpenses();
    }, []);
    useEffect(() => {
        calculateTotalExpense()
        setTotalEntries(expenses.length)
        setDebit(calculateAmountInCategory('Debit'));
        setCredit(calculateAmountInCategory('Credit'));
        setDebt(calculateAmountInCategory('Debt'));
        if (expenses.length > 0) {
            setPieChartData({
                labels: expenses.map((expense) => expense.label),
                datasets: [
                    {
                        label: "Users Gained ",
                        data: expenses.map((expense) => expense.amount),
                        backgroundColor: [
                            "#E9F6FA",
                            "#bac1ff",
                            "#5063ff ",
                            "#001bfd ",
                            "#286943", "#34495E", "#7F8C8D ", "#BDC3C7", "#16A085", "#27AE60"
                        ],
                        borderColor: "black",
                        borderWidth: 2
                    }
                ]
            });
            setLineData(expenses, []);
        }
    }, [expenses]);

    useEffect(() => {
        setBalance(credit - debit);
        if (expenses.length > 0) {
            setBarChartData({
                labels: ['Debit', 'Credit', 'Debt'],
                datasets: [
                    {
                        label: "Expense",
                        data: [debit, credit, debt],
                        backgroundColor: [
                            "#007dd694",
                            "#05e70588",
                            "#ff730075",
                        ],
                        borderColor: "#0b0f1148",
                        borderWidth: 1
                    }
                ],
            })
        }
    }, [credit, debit, debt]);

    return (

        <AppLayout>

            <div className="container py-4">
                <div className="row g-4 mb-4 text-center">
                    <div className="col-md-3">
                        <div className='card h-100'>
                            <div className='card-body'>
                                <p className="mb-1 card-text"><span className='inter-medium'>Total Expenses: </span>{totalExpense}</p>

                            </div>

                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className='card h-100'>
                            <div className='card-body'>
                                <p className="mb-1"><span className='inter-medium'>Total Debit: </span>{debit}</p>
                            </div>

                        </div>

                    </div>
                    <div className="col-md-3">
                        <div className='card h-100'>
                            <div className='card-body'>

                                <p className="mb-1"><span className='inter-medium'>Total Credit: </span>{credit}</p>
                            </div>

                        </div>

                    </div>
                    <div className="col-md-3">
                        <div className='card h-100'>
                            <div className='card-body'>

                                <p className="mb-1"><span className='inter-medium'>Total Debt: </span>{debt}</p>
                            </div>

                        </div>

                    </div>


                </div>
                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <p className="mb-1"><span className='inter-medium'>Total Entries:</span> {totalEntries}</p>
                                <p className="mb-1"><span className='inter-medium'>Remaining Balance: </span>{balance}</p>


                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <div id='myChart'>
                                    <BarChart data={barChartData} />
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body" id="piechart">
                                <PieChart data={pieChartData} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='mb-3 d-flex'>
                            <form className='mb-3 d-flex' action={filterDates}>
                                <input type="date" name="start_date" className='form-control me-1' required={true}></input>
                                <input type="date" name="end_date" className='form-control me-1' required={true} ></input>
                                <button type="submit" className="btn btn-primary me-1" >Filter</button>
                            </form>
                        </div>
                        <div className='card'><LineChart data={linechartData} /></div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
