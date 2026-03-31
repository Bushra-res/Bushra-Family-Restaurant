'use client';
import { memo } from 'react';
import Image from 'next/image';

const MenuItemCard = ({ item, inCart, onAdd }) => {
    return (
        <div onClick={() => onAdd(item)}
            className="menu-item-card premium-hover animate-fadeIn"
            style={{
                background: inCart ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
                border: `1px solid ${inCart ? 'var(--accent-primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '180px',
                height: '100%'
            }}>
            {inCart && (
                <span className="qty-badge animate-bounceIn">{inCart.quantity}</span>
            )}
            <div className="item-image-container shimmer-effect">
                <span className="item-code">{item.code}</span>
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 150px"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                    />
                ) : (
                    <span style={{ fontSize: 32 }}>🍽️</span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`} style={{ transform: 'scale(0.8)' }}></span>
                <span className="item-name">{item.name}</span>
            </div>
            <div className="item-price">₹{item.price}</div>

            <style jsx>{`
                .menu-item-card {
                    background: ${inCart ? 'var(--accent-glow)' : '#ffffff'} !important;
                    box-shadow: ${inCart ? '0 0 0 2px var(--accent-primary)' : 'var(--shadow-sm)'} !important;
                }
                .menu-item-card:hover {
                    box-shadow: var(--shadow-md) !important;
                    border-color: var(--accent-primary) !important;
                    transform: translateY(-2px);
                }
                .item-image-container {
                    height: 110px;
                    width: 100%;
                    border-radius: var(--radius-sm);
                    margin-bottom: 10px;
                    background: var(--bg-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 1px solid var(--border-light);
                    position: relative;
                    flex-shrink: 0;
                }
                .item-code {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    padding: 3px 6px;
                    background: rgba(15, 23, 42, 0.8);
                    color: white;
                    border-radius: var(--radius-xs);
                    font-size: 10px;
                    font-weight: 700;
                    z-index: 10;
                    letter-spacing: 0.5px;
                }
                .qty-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--gradient-primary);
                    color: white;
                    font-size: 11px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20;
                    box-shadow: 0 4px 10px rgba(249, 115, 22, 0.4);
                }
                .item-name {
                    font-size: var(--font-sm);
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1.3;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .item-price {
                    font-weight: 800;
                    font-size: var(--font-md);
                    color: var(--accent-primary);
                    margin-top: 6px;
                }
            `}</style>
        </div>
    );
};

export default memo(MenuItemCard);
