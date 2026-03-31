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

            {/* Main Financial Stats */}
            {/* Main Financial Stats */}
            <div className="grid grid-4" style={{ marginBottom: 'var(--space-lg)' }}>
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
            <div className="grid grid-3" style={{ marginBottom: 'var(--space-lg)' }}>
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
                            const dineIn = report?.ordersByType?.dine_in || 0;
                            const parcel = (report?.ordersByType?.takeaway || 0) + (report?.ordersByType?.delivery || 0);
                            const total = dineIn + parcel;
                            
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
                <style jsx>{`
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
