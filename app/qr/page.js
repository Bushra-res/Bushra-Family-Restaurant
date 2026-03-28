'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function QRMenuPageWrapper() {
    return (
        <Suspense fallback={<LoadingAnimation />}>
            <QRMenuPage />
        </Suspense>
    );
}

function QRMenuPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const table = searchParams.get('table');
    const { addToCart, itemCount } = useCart();
    const { addToast } = useToast();
    const { data: session } = useSession();

    useEffect(() => {
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/menu').then(r => r.json()),
        ]).then(([cats, menuItems]) => {
            setCategories(cats || []);
            setItems(menuItems || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(i => i.category?._id === selectedCategory);

    return (
        <div style={{ padding: 'var(--space-md)', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: 8 }}>
                    <Image src="/images/logo.png" alt="BUSHRA Logo" width={56} height={56} style={{ objectFit: 'contain' }} />
                </div>
                <h1 style={{
                    fontSize: 'var(--font-2xl)', fontWeight: 800,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>BUSHRA Family Restaurant</h1>
                {table && <span className="badge badge-info" style={{ marginTop: 8 }}>Table {table}</span>}
            </div>

            <div className="tabs" style={{ marginBottom: 'var(--space-md)' }}>
                <button className={`tab ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}>All</button>
                {categories.map(c => (
                    <button key={c._id} className={`tab ${selectedCategory === c._id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(c._id)}>{c.name}</button>
                ))}
            </div>

            {loading ? (
                <LoadingAnimation />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {filteredItems.map(item => (
                        <div key={item._id} className="card" style={{
                            display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md)',
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                    <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.name}</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                                    {item.description?.substring(0, 60)}
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>₹{item.price}</span>
                            </div>
                            <button onClick={() => {
                                if (!session) { addToast('Please login to add items', 'warning'); return; }
                                addToCart(item);
                                addToast(`${item.name} added`, 'success');
                            }} className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }}>+ Add</button>
                        </div>
                    ))}
                </div>
            )}

            {itemCount > 0 && (
                <div style={{
                    position: 'fixed', bottom: 20, left: 20, right: 20,
                    maxWidth: 460, margin: '0 auto',
                }}>
                    <Link href="/cart" className="btn btn-primary btn-lg" style={{
                        width: '100%', boxShadow: 'var(--shadow-lg)',
                    }}>
                        🛒 View Cart ({itemCount} items)
                    </Link>
                </div>
            )}
        </div>
    );
}
