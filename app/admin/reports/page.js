'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/reports?period=${period}`)
            .then(r => r.json())
            .then(data => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [period]);

    const downloadCSV = () => {
        if (!report?.orders?.length) return;
        const headers = 'Order ID,Customer,Items,Subtotal,Tax,Discount,Total,Status,Payment,Type,Date\n';
        const rows = report.orders.map(o =>
            `${o.orderId},${o.customerName || 'Walk-in'},"${o.items.map(i => i.name).join('; ')}",${o.subtotal},${o.tax},${o.discount},${o.total},${o.status},${o.paymentMethod},${o.type},${new Date(o.createdAt).toLocaleDateString()}`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div><h1>Reports</h1><p className="subtitle">Sales and order analytics</p></div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                        <button key={p} className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
                    ))}
                    <button onClick={downloadCSV} className="btn btn-success btn-sm">📥 Download CSV</button>
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
                {[
                    { label: 'Total Revenue', value: formatCurrency(report?.totalRevenue || 0), icon: '💰', bg: 'rgba(249,115,22,0.15)' },
                    { label: 'Expense Value', value: formatCurrency(report?.totalExpenses || 0), icon: '💸', bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' },
                    { label: 'Total Revenue after Expenses Deduction', value: formatCurrency(report?.netRevenue || 0), icon: '💎', bg: 'rgba(16,185,129,0.15)', color: 'var(--success)' },
                    { label: 'Total Orders', value: report?.totalOrders || 0, icon: '📦', bg: 'rgba(59,130,246,0.15)' },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                        <div className="stat-info">
                            <h3>{s.label}</h3>
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue by Day */}
            {report?.revenueByDay && Object.keys(report.revenueByDay).length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>📈 Revenue by Day</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        {Object.entries(report.revenueByDay).slice(-14).map(([day, rev]) => (
                            <div key={day} className="card" style={{ textAlign: 'center', minWidth: 100, flex: '1 1 100px' }}>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{day}</div>
                                <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(rev)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Orders */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 700 }}>📋 All Orders ({report?.orders?.length || 0})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Type</th></tr></thead>
                        <tbody>
                            {(report?.orders || []).map(o => (
                                <tr key={o._id}>
                                    <td style={{ fontWeight: 600, fontSize: 'var(--font-xs)' }}>
                                        {o.orderId}
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
                                            {formatDate(o.createdAt)}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 'var(--font-xs)' }}>
                                        <div style={{ fontWeight: 600 }}>{o.customerName || o.customer?.name || 'Walk-in'}</div>
                                        {(o.customerPhone || o.customer?.phone) && (
                                            <div>📞 {o.customerPhone || o.customer?.phone}</div>
                                        )}
                                        {o.type === 'delivery' && o.deliveryAddress && (
                                            <div style={{ color: 'var(--text-secondary)', marginTop: 4, maxWidth: 150 }}>
                                                📍 {o.deliveryAddress.street}, {o.deliveryAddress.city}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 'var(--font-xs)' }}>
                                        {o.items.map((i, idx) => (
                                            <div key={idx} style={{ marginBottom: 4 }}>
                                                <span style={{ fontWeight: 500 }}>{i.quantity}x {i.name}</span> <span style={{ color: 'var(--text-muted)' }}>(₹{i.price})</span>
                                            </div>
                                        ))}
                                        {o.orderNotes && (
                                            <div style={{ color: 'var(--warning)', marginTop: 4, fontStyle: 'italic', maxWidth: 200, whiteSpace: 'normal' }}>
                                                📝 Note: {o.orderNotes}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(o.total)}</td>
                                    <td><span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{o.status.replace(/_/g, ' ')}</span></td>
                                    <td><span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{o.paymentStatus}</span></td>
                                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{o.type?.replace(/_/g, ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
