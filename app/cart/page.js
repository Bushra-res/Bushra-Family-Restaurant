'use client';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, updateInstructions,
        subtotal, taxAmount, discountAmount, total, coupon, setCoupon, itemCount } = useCart();
    const { addToast } = useToast();
    const [couponCode, setCouponCode] = useState('');
    const [applying, setApplying] = useState(false);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplying(true);
        try {
            const res = await fetch('/api/coupons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.minOrderAmount && subtotal < data.minOrderAmount) {
                throw new Error(`Minimum order amount ₹${data.minOrderAmount} required`);
            }

            setCoupon(data);
            addToast('Coupon applied successfully!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
        setApplying(false);
    };

    if (cart.length === 0) {
        return (
            <div className="customer-layout">
                <Navbar />
                <div className="page-container" style={{ maxWidth: 600 }}>
                    <div className="empty-state" style={{ paddingTop: 80 }}>
                        <div className="empty-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>Add some delicious items from our menu</p>
                        <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 900 }}>
                <div className="page-header">
                    <div>
                        <h1>Your Cart</h1>
                        <p className="subtitle">{itemCount} item{itemCount > 1 ? 's' : ''} in your cart</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-xl)', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {cart.map(item => (
                            <div key={item._id} className="card" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                                    background: item.image ? `url(${item.image}) center/cover` : 'var(--bg-card-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {!item.image && <span style={{ fontSize: 28, opacity: 0.4 }}>🍽️</span>}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                                            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{item.name}</h3>
                                        </div>
                                        <button onClick={() => removeFromCart(item._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                                            ✕
                                        </button>
                                    </div>

                                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 8 }}>
                                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="btn btn-secondary btn-icon" style={{ width: 30, height: 30 }}>−</button>
                                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="btn btn-secondary btn-icon" style={{ width: 30, height: 30 }}>+</button>
                                        </div>
                                        <input type="text" placeholder="Special instructions..."
                                            value={item.specialInstructions}
                                            onChange={e => updateInstructions(item._id, e.target.value)}
                                            style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--font-xs)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
                        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                            Order Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
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
                                    <span>Discount ({coupon?.code})</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--font-lg)' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--accent-primary)' }}>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Coupon */}
                        {!coupon && (
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                <input type="text" placeholder="Coupon code" value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                    style={{ flex: 1, padding: '8px 10px', fontSize: 'var(--font-xs)' }} />
                                <button onClick={applyCoupon} className="btn btn-secondary btn-sm" disabled={applying}>
                                    Apply
                                </button>
                            </div>
                        )}
                        {coupon && (
                            <div style={{
                                background: 'var(--success-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--font-xs)', color: 'var(--success)', marginBottom: 'var(--space-md)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <span>🎫 {coupon.code} applied</span>
                                <button onClick={() => setCoupon(null)} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}>✕</button>
                            </div>
                        )}

                        <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            Proceed to Checkout →
                        </Link>
                    </div>
                </div>

                <style jsx>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 1fr 340px"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
