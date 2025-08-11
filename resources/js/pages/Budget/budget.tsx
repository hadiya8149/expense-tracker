import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, } from '@/types';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Budgget planner',
        href: '/dashboard/budget-plan',
    },
];
export default function Budget() {
    const [monthlybudgetPlan, setMonthlyBudgetPlan] = useState([]);
    const [budgetOverview, setbudgetOverview] = useState([]);
    const [spendingOverview, setSpendingOverview] = useState([]);

    const [expenses, setExpenses] = useState([]);
    const [yearlyExpenses, setYearlyExpenes] = useState([]);

    const [editbudgetPlan, setEditBudgetPlan] = useState();

    async function fetchBudget() {
        const response = await fetch(API_URL + '/budget-plan', { method: 'GET' });
        const json = await response.json();
        setMonthlyBudgetPlan(json.data.monthly);
        setbudgetOverview(json.data.data)
        setSpendingOverview(json.data.spending_overview)

    }
    async function handleDelete(id: number) {
        const response = await fetch(API_URL + '/budget-plan/' + id, { method: 'DELETE' });
        const json = await response.json();
        setBudgetPlan(budgetPlan.filter(b => b.id !== id));
    }
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];

    async function handleSubmit(formData: any) {
        console.log('su')
        event?.preventDefault()
        var url = API_URL + '/budget-plan'
        if (editbudgetPlan !== undefined) {
            url += '/' + editbudgetPlan.id
            formData.append('id', editbudgetPlan.id)
            var response = await fetch(url, { method: 'POST', body: formData });
        }
        else {
            var response = await fetch(url, { method: 'POST', body: formData });
        }
        const json = await response.json();

        if (json.status == 201) {
            setBudgetPlan([...budgetPlan, json.data]);
        }
        else if (json.status == 200) {
            const newBudget = budgetPlan.map((v, i) => {
                if (v.id == editbudgetPlan.id) {
                    return json.data;
                }
                else {
                    return v;
                }
            });
            setBudgetPlan(newBudget);
        }
    }
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
    async function changeStatus(id: number) {
        var url = API_URL + '/budget-plan/' + id;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: id, status: "Paid" })
        });
        const json = await response.json();
        console.log(json);
    }
    useEffect(() => {
        fetchBudget();
        fetchExpenses(new Date().getFullYear());
    }, []);
    useEffect(() => {
        var res = [];
        expenses.forEach((expense) => {
            if (!res[expense.label] && expense.category.category == 'Debit') {
                res[expense.label] = [];
                res[expense.label].push(expense)
            }
            else if (res[expense.label] && expense.category.category == 'Debit') {
                res[expense.label].push(expense)
            }
        });
    }, [expenses]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="container">

                <h3>Budget planner</h3>
                <nav>
                    <div className="nav nav-tabs position-relative" id="nav-tab" role="tablist">
                        <button className="nav-link active" id="budget-monthly-tab" data-bs-toggle="tab" data-bs-target="#budget-monthly" type="button" role="tab" aria-controls="budget-monthly" aria-selected="true">Current Month</button>
                        <button className="nav-link" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="false">Overview</button>
                        <div className='text-right  position-absolute right-0'>
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Add new Item</button>

                        </div>

                    </div>
                </nav>
                <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active" id="budget-monthly" role="tabpanel" aria-labelledby="nav-home-tab" tabIndex={0}>
                        <table className="table">
                            <thead className='table-head'>
                                <tr className='text-grey'>
                                    <th>#</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Date Paid</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlybudgetPlan.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.description}</td>
                                        <td>{b.amount}</td>
                                        <td>{b.status}</td>
                                        <td>{b.due_date}</td>
                                        <td>{b.date_paid}</td>
                                        <td>
                                            <button className='btn btn-info me-1' type="button" onClick={(e) => { setEditBudgetPlan(b) }} data-bs-toggle="modal" data-bs-target="#exampleModal">Edit</button>
                                            <button className='btn btn-success me-1' onClick={(e) => { changeStatus(b.id) }}>&#10003;</button>

                                            <button type="button" onClick={() => handleDelete(b.id)} className='btn btn-danger me-1'>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="tab-pane fade" id="overview" role="tabpanel" aria-labelledby="overview-tab" tabIndex={0}>
                        <h3>YEARLY SPENDING</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {months.map(m => (
                                        <th>{m}</th>
                                    ))}
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>EARNED INCOME</td>
                                    {months.map((v, i) => {
                                        if (yearlyExpenses.find(e => (i + 1) == e.month)) {
                                            var found = yearlyExpenses.find(e => (i + 1) == e.month)
                                            return (
                                                <td>{found.total_credit}</td>
                                            )
                                        }
                                        else {
                                            return (<td>0</td>)
                                        }
                                    })}
                                    {yearlyExpenses.reduce((pre, curr) => pre + curr.total_credit, 0)}
                                </tr>
                                <tr>
                                    <td>OTHER INCOME</td>
                                </tr>

                                <tr>
                                    <td>SAVINGS USED</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>EXPENSE CATEGORY</th>
                                    {months.map(m => (
                                        <th>{m}</th>
                                    ))}
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spendingOverview.map(expense=>{
                                    return(
                                        <tr>
                                            <td>{expense.label}</td>
                                        </tr>
                                    )
                                })}
                                <tr>
                                    <td>TOTAL EXPENSES</td>
                                </tr>
                                <tr>
                                    <td>TOTAL BALANCE</td>
                                </tr>
                            </tbody>
                        </table>
                        <h3>YEARLY BALANCE</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {months.map(m => (
                                        <th>{m}</th>
                                    ))}
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>SAVINGS BALANCE</td>
                                </tr>
                                <tr>
                                    <td>DEBT BALANCE</td>
                                </tr>
                                <tr>
                                    <td>RETIREMENT BALANCE</td>
                                </tr>
                                <tr>
                                    <td>NET WORTH BALANCE</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>



                <div className="modal fade" id="exampleModal" tabIndex={-1} aria-hidden="true" aria-labelledby='exampleModalCenterTitle'>
                    <div className="modal-dialog modal-dialog-centered ">
                        <div className='modal-content'>
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Edit</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form action={handleSubmit}>
                                    <div className="row mb-3">
                                        <label htmlFor="inputEmail3" className="col-sm-3 col-form-label">Description</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control" name="description" id="inputEmail3"></input>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="inputPassword3" className="col-sm-3 col-form-label">Amount</label>
                                        <div className="col-sm-9">
                                            <input type="number" name="amount" className="form-control" id="inputPassword3"></input>
                                        </div>
                                    </div>
                                    <fieldset className="row mb-3">
                                        <legend className="col-form-label col-sm-3 pt-0">Status</legend>
                                        <div className="col-sm-9">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="status" id="gridRadios1" value="Paid" ></input>
                                                <label className="form-check-label" htmlFor="gridRadios1">
                                                    Paid
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="status" id="gridRadios2" value="Unpaid"></input>
                                                <label className="form-check-label" htmlFor="gridRadios2">
                                                    Unpaid
                                                </label>
                                            </div>
                                            <div className="form-check disabled">
                                                <input className="form-check-input" type="radio" name="status" id="gridRadios3" value="Overdue" ></input>
                                                <label className="form-check-label" htmlFor="gridRadios3">
                                                    Overdue
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                    <div className="row mb-3">
                                        <label htmlFor="inputPassword3" className="col-sm-3 col-form-label">Due Date</label>
                                        <div className="col-sm-9">
                                            <input type="date" className="form-control" name="due_date" id="inputPassword3"></input>
                                        </div>
                                    </div>
                                    <fieldset className="row mb-3">
                                        <legend className="col-form-label col-sm-3 pt-0">Repeat monthly</legend>
                                        <div className="col-sm-9">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="is_recurring" id="gridRadios1" value="true" ></input>
                                                <label className="form-check-label" htmlFor="gridRadios1">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="is_recurring" id="gridRadios2" value="false"></input>
                                                <label className="form-check-label" htmlFor="gridRadios2">
                                                    No
                                                </label>
                                            </div>

                                        </div>
                                    </fieldset>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        <button type="submit" className="btn btn-primary">Save changes</button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>

    );
}