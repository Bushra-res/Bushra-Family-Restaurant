import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Public routes
    const publicPaths = ['/', '/login', '/register', '/menu', '/qr'];
    const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith('/api/auth') || pathname.startsWith('/api/menu') || pathname.startsWith('/api/categories'));

    if (isPublic) return NextResponse.next();

    // API routes that need auth but not role check
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/staff/')) {
        // Allow unauthenticated POST to orders (for guest checkout)
        if (pathname === '/api/orders' && request.method === 'POST') {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.next();
    }

    // Admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/staff')) {
        if (!token || token.role !== 'admin') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }


    // Delivery routes
    if (pathname.startsWith('/delivery')) {
        if (!token || (token.role !== 'delivery' && token.role !== 'admin')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // Protected customer routes (cart, orders, profile) - checkout handles auth dynamically
    const protectedCustomerPaths = ['/cart', '/orders', '/profile'];
    if (protectedCustomerPaths.some(p => pathname.startsWith(p))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
