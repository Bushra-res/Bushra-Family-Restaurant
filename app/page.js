'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/login');
    }, [router]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            gap: 'var(--space-md)',
        }}>
            <div style={{
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
            }}>
                <Image
                    src="/images/logo.png"
                    alt="BUSHRA Family Restaurant"
                    width={72}
                    height={72}
                    style={{ objectFit: 'contain' }}
                    priority
                />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
    );
}
