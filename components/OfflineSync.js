'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/offline-db';
import { useToast } from '@/components/Toast';

export default function OfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        // Initial online check
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            addToast('Back online! Syncing orders...', 'success');
            syncOfflineOrders();
        };

        const handleOffline = () => {
            setIsOnline(false);
            addToast('You are offline. Orders will be saved locally.', 'warning');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Run sync on mount if online
        if (navigator.onLine) syncOfflineOrders();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncOfflineOrders = async () => {
        if (isSyncing) return;
        
        try {
            const offlineOrders = await db.offlineOrders.where('synced').equals(0).toArray();
            if (offlineOrders.length === 0) return;

            setIsSyncing(true);
            console.log(`Syncing ${offlineOrders.length} offline orders...`);

            for (const order of offlineOrders) {
                try {
                    // Remove local ID and sync flag before sending
                    const { id, synced, ...orderData } = order;
                    const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (res.ok) {
                        // Mark as synced locally
                        await db.offlineOrders.update(id, { synced: 1 });
                    }
                } catch (err) {
                    console.error('Failed to sync individual order:', err);
                }
            }

            // Cleanup synced orders
            await db.offlineOrders.where('synced').equals(1).delete();
            addToast('Offline synchronization complete!', 'success');
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 'var(--space-md)',
            left: 'var(--space-md)',
            zIndex: 1000,
            display: isOnline ? 'none' : 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            background: 'var(--bg-glass-dark)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            color: '#ef4444',
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            boxShadow: 'var(--shadow-lg)'
        }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
            OFFLINE MODE - LOCAL SAVE ACTIVE
        </div>
    );
}
