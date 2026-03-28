'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { formatDate } from '@/lib/utils';

export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'cashier' });

    useEffect(() => {
        fetch('/api/staff').then(r => r.json()).then(data => { setStaff(data || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            addToast('Staff added', 'success');
            setShowModal(false); setForm({ name: '', email: '', password: '', phone: '', role: 'cashier' });
            const updated = await fetch('/api/staff').then(r => r.json());
            setStaff(updated || []);
        } catch (err) { addToast(err.message, 'error'); }
    };

    const toggleActive = async (s) => {
        await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s._id, isActive: !s.isActive }) });
        const updated = await fetch('/api/staff').then(r => r.json());
        setStaff(updated || []);
        addToast(s.isActive ? 'Deactivated' : 'Activated', 'success');
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div><h1>Staff Management</h1><p className="subtitle">{staff.length} staff members</p></div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Staff</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                        {staff.map(s => (
                            <tr key={s._id}>
                                <td style={{ fontWeight: 600 }}>{s.name}</td>
                                <td style={{ fontSize: 'var(--font-xs)' }}>{s.email}</td>
                                <td>{s.phone || '-'}</td>
                                <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{s.role}</span></td>
                                <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td style={{ fontSize: 'var(--font-xs)' }}>{formatDate(s.createdAt)}</td>
                                <td>
                                    <button onClick={() => toggleActive(s)} className={`btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-success'}`}>
                                        {s.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff Member" width="450px">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="input-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="input-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="input-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
                    <div className="input-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="input-group"><label>Role</label>
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="cashier">Cashier</option>
                            <option value="delivery">Delivery Partner</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Add Staff</button>
                </form>
            </Modal>
        </div>
    );
}
