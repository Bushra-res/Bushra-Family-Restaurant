'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('restaurant_cart');
        if (saved) {
            try { setCart(JSON.parse(saved)); } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('restaurant_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, specialInstructions: '' }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(prev => prev.map(i => i._id === itemId ? { ...i, quantity } : i));
    };

    const updateInstructions = (itemId, specialInstructions) => {
        setCart(prev => prev.map(i => i._id === itemId ? { ...i, specialInstructions } : i));
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.tax || 5)) / 100, 0);
    const discountAmount = coupon
        ? coupon.type === 'percentage'
            ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
            : coupon.value
        : 0;
    const total = subtotal + taxAmount - discountAmount;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, updateInstructions, clearCart,
            coupon, setCoupon, subtotal, taxAmount, discountAmount, total, itemCount,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
