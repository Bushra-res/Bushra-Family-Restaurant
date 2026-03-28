'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/utils';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: 0, usageLimit: 100, expiresAt: '' });

    const fetchData = () => {
        fetch('/api/coupons').then(r => r.json()).then(data => { setCoupons(data || []); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: parseFloat(form.value) }) });
            addToast('Coupon created', 'success');
            setShowModal(false); setForm({ code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: 0, usageLimit: 100, expiresAt: '' });
            fetchData();
        } catch { addToast('Error', 'error'); }
    };

    const toggleActive = async (c) => {
        await fetch('/api/coupons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c._id, isActive: !c.isActive }) });
        fetchData();
    };

    const deleteCoupon = async (id) => {
        if (!confirm('Delete coupon?')) return;
        await fetch('/api/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        addToast('Deleted', 'success'); fetchData();
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div><h1>Coupons</h1><p className="subtitle">{coupons.length} discount codes</p></div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Create Coupon</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                {coupons.map(c => (
                    <div key={c._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontWeight: 800, fontSize: 'var(--font-lg)', color: 'var(--accent-primary)', letterSpacing: 1 }}>{c.code}</span>
                            <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
                            {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                            {c.minOrderAmount > 0 && <div>Min order: ₹{c.minOrderAmount}</div>}
                            {c.maxDiscount > 0 && c.type === 'percentage' && <div>Max discount: ₹{c.maxDiscount}</div>}
                            <div>Used: {c.usedCount}/{c.usageLimit}</div>
                            {c.expiresAt && <div>Expires: {formatDate(c.expiresAt)}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                            <button onClick={() => toggleActive(c)} className={`btn btn-sm ${c.isActive ? 'btn-secondary' : 'btn-success'}`}>
                                {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteCoupon(c._id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Coupon" width="450px">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="input-group"><label>Code</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. SAVE20" /></div>
                    <div className="grid grid-2">
                        <div className="input-group"><label>Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        <div className="input-group"><label>Value</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required min="0" /></div>
                    </div>
                    <div className="grid grid-2">
                        <div className="input-group"><label>Min Order (₹)</label><input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} min="0" /></div>
                        <div className="input-group"><label>Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} min="0" /></div>
                    </div>
                    <div className="grid grid-2">
                        <div className="input-group"><label>Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} min="1" /></div>
                        <div className="input-group"><label>Expiry Date</label><input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></div>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Coupon</button>
                </form>
            </Modal>
        </div>
    );
}
