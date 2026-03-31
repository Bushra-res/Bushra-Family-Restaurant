'use client';
import { useState, useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        restaurantName: '',
        tagline: '',
        phone: '',
        address: '',
        billHeader: '',
        billFooter: '',
        logoUrl: '',
        taxPercentage: 5,
        currency: '₹',
        gstin: '',
        fssaiNo: '',
        sacCode: '996331',
        gstEnabled: true,
        cgstRate: 2.5,
        sgstRate: 2.5,
        billShowLogo: true,
        billShowGST: true,
        billShowFSSAI: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('branding');
    const { addToast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data) setSettings(prev => ({ ...prev, ...data }));
            } catch (err) {
                addToast('Failed to load settings', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Auto-sync tax percentage from GST rates
            const updatedSettings = { ...settings };
            if (updatedSettings.gstEnabled) {
                updatedSettings.taxPercentage = updatedSettings.cgstRate + updatedSettings.sgstRate;
            }

            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });
            if (res.ok) {
                const updated = await res.json();
                setSettings(prev => ({ ...prev, ...updated }));
                addToast('Settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            setSettings({ ...settings, logoUrl: reader.result });
            addToast('Logo attached! Save to finalize.', 'info');
        };
    };

    if (loading) return <LoadingAnimation />;

    const tabs = [
        { id: 'branding', label: '🏢 Branding', icon: '🏢' },
        { id: 'gst', label: '🧾 GST & Tax', icon: '🧾' },
        { id: 'bill', label: '🖨️ Bill Settings', icon: '🖨️' },
    ];

    const inputStyle = {
        width: '100%', padding: '10px 14px', fontSize: 'var(--font-sm)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-input)', color: 'var(--text-primary)',
        transition: 'border-color 0.2s',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase',
        letterSpacing: '0.5px',
    };

    const toggleStyle = (active) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--success-bg)' : 'var(--bg-input)',
        border: `1px solid ${active ? 'var(--success)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'var(--transition-fast)',
    });

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>System Settings</h1>
                    <p className="subtitle">Configure restaurant branding, GST compliance, and bill layout</p>
                </div>
                <button onClick={handleSubmit} disabled={saving} className="btn btn-primary btn-lg"
                    style={{ minWidth: 180 }}>
                    {saving ? '⏳ Saving...' : '💾 Save All Settings'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '4px', padding: '4px',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
            }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '10px 16px', border: 'none', borderRadius: 'var(--radius-sm)',
                            fontWeight: 600, fontSize: 'var(--font-sm)', cursor: 'pointer',
                            background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                            transition: 'var(--transition-fast)',
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* ===== BRANDING TAB ===== */}
                {activeTab === 'branding' && (
                    <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                🏢 Restaurant Identity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={labelStyle}>Restaurant Name</label>
                                    <input style={inputStyle} value={settings.restaurantName}
                                        onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
                                        placeholder="BUSHRA FAMILY RESTAURANT" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tagline / Certification</label>
                                    <input style={inputStyle} value={settings.tagline}
                                        onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                                        placeholder="⭐ Halal Certified | Premium Dining ⭐" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Numbers</label>
                                    <input style={inputStyle} value={settings.phone}
                                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="8838993915, 9361066673" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Full Address</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                                        value={settings.address}
                                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                                        placeholder="496/2 Bangalore Main Road..." />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                🖼️ Logo & Appearance
                            </h3>
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: 'var(--space-md)', padding: 'var(--space-lg)',
                                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                                border: '2px dashed var(--border)',
                            }}>
                                {settings.logoUrl ? (
                                    <div style={{
                                        width: 120, height: 120, borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--border)', overflow: 'hidden',
                                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: 'var(--shadow-md)',
                                    }}>
                                        <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: 120, height: 120, borderRadius: 'var(--radius-lg)',
                                        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 48, color: 'var(--text-muted)',
                                    }}>📷</div>
                                )}
                                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} id="logo-upload" />
                                <label htmlFor="logo-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                    {settings.logoUrl ? '🔄 Change Logo' : '📤 Upload Logo'}
                                </label>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    PNG with transparent background recommended<br />Max 2MB
                                </p>
                            </div>

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <label style={labelStyle}>Currency Symbol</label>
                                <input style={{ ...inputStyle, maxWidth: 80, textAlign: 'center', fontWeight: 700 }}
                                    value={settings.currency}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== GST & TAX TAB ===== */}
                {activeTab === 'gst' && (
                    <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                🧾 GST Configuration
                            </h3>

                            {/* GST Enable Toggle */}
                            <div style={{ ...toggleStyle(settings.gstEnabled), marginBottom: 'var(--space-md)' }}
                                onClick={() => setSettings({ ...settings, gstEnabled: !settings.gstEnabled })}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>GST Enabled</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {settings.gstEnabled ? 'CGST + SGST will be applied on bills' : 'Single tax percentage used'}
                                    </div>
                                </div>
                                <div style={{
                                    width: 44, height: 24, borderRadius: 12,
                                    background: settings.gstEnabled ? 'var(--success)' : 'var(--border)',
                                    position: 'relative', transition: 'background 0.2s',
                                }}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: 2,
                                        left: settings.gstEnabled ? 22 : 2,
                                        transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={labelStyle}>GSTIN Number</label>
                                    <input style={inputStyle} value={settings.gstin || ''}
                                        onChange={e => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                                        placeholder="e.g. 33AABCU9603R1ZM" maxLength={15} />
                                </div>
                                <div>
                                    <label style={labelStyle}>FSSAI License No.</label>
                                    <input style={inputStyle} value={settings.fssaiNo || ''}
                                        onChange={e => setSettings({ ...settings, fssaiNo: e.target.value })}
                                        placeholder="14 digit FSSAI number" maxLength={14} />
                                </div>
                                <div>
                                    <label style={labelStyle}>SAC Code (Service Accounting)</label>
                                    <input style={inputStyle} value={settings.sacCode || ''}
                                        onChange={e => setSettings({ ...settings, sacCode: e.target.value })}
                                        placeholder="996331" />
                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
                                        996331 = Restaurant services
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                💰 Tax Rates
                            </h3>

                            {settings.gstEnabled ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)',
                                    }}>
                                        <div>
                                            <label style={labelStyle}>CGST Rate (%)</label>
                                            <input type="number" step="0.5" style={{ ...inputStyle, fontWeight: 700, fontSize: 'var(--font-lg)', textAlign: 'center' }}
                                                value={settings.cgstRate}
                                                onChange={e => setSettings({ ...settings, cgstRate: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>SGST Rate (%)</label>
                                            <input type="number" step="0.5" style={{ ...inputStyle, fontWeight: 700, fontSize: 'var(--font-lg)', textAlign: 'center' }}
                                                value={settings.sgstRate}
                                                onChange={e => setSettings({ ...settings, sgstRate: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    </div>

                                    {/* Total Tax Preview */}
                                    <div style={{
                                        padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL GST ON BILL</div>
                                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--accent-primary)' }}>
                                            {(settings.cgstRate + settings.sgstRate).toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                            CGST {settings.cgstRate}% + SGST {settings.sgstRate}%
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        💡 For restaurants with turnover under ₹1.5 Cr, standard rate is <strong>CGST 2.5% + SGST 2.5% = 5%</strong>.
                                        For AC/licensed restaurants, it's <strong>CGST 9% + SGST 9% = 18%</strong>.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label style={labelStyle}>Flat Tax Percentage (%)</label>
                                    <input type="number" step="0.5" style={{ ...inputStyle, fontWeight: 700, fontSize: 'var(--font-xl)', textAlign: 'center' }}
                                        value={settings.taxPercentage}
                                        onChange={e => setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })} />
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
                                        This flat rate will be applied as a single line item on the bill.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== BILL SETTINGS TAB ===== */}
                {activeTab === 'bill' && (
                    <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                🖨️ Receipt Content
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={labelStyle}>Bill Header (Below Address)</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                                        value={settings.billHeader}
                                        onChange={e => setSettings({ ...settings, billHeader: e.target.value })}
                                        placeholder="Additional info like FSSAI, delivery info..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bill Footer (Thank You Message)</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                                        value={settings.billFooter}
                                        onChange={e => setSettings({ ...settings, billFooter: e.target.value })}
                                        placeholder="🎉 THANK YOU! VISIT AGAIN ❤️" />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                ⚙️ Bill Display Options
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {/* Show Logo Toggle */}
                                <div style={toggleStyle(settings.billShowLogo)}
                                    onClick={() => setSettings({ ...settings, billShowLogo: !settings.billShowLogo })}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Show Logo on Bill</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Print restaurant logo at top of receipt</div>
                                    </div>
                                    <div style={{
                                        width: 44, height: 24, borderRadius: 12,
                                        background: settings.billShowLogo ? 'var(--success)' : 'var(--border)',
                                        position: 'relative', transition: 'background 0.2s',
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: 2,
                                            left: settings.billShowLogo ? 22 : 2,
                                            transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)'
                                        }} />
                                    </div>
                                </div>

                                {/* Show GST Toggle */}
                                <div style={toggleStyle(settings.billShowGST)}
                                    onClick={() => setSettings({ ...settings, billShowGST: !settings.billShowGST })}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Show GST Breakdown</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Display CGST/SGST split on printed bill</div>
                                    </div>
                                    <div style={{
                                        width: 44, height: 24, borderRadius: 12,
                                        background: settings.billShowGST ? 'var(--success)' : 'var(--border)',
                                        position: 'relative', transition: 'background 0.2s',
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: 2,
                                            left: settings.billShowGST ? 22 : 2,
                                            transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)'
                                        }} />
                                    </div>
                                </div>

                                {/* Show FSSAI Toggle */}
                                <div style={toggleStyle(settings.billShowFSSAI)}
                                    onClick={() => setSettings({ ...settings, billShowFSSAI: !settings.billShowFSSAI })}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Show FSSAI Number</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Print FSSAI license on receipt</div>
                                    </div>
                                    <div style={{
                                        width: 44, height: 24, borderRadius: 12,
                                        background: settings.billShowFSSAI ? 'var(--success)' : 'var(--border)',
                                        position: 'relative', transition: 'background 0.2s',
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: 2,
                                            left: settings.billShowFSSAI ? 22 : 2,
                                            transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Bill Preview Mini */}
                            <div style={{
                                marginTop: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)',
                                background: 'white', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)', fontFamily: 'monospace',
                                fontSize: '11px', color: '#000', textAlign: 'center',
                                lineHeight: 1.6, boxShadow: 'var(--shadow-sm)',
                                maxWidth: '300px', margin: 'var(--space-lg) auto 0'
                            }}>
                                <div style={{ fontWeight: 800, fontSize: '12px', marginBottom: 5 }}>── RECEIPT PREVIEW ──</div>
                                {settings.billShowLogo && <div style={{ fontSize: '20px', marginBottom: 5 }}>🍽️</div>}
                                <div style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{settings.restaurantName || 'BUSHRA RESTAURANT'}</div>
                                <div style={{ fontSize: '10px' }}>{settings.tagline || 'Premium Family Restaurant'}</div>
                                <div style={{ borderTop: '1px dashed #444', margin: '8px 0' }}></div>
                                <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Item x1</span><span>₹150.00</span>
                                </div>
                                <div style={{ borderTop: '1px dashed #444', margin: '8px 0' }}></div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Subtotal</span><span>₹150.00</span>
                                    </div>
                                    {settings.billShowGST && settings.gstEnabled && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#555' }}>
                                            <span>GST ({settings.cgstRate + settings.sgstRate}%)</span>
                                            <span>₹{(150 * (settings.cgstRate + settings.sgstRate) / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px' }}>
                                    <span>TOTAL</span>
                                    <span>₹{(150 + (settings.billShowGST && settings.gstEnabled ? (150 * (settings.cgstRate + settings.sgstRate) / 100) : 0)).toFixed(2)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>
                                {settings.billShowGST && <div style={{ fontSize: '9px' }}>GSTIN: {settings.gstin || 'XXXXXXXXXXXXXXX'}</div>}
                                {settings.billShowFSSAI && <div style={{ fontSize: '9px' }}>FSSAI: {settings.fssaiNo || 'XXXXXXXXXXXXXX'}</div>}
                                <div style={{ marginTop: 10, fontStyle: 'italic' }}>{settings.billFooter || 'Thank You! Visit Again'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Save Button for Mobile */}
                <div style={{
                    position: 'fixed', bottom: 'var(--space-lg)', right: 'var(--space-lg)',
                    zIndex: 50,
                }}>
                    <button type="submit" disabled={saving} className="btn btn-primary btn-lg"
                        style={{
                            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)', borderRadius: 'var(--radius-full)',
                            padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                        {saving ? '⏳' : '💾'} {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}
