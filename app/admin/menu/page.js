'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/contexts/ConfirmContext';

export default function MenuManagement() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(50);
    const { addToast } = useToast();
    const { confirm } = useConfirm();

    const emptyItem = { name: '', code: '', category: '', price: '', tax: 5, description: '', image: '', isAvailable: true, isVeg: true, isBestseller: false, ingredients: '' };
    const [form, setForm] = useState(emptyItem);
    const [catForm, setCatForm] = useState({ name: '', description: '' });

    const fetchData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const [cats, menuRes, settingsRes] = await Promise.all([
                fetch('/api/categories').then(r => r.json()),
                fetch(`/api/menu?minimal=true&search=${encodeURIComponent(search)}&page=${page}&limit=${itemsPerPage}`).then(r => r.json()),
                fetch('/api/settings').then(r => r.json()),
            ]);
            setCategories(cats || []);
            
            if (menuRes.items) {
                setItems(menuRes.items || []);
                setTotalPages(menuRes.pagination.pages || 1);
                setTotalItems(menuRes.pagination.total || 0);
            } else {
                // Fallback for non-paged response
                setItems(menuRes || []);
                setTotalItems(menuRes.length || 0);
            }
            
            setSettings(settingsRes || {});
        } catch (err) {
            addToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Sanitize data to remove immutable internal MongoDB fields
            const { _id, createdAt, updatedAt, __v, ...itemData } = form;
            
            const data = {
                ...itemData,
                price: parseFloat(form.price),
                tax: parseFloat(form.tax),
                ingredients: typeof form.ingredients === 'string' 
                    ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) 
                    : form.ingredients
            };

            const method = editing ? 'PUT' : 'POST';
            if (editing) data.id = editing._id;

            const res = await fetch('/api/menu', { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(data) 
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to save item');

            addToast(editing ? 'Item updated successfully' : 'Item added successfully', 'success');
            setShowModal(false);
            setEditing(null);
            setForm(emptyItem);
            fetchData();
        } catch (err) { 
            addToast(err.message, 'error'); 
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm(
            'Delete Item?', 
            'Are you sure you want to delete this menu item? This cannot be undone.', 
            { type: 'danger', confirmText: 'Delete' }
        );
        if (!isConfirmed) return;
        
        await fetch('/api/menu', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        addToast('Item deleted', 'success');
        fetchData();
    };

    const toggleAvailability = async (item) => {
        await fetch('/api/menu', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item._id, isAvailable: !item.isAvailable })
        });
        fetchData();
    };

    const updatePrice = async (item, newPrice) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        try {
            const res = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item._id, price: parseFloat(newPrice) })
            });
            if (res.ok) {
                setItems(prev => prev.map(i => i._id === item._id ? { ...i, price: newPrice } : i));
                addToast('Price updated', 'success');
            }
        } catch (err) {
            addToast('Failed to update price', 'error');
        }
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        try {
            const method = catForm._id ? 'PUT' : 'POST';
            const body = catForm._id ? { id: catForm._id, ...catForm } : catForm;
            const res = await fetch('/api/categories', { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(body) 
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save category');
            }

            addToast(catForm._id ? 'Category updated' : 'Category added', 'success');
            setShowCatModal(false);
            setCatForm({ name: '', description: '' });
            fetchData();
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const handleDeleteCategory = async () => {
        if (!catForm._id) return;
        const confirmed = await confirm(`Are you sure you want to delete "${catForm.name}"?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/categories?id=${catForm._id}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete category');
            }
            addToast('Category deleted successfully', 'success');
            setShowCatModal(false);
            setCatForm({ name: '', description: '' });
            fetchData();
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setForm({ ...form, image: reader.result }); // Set base64 string
            addToast('Image attached!', 'success');
        };
        reader.onerror = (error) => {
            addToast('Failed to read image', 'error');
        };
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Menu Management</h1>
                    <p className="subtitle">{totalItems} items across {categories.length} categories</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '240px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '14px' }}>🔍</span>
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Find items..." 
                            style={{ 
                                paddingLeft: '34px', 
                                borderRadius: 'var(--radius-sm)', 
                                border: '1px solid var(--border)',
                                background: 'white',
                                height: '38px',
                                fontSize: 'var(--font-xs)',
                                fontWeight: 500
                            }}
                        />
                    </div>
                    <button onClick={() => setShowCatModal(true)} className="btn btn-secondary">+ Category</button>
                    <button onClick={() => { setEditing(null); setForm(emptyItem); setShowModal(true); }} className="btn btn-primary">
                        + Add Item
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <div key={cat._id} className="badge" 
                        style={{ 
                            padding: '10px 14px', cursor: 'pointer', fontSize: 'var(--font-xs)',
                            border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-secondary)',
                            fontWeight: 700, borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)',
                            display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onClick={() => { setCatForm({ _id: cat._id, name: cat.name, description: cat.description }); setShowCatModal(true); }}>
                        <span style={{ fontSize: '14px' }}>📂</span> {cat.name}
                    </div>
                ))}
            </div>


            {/* Items Table */}
            <div className="card" style={{ padding: 0, opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Tax</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                                        No items found matching your search.
                                    </td>
                                </tr>
                            )}
                            {items.map(item => (
                                <tr key={item._id}>
                                    <td><span className="badge badge-secondary" style={{ fontWeight: 800 }}>{item.code || '-'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            {item.image && <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `url(${item.image}) center/cover`, flexShrink: 0 }}></div>}
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                {item.isBestseller && <span className="badge badge-warning" style={{ fontSize: '9px' }}>Bestseller</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-info">{item.category?.name || '-'}</span></td>
                                    <td style={{ fontWeight: 700 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            ₹<input type="number" defaultValue={item.price} 
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val !== item.price) updatePrice(item, val);
                                                }}
                                                style={{ 
                                                    width: 70, 
                                                    padding: '2px 4px', 
                                                    fontSize: 'inherit', 
                                                    fontWeight: 'inherit',
                                                    border: '1px solid transparent',
                                                    background: 'transparent',
                                                    borderRadius: 'var(--radius-sm)'
                                                }} 
                                                onFocus={(e) => e.target.style.borderColor = 'var(--border)'}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => {
                                                    if (document.activeElement !== e.target) {
                                                        e.target.style.background = 'transparent';
                                                        e.target.style.borderColor = 'transparent';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td>{item.tax}%</td>
                                    <td><span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span></td>
                                    <td>
                                        <button onClick={() => toggleAvailability(item)}
                                            className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}
                                            style={{ cursor: 'pointer', border: 'none' }}>
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                            <button onClick={() => {
                                                setEditing(item);
                                                setForm({ ...item, category: item.category?._id || '', ingredients: (item.ingredients || []).join(', ') });
                                                setShowModal(true);
                                            }} className="btn btn-ghost btn-sm">✏️</button>
                                            <button onClick={() => handleDelete(item._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 'var(--space-md)',
                        padding: '16px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg-secondary)'
                    }}>
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="btn btn-ghost btn-sm"
                        >
                            Previous
                        </button>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                            Page {page} of {totalPages}
                        </div>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="btn btn-ghost btn-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Item Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Item' : 'Add Item'} width="600px">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="grid grid-3">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Item Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mutton Biryani" required />
                        </div>
                        <div style={{ width: 100 }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Code (3-digit)</label>
                            <input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="001" maxLength={3} title="Unique 3-digit code for POS search" />
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                <option value="">Select</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-2">
                        <div className="input-group">
                            <label>Price (₹)</label>
                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" />
                        </div>
                        <div className="input-group">
                            <label>Tax (%)</label>
                            <input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} min="0" />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                    </div>
                    <div className="input-group">
                        <label>Ingredients (comma-separated)</label>
                        <input value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} placeholder="Rice, Chicken, Spices" />
                    </div>
                    <div className="input-group">
                        <label>Food Image</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload}
                            style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: 'var(--radius-sm)' }} />
                        {form.image && <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', background: `url(${form.image}) center/cover`, marginTop: 8 }}></div>}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                            <input type="checkbox" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} /> Vegetarian
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                            <input type="checkbox" checked={form.isBestseller} onChange={e => setForm({ ...form, isBestseller: e.target.checked })} /> Bestseller
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                            <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} /> Available
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={saving}>
                        {saving ? 'Saving...' : (editing ? 'Update Item' : 'Add Item')}
                    </button>
                </form>
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title={catForm._id ? 'Edit Category' : 'Add Category'} width="400px">
                <form onSubmit={saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="input-group">
                        <label>Name</label>
                        <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {catForm._id ? 'Update Category' : 'Save Category'}
                        </button>
                        {catForm._id && (
                            <button type="button" onClick={handleDeleteCategory} className="btn btn-ghost" style={{ color: 'var(--danger)' }}>
                                🗑️ Delete
                            </button>
                        )}
                    </div>
                </form>
            </Modal>
        </div>
    );
}
