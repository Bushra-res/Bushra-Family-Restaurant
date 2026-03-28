import './globals.css';
import { Providers } from './providers';

export const metadata = {
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://bushra-restaurant.vercel.app'),
    title: 'BUSHRA Family Restaurant - POS & Management System',
    description: 'Complete restaurant management with POS, online ordering, kitchen display, inventory, and customer management for BUSHRA Family Restaurant.',
    keywords: 'restaurant POS, BUSHRA restaurant, food ordering, kitchen management, billing system',
    icons: {
        icon: [
            { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon.ico', type: 'image/x-icon' },
        ],
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
        title: 'BUSHRA Family Restaurant',
        description: 'Complete restaurant management with POS, online ordering & more',
        type: 'website',
        images: ['/images/logo.png'],
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0a0e1a',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
