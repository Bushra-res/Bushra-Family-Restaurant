export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getStatusColor(status) {
    const colors = {
        placed: '#f59e0b',
        preparing: '#3b82f6',
        ready: '#8b5cf6',
        out_for_delivery: '#f97316',
        delivered: '#10b981',
        cancelled: '#ef4444',
        available: '#10b981',
        occupied: '#ef4444',
        reserved: '#f59e0b',
    };
    return colors[status] || '#6b7280';
}

export function generateOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function calculateTax(subtotal, taxRate = 5) {
    return (subtotal * taxRate) / 100;
}
