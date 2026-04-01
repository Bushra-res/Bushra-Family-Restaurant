'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import LoadingAnimation from '@/components/LoadingAnimation';
import Modal from '@/components/Modal';

export default function AdminBills() {
    const router = useRouter();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [modalState, setModalState] = useState('none'); // 'none', 'view'

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [ordersRes, settingsRes] = await Promise.all([
                    fetch('/api/orders').then(r => r.json()),
                    fetch('/api/settings').then(r => r.json()),
                ]);
                
                if (Array.isArray(ordersRes)) {
                    // sort by latest first
                    const sorted = ordersRes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrders(sorted);
                }
                
                if (settingsRes) {
                    const settingsData = Array.isArray(settingsRes) ? settingsRes[0] : settingsRes;
                    setSettings(settingsData);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const filteredOrders = useMemo(() => {
        if (!search) return orders;
        const lowerSearch = search.toLowerCase();
        return orders.filter(o => 
            (o.orderId && o.orderId.toLowerCase().includes(lowerSearch)) ||
            (o.customerPhone && o.customerPhone.includes(lowerSearch)) ||
            (o.customerName && o.customerName.toLowerCase().includes(lowerSearch))
        );
    }, [orders, search]);

    const handleCancelOrder = async (order) => {
        if (!window.confirm(`Are you sure you want to cancel bill ${order.orderId || order._id.substring(0,8).toUpperCase()}? This will permanently remove its total from sales dashboards.`)) return;
        
        try {
            const res = await fetch(`/api/orders/${order._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'cancelled' } : o));
                addToast('Bill cancelled successfully', 'success');
            } else {
                const data = await res.json();
                addToast(`Failed: ${data.error}`, 'error');
            }
        } catch (err) {
            addToast('Error cancelling bill', 'error');
        }
    };

    const printReceipt = (bill) => {
        if (!bill) return;
        const win = window.open('', '_blank');
        win.document.write(`
      <html><head><title>Receipt - ${bill.orderId}</title>
      <style>
        @page { margin: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        body { 
            font-family: 'Outfit', sans-serif; 
            width: 80mm; 
            margin: 0; 
            padding: 5mm; 
            color: #000;
            font-size: 10.5pt;
            line-height: 1.4;
            -webkit-font-smoothing: antialiased;
        }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        .extra-bold { font-weight: 800; }
        .line { border-top: 2px solid #000; margin: 3mm 0; }
        .dashed-line { border-top: 1.2px dashed #444; margin: 2.5mm 0; }
        .header { font-size: 16pt; margin-bottom: 1mm; letter-spacing: -0.5px; }
        .info { font-size: 9.5pt; color: #000; font-weight: 600; line-height: 1.2; }
        .table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 3mm; color: #000; }
        .table th { border-bottom: 2px solid #000; padding: 2.5mm 0; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.5px; }
        .table td { padding: 2.5mm 0; vertical-align: top; font-weight: 600; }
        .total-row { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11pt; margin-top: 2mm; color: #000; font-weight: 700; gap: 4mm; }
        .total-row span:first-child { flex: 1; }
        .total-row span:last-child { white-space: nowrap; text-align: right; }
        .qty { width: 15%; text-align: center !important; }
        .price { width: 22%; text-align: right !important; }
        .amt { width: 23%; text-align: right !important; }
        img { max-height: 75px; max-width: 180px; width: auto; margin-bottom: 4mm; filter: contrast(1.2) grayscale(1); object-fit: contain; }
      </style></head><body>
      <div class="center">
        ${settings?.logoUrl ? `<img src="${settings.logoUrl}">` : ''}
        <div class="header extra-bold" style="text-transform: uppercase;">${settings?.restaurantName || 'BUSHRA FAMILY RESTAURANT'}</div>
        <div class="info" style="margin-bottom: 2mm;">${settings?.tagline || '⭐ Halal Certified | Premium Dining ⭐'}</div>
        
        <div class="info" style="font-size: 8.5pt;">
            ${settings?.address ? `📍 ${settings.address.replace(/\n/g, '<br>')}` : '📍 496/2 Bangalore Main Road, SS Lodge Ground Floor, Chengam - 606 709'}
        </div>
        
        <div class="info" style="margin-top: 2mm; font-size: 9.5pt;">
            📞 ${settings?.phone || '8838993915 | 9361066673'}
        </div>
      </div>
      
      <div class="line"></div>
      <div style="display:flex; justify-content:space-between; font-size:9.5pt; margin-bottom: 1mm;" class="bold">
        <span>Date: ${new Date(bill.createdAt).toLocaleDateString()}</span>
        <span>Time: ${new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="font-size:10.5pt;" class="extra-bold">Bill No: ${bill.orderId || (bill._id ? bill._id.substring(0, 8).toUpperCase() : '')}</div>
      <div class="dashed-line"></div>
      
      <table class="table">
        <thead>
          <tr>
            <th style="width:40%">Item</th>
            <th class="qty">Qty</th>
            <th class="price">Rate</th>
            <th class="amt">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${(bill.items || []).map((i) => `
            <tr>
              <td style="width:40%">${i.name}</td>
              <td class="qty">${i.quantity}</td>
              <td class="price">${(i.price || 0).toFixed(0)}</td>
              <td class="amt extra-bold">${((i.price || 0) * i.quantity).toFixed(0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="dashed-line"></div>
      <div class="total-row"><span>Items Subtotal</span><span>₹ ${(bill.subtotal || 0).toFixed(2)}</span></div>
      ${bill.parcelOptions && bill.parcelOptions.charges > 0 ? `
        <div class="total-row">
            <span>Parcel Charges</span>
            <span>₹ ${bill.parcelOptions.charges.toFixed(2)}</span>
        </div>
      ` : ''}
      ${bill.tax > 0 ? `<div class="total-row"><span>GST</span><span>₹ ${bill.tax.toFixed(2)}</span></div>` : ''}
      ${bill.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-₹ ${bill.discount.toFixed(2)}</span></div>` : ''}
      
      <div class="line"></div>
      <div class="total-row extra-bold" style="font-size:14pt; padding-top:1mm">
        <span>TOTAL</span>
        <span>₹ ${(bill.total || 0).toFixed(0)}</span>
      </div>
      <div class="line"></div>
      
      <div class="center bold" style="font-size:10pt; margin-top:3mm; letter-spacing: 0.5px; line-height: 1.5;">
        ${settings?.billFooter?.replace(/\n/g, '<br>') || '🎉 THANK YOU FOR DINING WITH US! 🎉<br>❤️ We hope you enjoyed your meal'}
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
            setTimeout(() => { if(!window.closed) window.close(); }, 10000);
          }, 500);
        };
      </script>
      </body></html>
    `);
        win.document.close();
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="page-container animate-fadeIn">
            {/* Professional Header & Search Console */}
            <div className="page-header" style={{ alignItems: 'flex-end', marginBottom: 'var(--space-2xl)' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ marginBottom: 'var(--space-xs)' }}>Bills & Receipts</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                        Manage historical orders, reprint receipts, and track payment consistency.
                    </p>
                </div>
                
                <div className="search-bar" style={{ maxWidth: '380px' }}>
                    <span className="search-icon">🔍</span>
                    <input 
                        type="search" 
                        placeholder="Search Bill No, Phone or Name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Listing Console */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="table-responsive" style={{ border: 'none', margin: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: 'var(--space-lg)' }}>Date & Time</th>
                                <th>Reference</th>
                                <th>Customer Details</th>
                                <th>Summary</th>
                                <th>Total Payable</th>
                                <th>Payment Mode</th>
                                <th style={{ textAlign: 'right', paddingRight: 'var(--space-lg)' }}>Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center" style={{ padding: 'var(--space-2xl)' }}>
                                        <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No matching bills found</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>Try a different bill number or contact info</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order._id} style={{ transition: 'var(--transition)' }}>
                                        <td style={{ paddingLeft: 'var(--space-lg)', verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <span style={{ 
                                                background: 'rgba(15, 23, 42, 0.05)', 
                                                color: 'var(--text-primary)',
                                                padding: '4px 10px', 
                                                borderRadius: 'var(--radius-xs)', 
                                                fontSize: '11px',
                                                fontWeight: 800, 
                                                border: '1px solid var(--border)',
                                                fontFamily: 'monospace',
                                                letterSpacing: '0.5px'
                                            }}>
                                                #{order.orderId || (order._id ? order._id.substring(0,8).toUpperCase() : 'N/A')}
                                            </span>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {order.customerName}
                                            </div>
                                            {order.customerPhone && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ opacity: 0.7 }}>📞</span> {order.customerPhone}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div className="badge badge-info" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#2563eb' }}>
                                                {order.items?.length || 0} Products
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '15px' }}>
                                                ₹{(order.total || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            {order.status === 'cancelled' ? (
                                                <span className="badge badge-danger">CANCELLED</span>
                                            ) : (
                                                <span className={`badge ${
                                                    order.paymentMethod === 'cash' ? 'badge-success' : 
                                                    order.paymentMethod === 'upi' ? 'badge-purple' : 'badge-info'
                                                }`} style={{ 
                                                    minWidth: '60px', justifyContent: 'center', 
                                                    border: '1px solid currentColor', background: 'transparent' 
                                                }}>
                                                    {order.paymentMethod}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: 'var(--space-lg)', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                {order.status !== 'cancelled' && (
                                                    <>
                                                        <button 
                                                            className="btn-ghost" 
                                                            onClick={() => router.push(`/admin/pos?editOrder=${order._id}`)}
                                                            title="Modify Order"
                                                            style={{ padding: '6px', borderRadius: 'var(--radius-xs)', fontSize: '14px' }}>
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn-ghost" 
                                                            onClick={() => handleCancelOrder(order)}
                                                            title="Cancel Order"
                                                            style={{ color: 'var(--danger)', padding: '6px', borderRadius: 'var(--radius-xs)', fontSize: '14px' }}>
                                                            🚫
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    className="btn btn-sm btn-secondary" 
                                                    onClick={() => { setSelectedBill(order); setModalState('view'); }}
                                                    style={{ height: '32px', borderRadius: 'var(--radius-xs)' }}>
                                                    View
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-primary" 
                                                    onClick={() => printReceipt(order)}
                                                    style={{ height: '32px', borderRadius: 'var(--radius-xs)' }}>
                                                    Print
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Digital Invoice Modal */}
            <Modal 
                isOpen={modalState === 'view'} 
                onClose={() => { setModalState('none'); setSelectedBill(null); }}
                title="Invoice Summary"
                width="480px"
            >
                {selectedBill && (
                    <div className="animate-slideUp">
                        {/* Header Stats */}
                        <div style={{ 
                            background: 'var(--bg-primary)', 
                            padding: 'var(--space-lg)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: 'var(--space-lg)',
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)',
                            border: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: 4 }}>Bill Number</div>
                                <div style={{ fontWeight: 800, fontSize: 'var(--font-lg)', color: 'var(--text-primary)' }}>
                                    #{selectedBill.orderId || selectedBill._id.substring(0,8).toUpperCase()}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: 4 }}>Status</div>
                                <div style={{ fontWeight: 800, color: selectedBill.status === 'cancelled' ? 'var(--danger)' : 'var(--success)' }}>
                                    {selectedBill.status === 'cancelled' ? 'CANCELLED' : 'COMPLETED'}
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block', marginBottom: 'var(--space-sm)' }}>Digital Receipt For</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBill.customerName}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Date: {new Date(selectedBill.createdAt).toLocaleDateString()}</span>
                            </div>
                            {selectedBill.customerPhone && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginTop: 2 }}>{selectedBill.customerPhone}</div>}
                        </div>

                        {/* Order Lines */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                             <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>Item Specifications</div>
                             <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-sm)' }}>
                                {selectedBill.items?.map((item, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        padding: '10px 8px', 
                                        borderBottom: idx === selectedBill.items.length - 1 ? 'none' : '1px solid var(--border-light)',
                                        fontSize: 'var(--font-sm)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.quantity}x</span> {item.name}
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{((item.price || 0) * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Total Matrix */}
                        <div className="card" style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderStyle: 'dashed' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>₹{(selectedBill.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {selectedBill.parcelOptions?.charges > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Packaging Fee</span>
                                    <span style={{ fontWeight: 600 }}>₹{selectedBill.parcelOptions.charges.toFixed(2)}</span>
                                </div>
                            )}
                            {selectedBill.tax > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Service Tax (GST)</span>
                                    <span style={{ fontWeight: 600 }}>₹{selectedBill.tax.toFixed(2)}</span>
                                </div>
                            )}
                            {selectedBill.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--danger)' }}>
                                    <span style={{ fontWeight: 500 }}>Special Discount</span>
                                    <span style={{ fontWeight: 700 }}>-₹{selectedBill.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontWeight: 900, 
                                fontSize: 'var(--font-2xl)', 
                                color: 'var(--accent-primary)', 
                                marginTop: 'var(--space-sm)', 
                                paddingTop: 'var(--space-sm)', 
                                borderTop: '2px solid var(--border)' 
                            }}>
                                <span>TOTAL</span>
                                <span>₹{(selectedBill.total || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)' }}>
                            <button className="btn btn-secondary" onClick={() => setModalState('none')} style={{ flex: 1, height: '48px' }}>
                                Dismiss
                            </button>
                            <button className="btn btn-primary" onClick={() => printReceipt(selectedBill)} style={{ flex: 1.5, height: '48px' }}>
                                🖨️ Reprint Physical Bill
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
