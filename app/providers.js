'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/components/Toast';

import { ConfirmProvider } from '@/contexts/ConfirmContext';

export function Providers({ children }) {
    return (
        <SessionProvider>
            <CartProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        {children}
                    </ConfirmProvider>
                </ToastProvider>
            </CartProvider>
        </SessionProvider>
    );
}
