'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-card glass animate-slideIn ${toast.type}`}>
                        <div className="toast-icon">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .toast-container {
                    position: fixed;
                    bottom: var(--space-xl);
                    right: var(--space-xl);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                    z-index: 10000;
                    pointer-events: none;
                }
                .toast-card {
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: 12px 20px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                    min-width: 280px;
                    box-shadow: var(--shadow-lg);
                }
                .toast-icon {
                    font-size: 20px;
                }
                .toast-message {
                    font-size: var(--font-sm);
                    font-weight: 500;
                    color: var(--text-primary);
                }
                .toast-card.success { border-left: 4px solid var(--success); }
                .toast-card.error { border-left: 4px solid var(--danger); }
                .toast-card.warning { border-left: 4px solid var(--warning); }
                
                .animate-slideIn {
                    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be inside ToastProvider');
    return context;
}
