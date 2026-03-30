'use client';
import { useState, useEffect } from 'react';
import { SkeletonInput } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        restaurantName: '',
        billHeader: '',
        billFooter: '',
        taxPercentage: 0,
        gstin: '',
        phone: '',
        logoUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                addToast('Settings saved successfully', 'success');
            } else {
                let errorMsg = 'Failed to save settings';
                try {
                    const err = await res.json();
                    errorMsg = err.error || errorMsg;
                } catch (e) {
                    if (res.status === 413) errorMsg = 'Image/Logo is too large! Please use a smaller file.';
                }
                addToast(errorMsg, 'error');
            }
        } catch (error) {
            addToast('Network error or server timeout', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p className="subtitle">Configure restaurant branding and bill design</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <Link href="/admin/users" className="btn btn-secondary">
                        👥 User Management
                    </Link>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
                {/* Branding Section */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🏨 Restaurant Identity
                    </h3>
                    <form onSubmit={handleSave} className="flex-col gap-md">
                        <div className="input-group">
                            <label>Logo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 'var(--radius-sm)', background: 'white', padding: 5 }} />}
                                <input type="file" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 2 * 1024 * 1024) return addToast('Image too large! Maximum 2MB.', 'error');
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = () => {
                                            const img = new Image();
                                            img.src = reader.result;
                                            img.onload = () => {
                                                const canvas = document.createElement('canvas');
                                                const MAX_WIDTH = 400;
                                                const scale = MAX_WIDTH / img.width;
                                                canvas.width = MAX_WIDTH;
                                                canvas.height = img.height * scale;
                                                const ctx = canvas.getContext('2d');
                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                                                setSettings({ ...settings, logoUrl: compressed });
                                                addToast('Logo attached and optimized!', 'success');
                                            };
                                        };
                                    }
                                }} style={{ flex: 1, fontSize: 'var(--font-xs)' }} />
                            </div>
                        </div>

                        {loading ? (
                            <>
                                <SkeletonInput />
                                <SkeletonInput />
                                <div className="grid grid-2"><SkeletonInput /><SkeletonInput /></div>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label>Restaurant Name</label>
                                    <input 
                                        value={settings.restaurantName}
                                        onChange={e => setSettings({...settings, restaurantName: e.target.value})}
                                        placeholder="Enter restaurant name..."
                                    />
                                </div>
                                <div className="grid grid-2">
                                     <div className="input-group">
                                        <label>Phone Number</label>
                                        <input 
                                            value={settings.phone}
                                            onChange={e => setSettings({...settings, phone: e.target.value})}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>GSTIN</label>
                                        <input 
                                            value={settings.gstin}
                                            onChange={e => setSettings({...settings, gstin: e.target.value})}
                                            placeholder="27AA..."
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Tax Percentage (%)</label>
                                    <input 
                                        type="number"
                                        value={settings.taxPercentage}
                                        onChange={e => setSettings({...settings, taxPercentage: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                            </>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
                            {saving ? 'Saving...' : 'Save Branding'}
                        </button>
                    </form>
                </div>

                {/* Bill Design Section */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📜 Receipt Details
                    </h3>
                    <form onSubmit={handleSave} className="flex-col gap-md">
                        {loading ? (
                            <>
                                <SkeletonInput />
                                <SkeletonInput />
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label>Bill Header Text</label>
                                    <textarea 
                                        value={settings.billHeader}
                                        onChange={e => setSettings({...settings, billHeader: e.target.value})}
                                        placeholder="Enter address and Halal info..."
                                        style={{ minHeight: 120, fontSize: 'var(--font-xs)', lineHeight: '1.4' }}
                                    />
                                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>This appears at the top under the restaurant name.</p>
                                </div>
                                <div className="input-group">
                                    <label>Bill Footer Text</label>
                                    <textarea 
                                        value={settings.billFooter}
                                        onChange={e => setSettings({...settings, billFooter: e.target.value})}
                                        placeholder="Enter thank you message..."
                                        style={{ minHeight: 80, fontSize: 'var(--font-xs)', lineHeight: '1.4' }}
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="info-box" style={{ background: 'rgba(249, 115, 22, 0.05)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(249, 115, 22, 0.1)' }}>
                            <p style={{ fontSize: 'var(--font-xs)', margin: 0, color: 'var(--accent-primary)' }}>
                                💡 <strong>Note:</strong> Parcel and Packaging prices have been moved to the <Link href="/admin/inventory" style={{ textDecoration: 'underline', fontWeight: 700 }}>Inventory Page</Link>.
                            </p>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
                            {saving ? 'Saving...' : 'Save Bill Design'}
                        </button>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .flex-col { display: flex; flexDirection: column; }
                .gap-md { gap: var(--space-md); }
                .mt-md { margin-top: var(--space-md); }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
                @media (max-width: 768px) {
                    .grid-2 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
