'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MenuPageWrapper() {
    return (
        <Suspense fallback={<LoadingAnimation />}>
            <MenuPage />
        </Suspense>
    );
}

function MenuPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/menu').then(r => r.json()),
        ]).then(([cats, menuItems]) => {
            setCategories(cats || []);
            setItems(menuItems || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [searchParams]);

    const filteredItems = items.filter(item => {
        const matchCategory = selectedCategory === 'all' || item.category?._id === selectedCategory;
        const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    const handleAddToCart = (item) => {
        if (!session) {
            router.push('/login');
            return;
        }
        addToCart(item);
        addToast(`${item.name} added to cart`, 'success');
    };

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 1200 }}>
                <div className="page-header">
                    <div>
                        <h1>Our Menu</h1>
                        <p className="subtitle">Discover our delicious offerings</p>
                    </div>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input type="search" placeholder="Search food items..." value={search}
                            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="tabs">
                    <button className={`tab ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}>All</button>
                    {categories.map(cat => (
                        <button key={cat._id} className={`tab ${selectedCategory === cat._id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat._id)}>{cat.name}</button>
                    ))}
                </div>

                {loading ? (
                    <LoadingAnimation />
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <h3>No items found</h3>
                        <p>Try a different category or search term.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 'var(--space-lg)',
                    }}>
                        {filteredItems.map(item => (
                            <div key={item._id} className="card animate-fadeIn" style={{ overflow: 'hidden', padding: 0 }}>
                                <div style={{
                                    height: 180,
                                    background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                    {!item.image && <span style={{ fontSize: 48, opacity: 0.3 }}>🍽️</span>}
                                    {item.isBestseller && (
                                        <span style={{
                                            position: 'absolute', top: 10, left: 10,
                                            background: 'var(--accent-primary)', color: 'white',
                                            padding: '3px 8px', borderRadius: 'var(--radius-full)',
                                            fontSize: '10px', fontWeight: 700,
                                        }}>⭐ BESTSELLER</span>
                                    )}
                                    {item.ratings?.average > 0 && (
                                        <span style={{
                                            position: 'absolute', bottom: 10, right: 10,
                                            background: 'rgba(0,0,0,0.7)', color: '#fbbf24',
                                            padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-xs)', fontWeight: 600,
                                        }}>⭐ {item.ratings.average}</span>
                                    )}
                                </div>

                                <div style={{ padding: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                                        <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                                        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, flex: 1 }}>{item.name}</h3>
                                    </div>

                                    {item.category && (
                                        <span className="badge badge-info" style={{ marginBottom: 'var(--space-sm)', display: 'inline-block' }}>
                                            {item.category.name}
                                        </span>
                                    )}

                                    <p style={{
                                        color: 'var(--text-muted)', fontSize: 'var(--font-xs)',
                                        marginBottom: 'var(--space-md)', lineHeight: 1.5,
                                        minHeight: 36,
                                    }}>
                                        {item.description?.substring(0, 100) || 'Delicious food item'}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{
                                                fontWeight: 800, fontSize: 'var(--font-xl)',
                                                background: 'var(--gradient-primary)',
                                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                            }}>₹{item.price}</span>
                                            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginLeft: 4 }}>
                                                +{item.tax}% tax
                                            </span>
                                        </div>
                                        <button onClick={() => handleAddToCart(item)} className="btn btn-primary btn-sm">
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
