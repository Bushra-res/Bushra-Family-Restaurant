'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const { addToast } = useToast();

    const fetchOrders = () => {
        if (!session?.user?.id) return;
        fetch(`/api/orders?assigned=${session.user.id}`)
            .then(r => r.json())
            .then(data => { setOrders(data || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [session]);

    const updateStatus = async (orderId, status) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            addToast(`Order marked as ${status.replace(/_/g, ' ')}`, 'success');
            fetchOrders();
        } catch { addToast('Error updating', 'error'); }
    };

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const completedOrders = orders.filter(o => o.status === 'delivered');

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>🚗 My Deliveries</h1>
                    <p className="subtitle">{activeOrders.length} active • {completedOrders.length} completed</p>
                </div>
                <button onClick={fetchOrders} className="btn btn-secondary">🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div className="grid grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.15)' }}>📦</div>
                    <div className="stat-info"><h3>Active</h3><div className="stat-value">{activeOrders.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
                    <div className="stat-info"><h3>Delivered</h3><div className="stat-value">{completedOrders.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>💰</div>
                    <div className="stat-info"><h3>Total Value</h3><div className="stat-value">{formatCurrency(orders.reduce((s, o) => s + (o.total || 0), 0))}</div></div>
                </div>
            </div>

            {/* Active Orders */}
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Active Deliveries
            </h2>
            {activeOrders.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No active deliveries</h3><p>New deliveries will appear here</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    {activeOrders.map(order => (
                        <div key={order._id} className="card" style={{
                            borderLeft: `4px solid ${order.status === 'ready' ? 'var(--success)' : order.status === 'out_for_delivery' ? 'var(--warning)' : 'var(--info)'}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <div>
                                    <h3 style={{ fontWeight: 800 }}>{order.orderId}</h3>
                                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{formatDateTime(order.createdAt)}</span>
                                </div>
                                <span className={`badge ${order.status === 'ready' ? 'badge-success' :
                                    order.status === 'out_for_delivery' ? 'badge-warning' : 'badge-info'
                                    }`}>{order.status.replace(/_/g, ' ')}</span>
                            </div>

                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 4 }}>📍 Delivery Address</h4>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                    {order.deliveryAddress ? (
                                        `${order.deliveryAddress.street}, ${order.deliveryAddress.city} ${order.deliveryAddress.pincode}`
                                    ) : 'No address provided'}
                                </p>
                            </div>

                            <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>
                                <span style={{ fontWeight: 600 }}>Customer:</span> {order.customerName || order.customer?.name}
                                {(order.customerPhone || order.customer?.phone) && (
                                    <span> • 📞 {order.customerPhone || order.customer?.phone}</span>
                                )}
                            </div>

                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                {order.items.map((i, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', borderBottom: '1px dashed var(--border)', paddingBottom: 4, marginBottom: 4 }}>
                                        <span>{i.quantity}x {i.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>₹{i.price}</span>
                                    </div>
                                ))}
                                {order.orderNotes && (
                                    <div style={{ color: 'var(--warning)', marginTop: 'var(--space-sm)', fontSize: 'var(--font-sm)', fontStyle: 'italic', padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                        📝 Note: {order.orderNotes}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{formatCurrency(order.total)}</span>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    {order.status === 'ready' && (
                                        <button onClick={() => updateStatus(order._id, 'out_for_delivery')} className="btn btn-primary btn-sm">
                                            🚗 Picked Up
                                        </button>
                                    )}
                                    {order.status === 'out_for_delivery' && (
                                        <button onClick={() => updateStatus(order._id, 'delivered')} className="btn btn-success btn-sm">
                                            ✅ Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed */}
            {completedOrders.length > 0 && (
                <>
                    <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                        Completed Today
                    </h2>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Time</th></tr></thead>
                            <tbody>
                                {completedOrders.slice(0, 10).map(o => (
                                    <tr key={o._id}>
                                        <td style={{ fontWeight: 600 }}>{o.orderId}</td>
                                        <td>{o.customerName || o.customer?.name}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(o.total)}</td>
                                        <td style={{ fontSize: 'var(--font-xs)' }}>{formatDateTime(o.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
