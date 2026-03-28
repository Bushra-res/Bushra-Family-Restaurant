'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
    const [config, setConfig] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((title, message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({
                title,
                message,
                confirmText: options.confirmText || 'Yes, Proceed',
                cancelText: options.cancelText || 'Cancel',
                type: options.type || 'warning',
            });
        });
    }, []);

    const handleConfirm = () => {
        setConfig(null);
        if (resolveRef.current) resolveRef.current(true);
    };

    const handleCancel = () => {
        setConfig(null);
        if (resolveRef.current) resolveRef.current(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog 
                isOpen={!!config}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                {...config}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be inside ConfirmProvider');
    return context;
}
