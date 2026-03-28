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
                <div className="outer-ring"></div>
                <div className="inner-ring"></div>
                <div className="logo-box">
                    <img src={logo} alt="Loading..." className="premium-logo" 
                        onError={(e) => { e.target.src = '/images/logo.png'; }} />
                </div>
                <div className="glow-effect"></div>
            </div>
            <div className="text-container">
                <h3 className="loading-title">BUSHRA</h3>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>

            <style jsx>{`
                .premium-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                }
                .loader-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .outer-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid transparent;
                    border-top-color: var(--accent-primary);
                    border-bottom-color: var(--accent-primary);
                    border-radius: 50%;
                    animation: rotate 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }
                .inner-ring {
                    position: absolute;
                    width: 80%;
                    height: 80%;
                    border: 3px solid transparent;
                    border-left-color: var(--accent-secondary, #f97316);
                    border-right-color: var(--accent-secondary, #f97316);
                    border-radius: 50%;
                    animation: rotate-reverse 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    opacity: 0.5;
                }
                .logo-box {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    animation: pulse 2s ease-in-out infinite;
                    padding: 10px;
                    overflow: hidden;
                }
                .premium-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .glow-effect {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    background: var(--accent-primary);
                    border-radius: 50%;
                    filter: blur(40px);
                    opacity: 0.2;
                    z-index: 1;
                    animation: glow-pulse 3s infinite;
                }
                .text-container {
                    text-align: center;
                }
                .loading-title {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 4px;
                    color: var(--text-primary);
                    background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 12px;
                }
                .loading-bar {
                    width: 120px;
                    height: 4px;
                    background: var(--border-light);
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 0 auto;
                }
                .loading-progress {
                    width: 30%;
                    height: 100%;
                    background: var(--accent-primary);
                    border-radius: 10px;
                    animation: progress-slide 1.5s ease-in-out infinite;
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rotate-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.1; transform: scale(0.8); }
                    50% { opacity: 0.3; transform: scale(1.2); }
                }
                @keyframes progress-slide {
                    0% { transform: translateX(-100%); width: 20%; }
                    50% { width: 50%; }
                    100% { transform: translateX(400%); width: 20%; }
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '400px', width: '100%'
        }}>
            {content}
        </div>
    );
}
