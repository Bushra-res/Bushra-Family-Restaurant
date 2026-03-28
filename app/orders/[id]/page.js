'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';

const ORDER_STATUSES = [
    { key: 'placed', label: 'Order Placed', icon: '📝' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '✅' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewItem, setReviewItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const { addToast } = useToast();
    const { data: session } = useSession();

    const fetchOrder = () => {
        fetch(`/api/orders/${id}`)
            .then(r => r.json())
            .then(data => { setOrder(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const submitReview = async () => {
        try {
            await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: session?.user?.id,
                    menuItem: reviewItem.menuItem,
                    order: order._id,
                    rating,
                    comment,
                }),
            });
            addToast('Review submitted!', 'success');
            setReviewItem(null);
            setRating(5);
            setComment('');
        } catch (err) {
            addToast('Failed to submit review', 'error');
        }
    };

    if (loading) return (
        <div className="customer-layout">
            <Navbar />
            <LoadingAnimation />
        </div>
    );

    if (!order) return (
        <div className="customer-layout">
            <Navbar />
            <div className="empty-state" style={{ paddingTop: 120 }}>
                <h3>Order not found</h3>
                <Link href="/orders" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                    Back to Orders
                </Link>
            </div>
        </div>
    );

    const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 800 }}>
                <div className="page-header">
                    <div>
                        <h1>{order.orderId}</h1>
                        <p className="subtitle">Placed on {formatDateTime(order.createdAt)}</p>
                    </div>
                    <span className={`badge ${isCancelled ? 'badge-danger' : order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}
                        style={{ fontSize: 'var(--font-sm)', padding: '6px 16px' }}>
                        {order.status.replace(/_/g, ' ')}
                    </span>
                </div>

                {/* Order Timeline */}
                {!isCancelled && (
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Order Progress</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                            <div style={{
                                position: 'absolute', top: 16, left: 30, right: 30, height: 3,
                                background: 'var(--border)', borderRadius: 2,
                            }}>
                                <div style={{
                                    width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%`,
                                    height: '100%', background: 'var(--gradient-primary)', borderRadius: 2,
                                    transition: 'width 0.5s ease',
                                }}></div>
                            </div>

                            {ORDER_STATUSES.map((status, i) => (
                                <div key={status.key} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, margin: '0 auto 6px',
                                        background: i <= currentStatusIndex ? 'var(--accent-primary)' : 'var(--bg-card)',
                                        border: `2px solid ${i <= currentStatusIndex ? 'var(--accent-primary)' : 'var(--border)'}`,
                                        transition: 'all 0.3s ease',
                                    }}>
                                        {status.icon}
                                    </div>
                                    <div style={{
                                        fontSize: '10px', fontWeight: 600, maxWidth: 70,
                                        color: i <= currentStatusIndex ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    }}>
                                        {status.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Items Ordered</h3>
                    {order.items.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                    ₹{item.price} × {item.quantity}
                                    {item.specialInstructions && <span> — {item.specialInstructions}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                                {order.status === 'delivered' && (
                                    <button onClick={() => setReviewItem(item)} className="btn btn-ghost btn-sm">⭐ Rate</button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tax</span><span>₹{order.tax?.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--success)', marginBottom: 4 }}>
                                <span>Discount</span><span>-₹{order.discount?.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--font-lg)', paddingTop: 'var(--space-sm)' }}>
                            <span>Total</span><span style={{ color: 'var(--accent-primary)' }}>₹{order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="card">
                        <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Order Details</h4>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 2 }}>
                            <div>Type: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{order.type?.replace(/_/g, ' ')}</span></div>
                            <div>Payment: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{order.paymentMethod}</span></div>
                            <div>Payment Status: <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span></div>
                            {order.loyaltyPointsEarned > 0 && (
                                <div>Loyalty Points: <span className="badge badge-purple">+{order.loyaltyPointsEarned} pts</span></div>
                            )}
                        </div>
                    </div>

                    {order.deliveryAddress?.street && (
                        <div className="card">
                            <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>📍 Delivery Address</h4>
                            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                {order.deliveryAddress.street}<br />
                                {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                                {order.deliveryAddress.pincode}
                            </div>
                        </div>
                    )}
                </div>

                {/* Review Modal */}
                {reviewItem && (
                    <div className="modal-overlay" onClick={() => setReviewItem(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Rate {reviewItem.name}</h2>
                                <button className="modal-close" onClick={() => setReviewItem(null)}>✕</button>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-md)' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setRating(s)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28 }}>
                                        {s <= rating ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>
                            <textarea value={comment} onChange={e => setComment(e.target.value)}
                                placeholder="Share your experience..." rows={3}
                                style={{ marginBottom: 'var(--space-md)' }} />
                            <button onClick={submitReview} className="btn btn-primary" style={{ width: '100%' }}>
                                Submit Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
