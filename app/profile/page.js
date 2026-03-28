'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [loyalty, setLoyalty] = useState(0);
    const { addToast } = useToast();

    useEffect(() => {
        if (session?.user?.id) {
            fetch(`/api/customers?id=${session.user.id}`)
                .then(r => r.json())
                .then(data => {
                    if (data.customer) {
                        setForm({
                            name: data.customer.name || '',
                            email: data.customer.email || '',
                            phone: data.customer.phone || '',
                        });
                        setLoyalty(data.customer.loyaltyPoints || 0);
                    }
                }).catch(() => { });
        }
    }, [session]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: session.user.id, ...form }),
            });
            addToast('Profile updated!', 'success');
        } catch (err) {
            addToast('Failed to update profile', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="customer-layout">
            <Navbar />
            <div className="page-container" style={{ maxWidth: 600 }}>
                <div className="page-header">
                    <div>
                        <h1>My Profile</h1>
                        <p className="subtitle">Manage your account</p>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 800, color: 'white',
                        margin: '0 auto var(--space-md)',
                    }}>
                        {form.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 style={{ fontWeight: 700 }}>{form.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{form.email}</p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)',
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                        padding: '8px 16px', borderRadius: 'var(--radius-full)',
                        marginTop: 'var(--space-md)',
                    }}>
                        <span>🏆</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{loyalty} Loyalty Points</span>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Edit Profile</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" value={form.email} disabled style={{ opacity: 0.6 }} />
                        </div>
                        <div className="input-group">
                            <label>Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="Enter phone number" />
                        </div>
                        <button onClick={handleSave} className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
