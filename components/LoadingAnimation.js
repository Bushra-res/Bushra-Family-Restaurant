'use client';
import { useState, useEffect } from 'react';

export default function LoadingAnimation({ fullScreen = false }) {
    const [logo, setLogo] = useState('/images/logo.png');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data && data.logoUrl) setLogo(data.logoUrl);
            } catch (err) {
                // Fallback to default logo already set in state
            }
        };
        fetchSettings();
    }, []);

    const content = (
        <div className="premium-loader">
            <div className="loader-container">
                <svg className="progress-ring" width="120" height="120">
                    <circle className="progress-ring__circle-bg" stroke="#e2e8f0" strokeWidth="3" fill="transparent" r="54" cx="60" cy="60" />
                    <circle className="progress-ring__circle" stroke="var(--accent-primary)" strokeWidth="3" fill="transparent" r="54" cx="60" cy="60" />
                </svg>
                <div className="logo-wrapper">
                    <img src={logo} alt="Loading..." className="premium-logo" 
                        onError={(e) => { e.target.src = '/images/logo.png'; }} />
                </div>
            </div>
            <div className="text-wrapper">
                <h3 className="brand-text">BUSHRA</h3>
                <p className="loading-status">Setting up your kitchen...</p>
            </div>

            <style jsx>{`
                .premium-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .loader-container {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .progress-ring {
                    transform: rotate(-90deg);
                    position: absolute;
                    inset: 0;
                }
                .progress-ring__circle {
                    stroke-dasharray: 339.292;
                    stroke-dashoffset: 339.292;
                    animation: progress-draw 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    stroke-linecap: round;
                }
                .logo-wrapper {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    box-shadow: var(--shadow-md);
                    animation: logo-pulse 2s ease-in-out infinite;
                    padding: 12px;
                    overflow: hidden;
                    border: 1px solid var(--border-light);
                }
                .premium-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .text-wrapper {
                    text-align: center;
                    animation: fade-in-up 0.8s ease-out;
                }
                .brand-text {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: 6px;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }
                .loading-status {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    margin: 0;
                }

                @keyframes progress-draw {
                    0% { stroke-dashoffset: 339.292; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -339.292; }
                }
                @keyframes logo-pulse {
                    0%, 100% { transform: scale(1); box-shadow: var(--shadow-md); }
                    50% { transform: scale(1.05); box-shadow: var(--shadow-lg); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999
            }}>
                {content}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '70vh', 
            width: '100%',
            flex: 1
        }}>
            {content}
        </div>
    );
}
