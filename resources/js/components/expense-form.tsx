import { type Category } from '@/types';
import { useState, useEffect } from 'react';
import { API_URL } from '@/utils';
export default function ExpenseForm({ ...props }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
    const [selected, setSelected] = useState('Debit');
    async function getCategories() {
        const response = await fetch(API_URL + '/categories', {
            method: 'GET'
        });
        const responseJson = await response.json();
        setCategories(responseJson.data)
    }
    useEffect(() => {
        getCategories();
    }, [])
    useEffect(() => {
        if (props.expense !== undefined) {
            setDateInput(props.expense.created_at.split('T')[0]);
            setSelected(props.expense.category.category)

        }

    }, [props.expense])
    return (

        <form className='w-100' action={props.handleSubmit}>
            {props.expense &&
                (
                    <>
                        <input value={props.expense.id || 0} name="id" hidden={true} readOnly={true}></input>
                        <input value={props.expense.userid | 0} name="userid" hidden={true} readOnly={true}></input>
                    </>

                )
            }

            <div className=' row d-flex'>
                {

                    categories.map((category) => (
                        <>
                            <input type="radio" className='btn-check' name="category_id" id={category.category} value={category.id} autoComplete="off" checked={category.category == selected} ></input>
                            <label htmlFor={category.category} className='btn btn-outline-primary col-3 m-auto'>
                                {category.category}
                            </label>
                        </>
                    )
                    )
                }

            </div>
            <div className='form-group row d-flex '>
                <label htmlFor="date" className="form-label">Date
                    <input type='date' className="form-control " id="date" name='created_at' value={dateInput} onChange={e => setDateInput(e.target.value)} />
                </label>
            </div>
            <div className='form-group row  d-flex '>
                <label htmlFor="labelInput" className="form-label">Label
                    <input type="text" className="form-control " id="labelInput" defaultValue={props.expense?.label ?? ''} onChange={e => e.target.value} name='label' />
                </label>
            </div>
            <div className='form-group row d-flex '>
                <label htmlFor="amountInput" className="form-label">Amount
                    <input type='number' className="form-control " id="amountInput" name='amount' defaultValue={props.expense?.amount ?? null} onChange={e => e.target.value} />

                </label>
            </div>

            <div className="modal-footer">
                {props.expense && (<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>)}
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
            </div>
        </form>

    )
}
