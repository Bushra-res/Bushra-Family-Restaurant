'use client';

export default function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    cancelText, 
    type = 'warning' 
}) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return '🔴';
            case 'success': return '✅';
            case 'info': return 'ℹ️';
            default: return '⚠️';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal-content glass animate-scaleIn" 
                onClick={e => e.stopPropagation()} 
                style={{ maxWidth: '400px', textAlign: 'center', padding: 'var(--space-2xl)' }}>
                
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>
                    {getIcon()}
                </div>
                
                <h2 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.5 }}>
                    {message}
                </p>
                
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                        {cancelText}
                    </button>
                    <button 
                        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
                        onClick={onConfirm} 
                        style={{ 
                            flex: 1,
                            background: type === 'danger' ? 'var(--danger)' : 'var(--gradient-primary)',
                            borderColor: 'transparent'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .animate-scaleIn {
                    animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
