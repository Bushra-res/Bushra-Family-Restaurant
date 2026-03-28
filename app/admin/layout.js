'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session && session.user.role !== 'admin') router.push('/');
    }, [session, status, router]);

    if (status === 'loading') return <LoadingAnimation fullScreen={true} />;

    return (
        <div className={`dashboard-layout ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Mobile Header */}
            <header className="mobile-header" style={{
                display: 'none',
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: 60,
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--border)',
                zIndex: 80,
                padding: '0 var(--space-md)',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="btn btn-icon"
                    style={{ background: 'transparent', border: 'none', fontSize: 24 }}
                >
                    ☰
                </button>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-sm)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    BUSHRA ADMIN
                </div>
                <div style={{ width: 40 }} />
            </header>

            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={() => setIsSidebarOpen(false)} 
            />

            <main className="dashboard-content">
                <style jsx global>{`
                    @media (max-width: 992px) {
                        .mobile-header { display: flex !important; }
                        .dashboard-content { padding-top: 80px !important; }
                    }
                `}</style>
                {children}
            </main>
        </div>
    );
}
