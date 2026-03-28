'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { cart, subtotal, taxAmount, discountAmount, total, coupon, clearCart } = useCart();
    const { addToast } = useToast();
    const { data: session } = useSession();
    const router = useRouter();

    const [orderType, setOrderType] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (orderType === 'delivery') {
            if (!session) {
                addToast('Please login or create an account for delivery orders.', 'warning');
                router.push('/login?callbackUrl=/checkout');
                return;
            }
            if (!address.street || !address.city || !address.pincode) {
                addToast('Please fill in delivery address', 'error');
                return;
            }
        }

        setLoading(true);
        try {
            const orderData = {
                customer: session?.user?.id,
                customerName: session?.user?.name,
                items: cart.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions || '',
                })),
                subtotal,
                tax: taxAmount,
                discount: discountAmount,
                total,
                type: orderType,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
                deliveryAddress: orderType === 'delivery' ? address : undefined,
                orderNotes: notes,
                couponCode: coupon?.code || '',
            };

            // Don't link to guest ID if not logged in
            if (!session?.user?.id) {
                delete orderData.customer;
                orderData.customerName = 'Guest';
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const order = await res.json();
            if (!res.ok) throw new Error(order.error);

            clearCart();
            addToast('Order placed successfully!', 'success');
            router.push(`/orders/${order._id}`);
        } catch (err) {
            addToast(err.message || 'Failed to place order', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (cart.length === 0) {
            router.push('/cart');
        }
    }, [cart.length, router]);

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 900 }}>
                <div className="page-header">
                    <div>
                        <h1>Checkout</h1>
                        <p className="subtitle">Review your order and place it</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {/* Order Type */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>Order Type</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                {[
                                    { value: 'delivery', label: '🚗 Delivery', desc: 'Get it delivered' },
                                    { value: 'takeaway', label: '🛍️ Takeaway', desc: 'Pick up yourself' },
                                    { value: 'dine_in', label: '🪑 Dine In', desc: 'Eat at restaurant' },
                                ].map(type => (
                                    <button key={type.value}
                                        onClick={() => setOrderType(type.value)}
                                        className={`card ${orderType === type.value ? '' : ''}`}
                                        style={{
                                            flex: 1, cursor: 'pointer', textAlign: 'center', padding: 'var(--space-md)',
                                            borderColor: orderType === type.value ? 'var(--accent-primary)' : 'var(--border)',
                                            background: orderType === type.value ? 'rgba(249,115,22,0.08)' : 'var(--bg-card)',
                                        }}>
                                        <div style={{ fontSize: 24 }}>{type.label.split(' ')[0]}</div>
                                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginTop: 4 }}>{type.label.split(' ').slice(1).join(' ')}</div>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {orderType === 'delivery' && (
                            <div className="card">
                                <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>📍 Delivery Address</h3>
                                {!session ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                                        <p style={{ marginBottom: 'var(--space-sm)' }}>You must be logged in to place a delivery order.</p>
                                        <button onClick={() => router.push('/login?callbackUrl=/checkout')} className="btn btn-primary">Login to Continue</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        <div className="input-group">
                                            <label>Street Address</label>
                                            <input type="text" value={address.street}
                                                onChange={e => setAddress({ ...address, street: e.target.value })}
                                                placeholder="Enter street address" required />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                            <div className="input-group">
                                                <label>City</label>
                                                <input type="text" value={address.city}
                                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                                    placeholder="City" required />
                                            </div>
                                            <div className="input-group">
                                                <label>State</label>
                                                <input type="text" value={address.state}
                                                    onChange={e => setAddress({ ...address, state: e.target.value })}
                                                    placeholder="State" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Pincode</label>
                                            <input type="text" value={address.pincode}
                                                onChange={e => setAddress({ ...address, pincode: e.target.value })}
                                                placeholder="Pincode" required />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>💳 Payment Method</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                {[
                                    { value: 'cash', label: '💵 Cash' },
                                    { value: 'card', label: '💳 Card' },
                                    { value: 'digital', label: '📱 Digital' },
                                ].map(pm => (
                                    <button key={pm.value}
                                        onClick={() => setPaymentMethod(pm.value)}
                                        className="card" style={{
                                            flex: 1, cursor: 'pointer', textAlign: 'center', padding: 'var(--space-md)',
                                            borderColor: paymentMethod === pm.value ? 'var(--accent-primary)' : 'var(--border)',
                                            background: paymentMethod === pm.value ? 'rgba(249,115,22,0.08)' : 'var(--bg-card)',
                                        }}>
                                        <span style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{pm.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>📝 Order Notes</h3>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                placeholder="Any special requests or instructions..." rows={3} />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
                        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                            Order Summary
                        </h3>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            {cart.map(item => (
                                <div key={item._id} style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                                    borderBottom: '1px solid var(--border)', fontSize: 'var(--font-sm)',
                                }}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--success)' }}>
                                    <span>Discount</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{
                                borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)',
                                display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--font-lg)',
                            }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--accent-primary)' }}>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={handlePlaceOrder} className="btn btn-primary btn-lg"
                            disabled={loading} style={{ width: '100%', marginTop: 'var(--space-lg)' }}>
                            {loading ? 'Placing Order...' : `Place Order — ₹${total.toFixed(2)}`}
                        </button>
                    </div>
                </div>

                <style jsx>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 1fr 360px"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
