'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/customers').then(r => r.json()).then(data => { setCustomers(data || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const viewCustomer = async (id) => {
        const res = await fetch(`/api/customers?id=${id}`);
        const data = await res.json();
        setSelected(data.customer);
        setOrders(data.orders || []);
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div><h1>Customers</h1><p className="subtitle">{customers.length} registered customers</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Points</th><th>Joined</th></tr></thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c._id} onClick={() => viewCustomer(c._id)} style={{ cursor: 'pointer' }}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td style={{ fontSize: 'var(--font-xs)' }}>{c.email}</td>
                                    <td>{c.phone || '-'}</td>
                                    <td><span className="badge badge-purple">🏆 {c.loyaltyPoints || 0}</span></td>
                                    <td style={{ fontSize: 'var(--font-xs)' }}>{formatDate(c.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selected && (
                    <div className="card animate-slideUp">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                            <div>
                                <h3 style={{ fontWeight: 700 }}>{selected.name}</h3>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{selected.email}</p>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{selected.phone}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">✕</button>
                        </div>
                        <div className="badge badge-purple" style={{ marginBottom: 'var(--space-md)' }}>🏆 {selected.loyaltyPoints || 0} points</div>
                        <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Order History ({orders.length})</h4>
                        {orders.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>No orders</p> : (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {orders.map(o => (
                                    <div key={o._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
                                            <span style={{ fontWeight: 600 }}>{o.orderId}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(o.total)}</span>
                                        </div>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                            {formatDate(o.createdAt)} • <span className={`badge ${o.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>{o.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
