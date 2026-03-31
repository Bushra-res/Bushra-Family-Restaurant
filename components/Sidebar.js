'use client';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    
    // Support offline session display
    const offlineSessionStr = typeof window !== 'undefined' ? localStorage.getItem('offline_session') : null;
    const offlineSession = offlineSessionStr ? JSON.parse(offlineSessionStr) : null;
    const isOfflineActive = !session && offlineSession && new Date(offlineSession.expires) > new Date();
    
    const user = session?.user || (isOfflineActive ? offlineSession : null);
    const role = user?.role;

    // Auto-close on mobile when path changes
    useEffect(() => {
        if (onClose) onClose();
    }, [pathname]);

    const menuGroups = [
        {
            title: 'Operations',
            links: [
                { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
                { href: '/admin/pos', label: 'POS Terminal', icon: '🖥️' },
            ]
        },
        {
            title: 'Menu & Inventory',
            links: [
                { href: '/admin/menu', label: 'Menu Management', icon: '🍽️' },
                { href: '/admin/categories', label: 'Categories', icon: '📂' },
                { href: '/admin/inventory', label: 'Inventory', icon: '📦' },
                { href: '/admin/tables', label: 'Tables', icon: '🪑' },
            ]
        },
        {
            title: 'Administration',
            links: [
                { href: '/admin/customers', label: 'Customers', icon: '👥' },
                { href: '/admin/coupons', label: 'Coupons', icon: '🎫' },
            ]
        },
        {
            title: 'Accounts & System',
            links: [
                { href: '/admin/expenses', label: 'Expenses', icon: '💸' },
                { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
            ]
        }
    ];

    const deliveryLinks = [
        { title: 'Delivery', links: [{ href: '/delivery', label: 'My Deliveries', icon: '🚗' }] },
    ];

    const activeGroups = role === 'admin' ? menuGroups : deliveryLinks;
    const title = role === 'admin' ? 'Admin Panel' : 'Delivery';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#1e293b', /* Slate-800: Premium Dark UI */
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            zOrder: 100,
            overflowY: 'auto',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
        }}>
            <style jsx>{`
                @media (max-width: 992px) {
                    aside {
                        transform: translateX(${isOpen ? '0' : '-100%'});
                        box-shadow: ${isOpen ? 'var(--shadow-lg)' : 'none'};
                    }
                }
                .nav-group-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255, 255, 255, 0.4);
                    margin: var(--space-lg) 0 var(--space-xs) var(--space-sm);
                    font-weight: 800;
                }
            `}</style>
            <div style={{
                padding: 'var(--space-xl) var(--space-lg)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.2)'
            }}>
                <Link href="/" onClick={() => { if (window.innerWidth <= 992 && onClose) onClose(); }} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 0 12px rgba(249, 115, 22, 0.2)',
                        }}>
                            <Image
                                src="/images/logo.png"
                                alt="BUSHRA Logo"
                                width={40}
                                height={40}
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'var(--font-lg)',
                                fontWeight: 900,
                                background: 'white',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'white',
                                lineHeight: 1,
                                letterSpacing: '0.5px'
                            }}>BUSHRA<br /><span style={{ fontSize: 'var(--font-xs)', color: 'rgba(255,255,255,0.6)', WebkitTextFillColor: 'rgba(255,255,255,0.6)' }}>Family Restaurant</span></div>
                        </div>
                    </div>
                </Link>
                <button onClick={onClose} className="mobile-only btn btn-icon" style={{ display: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>✕</button>
            </div>

            <style jsx>{`
                @media (max-width: 992px) {
                    .mobile-only { display: flex !important; }
                }
            `}</style>

            <nav style={{ padding: 'var(--space-md) var(--space-md)', flex: 1 }}>
                {activeGroups.map((group, gIdx) => (
                    <div key={gIdx} style={{ marginBottom: 'var(--space-md)' }}>
                        <div className="nav-group-title">{group.title}</div>
                        {group.links.map(link => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    onClick={() => {
                                        if (typeof window !== 'undefined' && window.innerWidth <= 992 && onClose) onClose();
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: '6px',
                                        fontSize: 'var(--font-sm)',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                        background: isActive ? 'var(--gradient-primary)' : 'transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        textDecoration: 'none',
                                        boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                                    }}>
                                    <span style={{ fontSize: '20px', filter: isActive ? 'none' : 'grayscale(1) opacity(0.7)' }}>{link.icon}</span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div style={{
                padding: 'var(--space-lg)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 'var(--font-md)',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
                    }}>
                        {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'white' }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{role} {isOfflineActive ? '(Offline)' : ''}</div>
                    </div>
                </div>
                <button onClick={() => {
                    localStorage.removeItem('offline_session');
                    signOut({ callbackUrl: '/login' });
                }} className="btn" style={{ 
                    width: '100%', 
                    borderRadius: 'var(--radius-full)', 
                    fontWeight: 800, 
                    gap: 'var(--space-sm)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                }}>
                    🛑 Logout
                </button>
            </div>
        </aside>
    );
}
