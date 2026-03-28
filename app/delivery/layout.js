'use client';
import LoadingAnimation from '@/components/LoadingAnimation';
import Sidebar from '@/components/Sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeliveryLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session && !['delivery', 'admin'].includes(session.user.role)) router.push('/');
    }, [session, status, router]);

    if (status === 'loading') return <LoadingAnimation fullScreen={true} />;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
}
