'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      textAlign: 'center',
      background: 'var(--bg-primary)'
    }}>
      <style jsx>{`
        .error-title {
          font-size: 120px;
          font-weight: 900;
          margin: 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }
        .error-message {
          font-size: var(--font-xl);
          color: var(--text-primary);
          margin: 20px 0 10px;
          font-weight: 700;
        }
        .error-desc {
          color: var(--text-secondary);
          margin-bottom: 30px;
          max-width: 400px;
        }
      `}</style>

      <h1 className="error-title">404</h1>
      <h2 className="error-message">Oops! Page Not Found</h2>
      <p className="error-desc">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link href="/" className="btn btn-primary btn-lg">
        Back to Home
      </Link>
    </div>
  );
}
