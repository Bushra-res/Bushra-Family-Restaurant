'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            fetch(`/api/orders?customer=${session.user.id}`)
                .then(r => r.json())
                .then(data => { setOrders(data || []); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [session]);

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 800 }}>
                <div className="page-header">
                    <div>
                        <h1>My Orders</h1>
                        <p className="subtitle">Track and manage your orders</p>
                    </div>
                </div>

                {loading ? (
                    <LoadingAnimation />
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>Place your first order from our menu</p>
                        <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {orders.map(order => (
                            <Link key={order._id} href={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                        <div>
                                            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>
                                                {order.orderId}
                                            </h3>
                                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                        <span className={`badge ${order.status === 'delivered' ? 'badge-success' :
                                                order.status === 'cancelled' ? 'badge-danger' :
                                                    order.status === 'preparing' ? 'badge-info' : 'badge-warning'
                                            }`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                        {order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                                            ₹{order.total?.toFixed(2)}
                                        </span>
                                        <span className="badge badge-purple">{order.type?.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
