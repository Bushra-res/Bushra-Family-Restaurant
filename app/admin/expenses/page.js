'use client';
import { useState, useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useToast } from '@/components/Toast';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Food'
    });
    const { addToast } = useToast();

    const fetchExpenses = () => {
        setLoading(true);
        fetch('/api/expenses')
            .then(r => r.json())
            .then(data => {
                setExpenses(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newExpense,
                    amount: parseFloat(newExpense.amount)
                })
            });
            if (res.ok) {
                addToast('Expense added', 'success');
                setShowAdd(false);
                setNewExpense({
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    category: 'Food'
                });
                fetchExpenses();
            }
        } catch (error) {
            addToast('Error adding expense', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expense?')) return;
        try {
            const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Expense deleted', 'success');
                fetchExpenses();
            }
        } catch (error) {
            addToast('Error deleting', 'error');
        }
    };

    if (loading && expenses.length === 0) return <LoadingAnimation />;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p className="subtitle">Track restaurant operating costs</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    ➕ Add Expense
                </button>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>💸</div>
                    <div className="stat-info">
                        <h3>Total Expenses (All Time)</h3>
                        <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalExpenses)}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(exp => (
                            <tr key={exp._id}>
                                <td>{new Date(exp.date).toLocaleDateString()}</td>
                                <td>{exp.description}</td>
                                <td><span className="badge badge-info">{exp.category}</span></td>
                                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(exp.amount)}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn btn-icon" onClick={() => handleDelete(exp._id)} style={{ color: 'var(--danger)' }}>
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {expenses.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h3>No expenses found</h3>
                        <p>Add your first expense to track restaurant costs.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Expense" width="400px">
                <form onSubmit={handleAdd} className="flex-col gap-md">
                    <div className="input-group">
                        <label>Amount (₹)</label>
                        <input 
                            type="number" 
                            required 
                            value={newExpense.amount}
                            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. Electricity bill, Grocery"
                            value={newExpense.description}
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Date</label>
                        <input 
                            type="date" 
                            required 
                            value={newExpense.date}
                            onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Category</label>
                        <select 
                            value={newExpense.category}
                            onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        >
                            <option>Food</option>
                            <option>Utilities</option>
                            <option>Rent</option>
                            <option>Salary</option>
                            <option>Marketing</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="mt-md">
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Expense</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
