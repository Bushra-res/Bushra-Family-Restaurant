'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

export default function TablesPage() {
    const [tables, setTables] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [form, setForm] = useState({ number: '', capacity: 4 });

    const fetchData = () => {
        fetch('/api/tables').then(r => r.json()).then(data => { setTables(data || []); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const addTable = async (e) => {
        e.preventDefault();
        await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, number: parseInt(form.number) }) });
        addToast('Table added', 'success'); setShowModal(false); setForm({ number: '', capacity: 4 }); fetchData();
    };

    const updateStatus = async (id, status) => {
        await fetch('/api/tables', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, currentOrder: null }) });
        fetchData();
    };

    const deleteTable = async (id) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/tables', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        addToast('Deleted', 'success'); fetchData();
    };

    const statusColors = { available: 'var(--success)', occupied: 'var(--danger)', reserved: 'var(--warning)' };
    if (loading) return <LoadingAnimation />;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div><h1>Tables</h1>
                    <p className="subtitle">{tables.filter(t => t.status === 'available').length} available • {tables.filter(t => t.status === 'occupied').length} occupied</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Table</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
                {tables.map(t => (
                    <div key={t._id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => deleteTable(t._id)} className="btn btn-ghost btn-sm"
                            style={{ position: 'absolute', top: 8, right: 8, color: 'var(--text-muted)', padding: 4 }}>✕</button>
                        <div style={{ fontSize: 36, marginBottom: 'var(--space-sm)' }}>🪑</div>
                        <h3 style={{ fontWeight: 800, fontSize: 'var(--font-xl)' }}>Table {t.number}</h3>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>Capacity: {t.capacity}</div>
                        <div style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-full)',
                            background: `${statusColors[t.status]}20`, color: statusColors[t.status],
                            fontWeight: 700, fontSize: 'var(--font-xs)', textTransform: 'capitalize', marginBottom: 'var(--space-md)',
                        }}>{t.status}</div>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center' }}>
                            {['available', 'occupied', 'reserved'].map(s => (
                                <button key={s} onClick={() => updateStatus(t._id, s)}
                                    className={`btn btn-sm ${t.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ fontSize: '10px', padding: '4px 8px', textTransform: 'capitalize' }}>
                                    {s.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Table" width="350px">
                <form onSubmit={addTable} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div className="input-group"><label>Table Number</label><input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required min="1" /></div>
                    <div className="input-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" /></div>
                    <button type="submit" className="btn btn-primary">Add Table</button>
                </form>
            </Modal>
        </div>
    );
}
