import ExpenseForm from '@/components/expense-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Expense } from '@/types';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
export default function Expense() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [editExpense, setEditExpense] = useState<Expense>();
    const [deleteExpenseId, setDeleteExpenseId] = useState(0);

    const [yearlyExpenses, setYearlyExpenes] = useState([]);
    const [dailyExpenses, setDailyExpenses] = useState<Expense[]>([]);

    const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
    const [monthlyBreakdown, setmonthlyBreakdown] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date());
    const [year, setYear] = useState(new Date().getFullYear())
    async function fetchExpenses(year: number) {
        let url = API_URL + '/expenses';
        if (year) {
            url += '?year=' + year;
        }
        const response = await fetch(url)
        const result = await response.json();
        if (url.includes('year')) {
            setYearlyExpenes(result)
        }
        else {
            setExpenses(result);
        }
        return response;
    }


    useEffect(() => {
        fetchExpenses(0);
        fetchExpenses(year);

    }, []);
    useEffect(() => {

        if (expenses.length) {
            const dailyExpenses = expenses.filter(expense => expense.created_at.includes(filterDate.toISOString().split('T')[0]));

            setDailyExpenses(dailyExpenses);
            const monthly = expenses.filter(expense => new Date(expense.created_at).getMonth() == filterDate.getMonth() && new Date(expense.created_at).getFullYear() == filterDate.getFullYear());
            setMonthlyExpenses(monthly);

        }
        // to calcualte total of one day we can also do a foreach on mmonthly and then make a new array of objects having the subtotal

    }, [filterDate, expenses])
    useEffect(() => {
        const result = [];
        monthlyExpenses.forEach(expense => {
            if (!result[new Date(expense.created_at).getDate()]) {
                result[new Date(expense.created_at).getDate()] = []
            }
            result[new Date(expense.created_at).getDate()].push(expense)

        });
        setmonthlyBreakdown(result);
    }, [monthlyExpenses])
    useEffect(() => {
        fetchExpenses(year);

    }, [year])

    async function handleDelete(id: number) {
        await fetch(API_URL + '/expense/' + id, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.status == 200) {
                    setExpenses(expenses.filter(expense => expense.id !== id));
                    setDeleteExpenseId(0);
                }
            });
    }
    async function handleSubmit(formData: any) {
        event?.preventDefault()
        if (!editExpense) {
            formData.append("userid", 2);
            var url = API_URL + '/expense'
        }
        else {
            var url = API_URL + '/expenses/' + formData.get('id') + '/expense'
        }
        var response = await fetch(url, {
            method: "POST",
            body: formData
        });
        var responseJson = await response.json();
        if (responseJson.status == 201) {
            setExpenses([...expenses, responseJson.data]);
        }
        else if (responseJson.status == 200 && responseJson.data) {
            const newExpenses = expenses.map((v, i) => {
                if (v.id == responseJson.data.id) {
                    return responseJson.data
                }
                else {
                    return v;
                }
            });
            setExpenses(newExpenses);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <nav>
                <div className="nav nav-tabs position-relative" id="nav-tab" role="tablist">

                    <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Daily</button>
                    <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Monthly</button>
                    <button className="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Yearly</button>
                    <div className='text-right  position-absolute right-0'>
                        <button type="button" className='btn btn-primary' data-bs-toggle="modal" data-bs-target="#editExpenseModal">Add an expense</button>

                    </div>

                </div>
            </nav>
            <div className="tab-content" id="nav-tabContent">
                <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabIndex={0}>
                    <div className="card">
                        <div className='card-body'>

                            <div className='mb-3'><input className='form-select w-auto' type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={(e) => { setFilterDate(new Date(e.target.value)) }}></input></div>
                            <p className="p">Income(Credit)</p>
                            {
                                dailyExpenses.map(expense =>
                                    expense.category?.category == 'Credit' &&
                                    (
                                        <div key={expense.id} className="d-flex my-3 align-items-center justify-content-between border-bottom pb-2">

                                            <div className='w-100 d-flex'>
                                                <div className='w-25'>
                                                    {expense.label}
                                                </div>
                                                <div className='w-25'>
                                                    ${expense.amount}
                                                </div>
                                                <div className='w-25'>
                                                    {new Date(expense.created_at).toLocaleDateString()}
                                                </div>
                                                <div className='w-25'>
                                                    {expense.category?.category}
                                                </div>

                                            </div>
                                            <div className='w-25'>
                                                <button type='button' onClick={() => setEditExpense(expense)} className='btn btn-outline-primary mx-1' data-bs-toggle="modal" data-bs-target="#editExpenseModal">Edit</button>
                                                <button type='button' onClick={() => setDeleteExpenseId(expense.id)} className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                                            </div>
                                        </div>
                                    )
                                )
                            }
                            <p className="p">Expense(Debt)</p>
                            {
                                dailyExpenses.map(expense =>
                                    expense.category?.category == 'Debit' &&
                                    (
                                        <div key={expense.id} className="d-flex my-3 align-items-center justify-content-between border-bottom pb-2">

                                            <div className='w-100 d-flex'>
                                                <div className='w-25'>
                                                    {expense.label}
                                                </div>
                                                <div className='w-25'>
                                                    ${expense.amount}
                                                </div>
                                                <div className='w-25'>
                                                    {new Date(expense.created_at).toLocaleDateString()}
                                                </div>
                                                <div className='w-25'>
                                                    {expense.category?.category}
                                                </div>

                                            </div>
                                            <div className='w-25'>
                                                <button type='button' onClick={() => setEditExpense(expense)} className='btn btn-outline-primary mx-1' data-bs-toggle="modal" data-bs-target="#editExpenseModal">Edit</button>
                                                <button type='button' onClick={() => setDeleteExpenseId(expense.id)} className='btn btn-danger' data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                                            </div>
                                        </div>
                                    )
                                )
                            }
                        </div>
                    </div>

                </div>
                <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabIndex={0}>
                    <div className='mb-3 '><input className='form-select w-auto ' name="monthly" type="date" defaultValue={new Date().toISOString().split('T')[0]} onChange={(e) => { setFilterDate(new Date(e.target.value)) }}></input></div>
                    <div className='card'>
                        <div className='card-body'>
                            <table className='table table-striped'>
                                <thead className='thead'>
                                    <tr>
                                        <th>Income</th>
                                        <th>Amount</th>
                                        <th>Expense</th>
                                        <th>Amount</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyBreakdown.map((res: Array<Expense>, i) => {
                                        var tIncome = 0;
                                        var tExpense = 0;
                                        res.forEach(e => { if (e.category?.category == 'Credit') { tIncome += e.amount } else if (e.category?.category == 'Debit') { tExpense += e.amount } })

                                        return (
                                            <>
                                                {new Date(res[0].created_at).toDateString()}
                                                {res.map((r) => {

                                                    if (r.category?.category == 'Debit') {
                                                        return (<tr><td></td><td></td><td>{r.label}  </td><td>{r.amount}</td></tr>);

                                                    }
                                                    else {
                                                        return (<tr><td>{r.label}</td><td>  {r.amount}</td><td></td><td></td></tr>);
                                                    }
                                                }
                                                )}

                                                <tr><td></td><td>Total {tIncome} </td><td></td><td>Total {tExpense}</td></tr>
                                            </>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
                <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabIndex={0}>
                    <div className='form-control mb-3 w-fit-content'>
                        <span id="left-arrow" onClick={() => setYear((n) => n - 1)}>{"<"}</span>{year}
                        <span id="right-arrow" onClick={() => setYear((n) => n + 1)}>{">"}</span>
                    </div>
                    <div className='card'>
                        <div className='card-body'>
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <th>Month</th>

                                        <th>Income (Credit)</th>
                                        <th>Expense (Debit)</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearlyExpenses.map(expense => (
                                        <tr key={expense.id}>
                                            <td>{expense.month_name}</td>
                                            <td>{expense.total_credit}</td>
                                            <td>{expense.total_debit}</td>
                                            <td>{expense.total_credit - expense.total_debit}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>



            <div className="modal fade" id="editExpenseModal" tabIndex={-1} aria-labelledby="editExpenseModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editExpenseModalLabel">Edit Expense</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ExpenseForm handleSubmit={handleSubmit} expense={editExpense} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="deleteModal" tabIndex={-1} aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteModalLabel">Are you sure you want to delete?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" onClick={() => handleDelete(deleteExpenseId)} className="btn btn-danger" data-bs-dismiss="modal">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );

}