'use client';

export default function LoadingAnimation({ fullScreen = false }) {
    const content = (
        <div className="restaurant-loader">
            <div className="pan-container">
                <div className="pan"></div>
                <div className="handle"></div>
            </div>
            <div className="food">
                <div className="food-item egg"></div>
            </div>
            <div className="steam-container">
                <div className="steam steam-1"></div>
                <div className="steam steam-2"></div>
                <div className="steam steam-3"></div>
            </div>
            <p className="loading-text">Cooking up your content...</p>

            <style jsx>{`
        .restaurant-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 200px;
          height: 150px;
        }

        .pan-container {
          display: flex;
          align-items: flex-end;
          z-index: 2;
        }

        .pan {
          width: 80px;
          height: 20px;
          background: #333;
          border-radius: 0 0 40px 40px;
          position: relative;
          animation: pan-toss 1.5s ease-in-out infinite;
          transform-origin: right top;
        }

        .handle {
          width: 50px;
          height: 8px;
          background: #222;
          border-radius: 4px;
          margin-bottom: 12px;
          margin-left: -5px;
          animation: handle-toss 1.5s ease-in-out infinite;
          transform-origin: right center;
        }

        .food {
          position: absolute;
          top: 40px;
          left: 50px;
          z-index: 1;
        }

        .food-item {
          width: 30px;
          height: 30px;
          background: #fadbd8;
          border-radius: 50%;
          position: relative;
          animation: food-toss 1.5s ease-in-out infinite;
        }

        .food-item::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          width: 14px;
          height: 14px;
          background: #f1c40f;
          border-radius: 50%;
        }

        .steam-container {
          position: absolute;
          top: 10px;
          left: 60px;
          display: flex;
          gap: 15px;
        }

        .steam {
          width: 6px;
          height: 20px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
          filter: blur(2px);
          animation: steam-rise 2s ease-out infinite;
        }

        .steam-1 { animation-delay: 0s; }
        .steam-2 { animation-delay: 0.6s; height: 25px; }
        .steam-3 { animation-delay: 1.2s; }

        .loading-text {
          margin-top: 20px;
          font-weight: 600;
          color: var(--accent-primary);
          font-size: var(--font-sm);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pan-toss {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        @keyframes handle-toss {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        @keyframes food-toss {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(180deg); }
        }

        @keyframes steam-rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
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
            minHeight: '300px', width: '100%'
        }}>
            {content}
        </div>
    );
}
