'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push('/login?registered=true');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', padding: 'var(--space-md)',
        }}>
            <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.4s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' }}>
                        <Image src="/images/logo.png" alt="BUSHRA Logo" width={72} height={72} style={{ objectFit: 'contain' }} />
                    </div>
                    <h1 style={{
                        fontSize: 'var(--font-3xl)', fontWeight: 800,
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginTop: 'var(--space-sm)',
                    }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                        Join BUSHRA Family Restaurant to order food online
                    </p>
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {error && (
                            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter your name" required />
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="Enter your email" required />
                        </div>

                        <div className="input-group">
                            <label>Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="Enter your phone number" />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="Create a password" required minLength={6} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
                            style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ fontWeight: 600 }}>Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
