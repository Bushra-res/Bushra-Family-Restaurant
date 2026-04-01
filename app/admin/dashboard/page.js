'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/components/Toast';

export default function AdminDashboard() {
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const { confirm } = useConfirm();
    const { addToast } = useToast();

    const fetchData = () => {
        setLoading(true);
        fetch(`/api/reports?period=${period}`)
            .then(r => r.json())
            .then(data => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const handleCleanup = async () => {
        const isConfirmed = await confirm(
            '⚠️ Permanent Cleanup', 
            'Are you sure? This will permanently delete ALL sales, orders, and expenses data. This action cannot be undone.',
            { type: 'danger', confirmText: 'Clear Sales & Expenses' }
        );
        
        if (!isConfirmed) return;
        
        setCleaning(true);
        try {
            const res = await fetch('/api/admin/cleanup', { method: 'POST' });
            if (res.ok) {
                addToast('Sales and Expenses cleared successfully!', 'success');
                fetchData();
            } else {
                addToast('Failed to clear sales data.', 'error');
            }
        } catch (e) {
            addToast('An error occurred.', 'error');
        } finally {
            setCleaning(false);
        }
    };

    const downloadCSV = () => {
        if (!report?.orders?.length) {
            addToast('No data available to export', 'info');
            return;
        }
        const headers = 'Order ID,Customer,Items,Subtotal,Tax,Discount,Total,Status,Payment,Type,Date\n';
        const rows = report.orders.map(o =>
            `${o.orderId},${o.customerName || 'Walk-in'},"${o.items.map(i => i.name).join('; ')}",${o.subtotal},${o.tax},${o.discount},${o.total},${o.status},${o.paymentMethod},${o.type},${new Date(o.createdAt).toLocaleDateString()}`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `sales_report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        addToast('Exported CSV successfully', 'success');
    };

    if (loading && !report) return <LoadingAnimation />;

    const starItem = report?.topItems?.[0];

    return (
        <div className="animate-fadeIn">
            <div className="page-header" style={{ alignItems: 'center' }}>
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="subtitle">Operational analytics & unified reporting for BUSHRA</p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    alignItems: 'center', 
                    gap: 'var(--space-sm)',
                    justifyContent: 'flex-end',
                    flex: 1
                }}>
                    {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                        <button key={p} className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
                    ))}
                    <button onClick={downloadCSV} className="btn btn-success btn-sm">📥 Export CSV</button>
                    <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={handleCleanup}
                        disabled={cleaning}
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '10px' }}
                    >
                        {cleaning ? '⌛ Cleaning...' : '🧹 Cleanup Sales & Expenses'}
                    </button>
                </div>
            </div>

            {/* Custom Dashboard Styles for better responsiveness */}
            <style jsx>{`
                .dash-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-lg);
                    margin-bottom: var(--space-lg);
                }
                .dash-payment-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-lg);
                    margin-bottom: var(--space-lg);
                }
                .income-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: var(--space-md);
                }
                .income-stat {
                    background: var(--bg-input);
                    padding: var(--space-md);
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-light);
                    text-align: center;
                    transition: var(--transition);
                }
                .income-stat:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-sm);
                }
                .income-stat.highlight {
                    background: var(--gradient-primary);
                    border: none;
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
                }
                .income-label {
                    font-size: var(--font-xs);
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 600;
                }
                .income-value {
                    font-size: var(--font-lg);
                    font-weight: 800;
                    color: var(--text-primary);
                }
                @media (max-width: 1200px) {
                    .dash-stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .income-summary-grid { grid-template-columns: repeat(3, 1fr); }
                    .income-stat.highlight { grid-column: span 3; }
                }
                @media (max-width: 768px) {
                    .dash-stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
                    .dash-payment-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
                    .income-summary-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
                    .income-stat.highlight { grid-column: span 2; }
                    .income-stat { padding: var(--space-sm); }
                    .income-value { font-size: var(--font-md); }
                }
                @media (max-width: 480px) {
                    .dash-payment-grid { grid-template-columns: 1fr; }
                }
                /* Mobile tweaks for stat cards */
                @media (max-width: 768px) {
                    :global(.stat-card) {
                        padding: 12px !important;
                        gap: 10px !important;
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                        justify-content: flex-start;
                    }
                    :global(.stat-card .stat-icon) {
                        width: 40px !important;
                        height: 40px !important;
                        font-size: 20px !important;
                        margin: 0 auto;
                    }
                    :global(.stat-card .stat-info h3) {
                        font-size: 11px !important;
                    }
                    :global(.stat-card .stat-info .stat-value) {
                        font-size: 16px !important;
                    }
                    :global(.stat-card .stat-info p) {
                        font-size: 9px !important;
                    }
                }
                .grid-dashboard-main {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: var(--space-lg);
                }
                @media (max-width: 992px) {
                    .grid-dashboard-main {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Total Universal Income Summary Card */}
            <div className="card card-glass animate-slideUp" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--font-lg)' }}>🌟 Universal Income Summary</h3>
                    <div className="badge badge-success">Always Up-to-date</div>
                </div>
                <div className="income-summary-grid">
                    <div className="income-stat">
                        <div className="income-label">Today</div>
                        <div className="income-value">{formatCurrency(report?.incomeSummary?.today || 0)}</div>
                    </div>
                    <div className="income-stat">
                        <div className="income-label">This Week</div>
                        <div className="income-value">{formatCurrency(report?.incomeSummary?.week || 0)}</div>
                    </div>
                    <div className="income-stat">
                        <div className="income-label">This Month</div>
                        <div className="income-value">{formatCurrency(report?.incomeSummary?.month || 0)}</div>
                    </div>
                    <div className="income-stat">
                        <div className="income-label">This Year</div>
                        <div className="income-value">{formatCurrency(report?.incomeSummary?.year || 0)}</div>
                    </div>
                    <div className="income-stat highlight">
                        <div className="income-label" style={{ color: 'white' }}>Total All Time</div>
                        <div className="income-value" style={{ color: 'white' }}>{formatCurrency(report?.incomeSummary?.allTime || 0)}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>Period Overview (<span style={{textTransform: 'capitalize'}}>{period}</span>)</h3>
            </div>

            {/* Main Financial Stats */}
            <div className="dash-stats-grid">
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.15)' }}>💰</div>
                    <div className="stat-info">
                        <h3>Gross Revenue</h3>
                        <div className="stat-value">{formatCurrency(report?.totalRevenue || 0)}</div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>From {report?.totalOrders || 0} orders</p>
                    </div>
                </div>
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>💸</div>
                    <div className="stat-info">
                        <h3>Expenses</h3>
                        <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(report?.totalExpenses || 0)}</div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Operating costs</p>
                    </div>
                </div>
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>💎</div>
                    <div className="stat-info">
                        <h3>Net Revenue</h3>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>
                            {formatCurrency(report?.netRevenue || 0)}
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>After deductions</p>
                    </div>
                </div>
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>📊</div>
                    <div className="stat-info">
                        <h3>Avg Order</h3>
                        <div className="stat-value" style={{ color: 'var(--info)' }}>
                            {formatCurrency(report?.avgOrderValue || 0)}
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Per customer sale</p>
                    </div>
                </div>
            </div>

            {/* Payment Mode Stats */}
            <div className="dash-payment-grid">
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>💵</div>
                    <div className="stat-info">
                        <h3>Cash Payments</h3>
                        <div className="stat-value">{formatCurrency(report?.paymentMethods?.cash || 0)}</div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total cash collected</p>
                    </div>
                </div>
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>💳</div>
                    <div className="stat-info">
                        <h3>Card Payments</h3>
                        <div className="stat-value">{formatCurrency(report?.paymentMethods?.card || 0)}</div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total card transactions</p>
                    </div>
                </div>
                <div className="stat-card premium-hover">
                    <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>📱</div>
                    <div className="stat-info">
                        <h3>UPI Payments</h3>
                        <div className="stat-value">{formatCurrency(report?.paymentMethods?.upi || 0)}</div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total via UPI/QR</p>
                    </div>
                </div>
            </div>

            {/* Weekly Sales Bar Chart */}
            {report?.revenueByDay && Object.keys(report.revenueByDay).length > 0 && (
                <div className="card card-glass animate-slideUp" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>📈 Weekly Sales Overview</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 200, padding: '0 var(--space-sm)' }}>
                        {(() => {
                            const entries = Object.entries(report.revenueByDay).slice(-7);
                            const maxVal = Math.max(...entries.map(([,v]) => v), 1);
                            return entries.map(([day, rev], idx) => {
                                const pct = (rev / maxVal) * 100;
                                const isToday = idx === entries.length - 1;
                                return (
                                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: isToday ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                            {formatCurrency(rev)}
                                        </span>
                                        <div style={{
                                            width: '100%',
                                            maxWidth: 48,
                                            height: `${Math.max(pct, 4)}%`,
                                            background: isToday ? 'var(--gradient-primary)' : 'var(--accent-primary)',
                                            opacity: isToday ? 1 : 0.25 + (pct / 100) * 0.6,
                                            borderRadius: '8px 8px 4px 4px',
                                            transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                            minHeight: 6,
                                        }} />
                                        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)' }}>
                                            {day.split('/').slice(0,2).join('/')}
                                        </span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* Sales Channel Breakdown Pie Chart */}
            <div className="grid grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card card-glass animate-slideUp">
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>📊 Sales Channel Breakdown</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap', minHeight: 220 }}>
                        {(() => {
                            const validOrders = (report?.orders || []).filter(o => o.status !== 'cancelled');
                            const parcel = validOrders.filter(o => o.parcelOptions?.charges > 0).length;
                            const dineIn = validOrders.length - parcel;
                            const total = validOrders.length;
                            
                            if (total === 0) return <div style={{ color: 'var(--text-muted)' }}>No sales data available</div>;

                            const dineInPct = (dineIn / total) * 100;
                            const parcelPct = (parcel / total) * 100;
                            
                            // Simple SVG Circle with stroke-dasharray for 2 segments
                            const radius = 70;
                            const circumference = 2 * Math.PI * radius;
                            const dineInOffset = 0;
                            const parcelOffset = (dineInPct / 100) * circumference;

                            return (
                                <>
                                    <div style={{ position: 'relative', width: 180, height: 180 }}>
                                        <svg width="180" height="180" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                            {/* Dine In Segment */}
                                            <circle 
                                                cx="100" cy="100" r={radius} 
                                                fill="transparent" 
                                                stroke="var(--accent-primary)" 
                                                strokeWidth="35"
                                                strokeDasharray={`${(dineInPct / 100) * circumference} ${circumference}`}
                                                style={{ transition: 'stroke-dasharray 1s ease' }}
                                            />
                                            {/* Parcel Segment */}
                                            <circle 
                                                cx="100" cy="100" r={radius} 
                                                fill="transparent" 
                                                stroke="#4f46e5" 
                                                strokeWidth="35"
                                                strokeDasharray={`${(parcelPct / 100) * circumference} ${circumference}`}
                                                strokeDashoffset={-parcelOffset}
                                                style={{ transition: 'stroke-dasharray 1s ease' }}
                                            />
                                        </svg>
                                        <div style={{ 
                                            position: 'absolute', top: '50%', left: '50%', 
                                            transform: 'translate(-50%, -50%)', 
                                            textAlign: 'center' 
                                        }}>
                                            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--text-primary)' }}>{total}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 150 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent-primary)' }}></div>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700 }}>Dine-in Sales</div>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{dineIn} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({dineInPct.toFixed(1)}%)</span></div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#4f46e5' }}></div>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700 }}>Parcel Sales</div>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{parcel} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>({parcelPct.toFixed(1)}%)</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Star Product Card (Moving it here for better balance) */}
                <div className="card card-glass animate-slideUp" style={{ 
                    position: 'relative', overflow: 'hidden', 
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.08), var(--bg-card))'
                }}>
                    <div style={{ 
                        position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: 0.08, transform: 'rotate(15deg)'
                    }}>🔥</div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span className="badge badge-warning" style={{ marginBottom: 'var(--space-sm)' }}>✨ Star of the Period</span>
                        <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 4 }}>
                            {starItem ? starItem.name : 'No Data'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)' }}>
                            Fastest selling product across all channels
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                            <div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Orders</div>
                                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{starItem?.count || 0}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Revenue</div>
                                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                    {formatCurrency(starItem?.revenue || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-dashboard-main" style={{ marginBottom: 'var(--space-xl)' }}>
                {/* Top Items Table (Expanded width) */}
                <div className="card card-glass">
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>🔥 Top Performing Menu Items</h3>
                    <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                        {(report?.topItems || []).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>No sales data available yet</p>
                        ) : (
                            report.topItems.slice(0, 10).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 0', borderBottom: '1px solid var(--border-light)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                            background: i === 0 ? 'var(--gradient-primary)' : 'var(--bg-input)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-xs)', fontWeight: 800, color: i === 0 ? 'white' : 'var(--text-secondary)',
                                        }}>{i + 1}</span>
                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.name}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{item.count} items sold</div>
                                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(item.revenue)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity Mini */}
                <div className="card card-glass">
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>🕒 Recent Operations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {(report?.orders || []).slice(0, 8).map(order => (
                            <div key={order._id} style={{ 
                                display: 'flex', justifyContent: 'space-between', padding: '10px 14px', 
                                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>#{order.orderId}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString()} • {order.type?.replace(/_/g, ' ')}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(order.total)}</div>
                                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9, padding: '1px 6px' }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
}
