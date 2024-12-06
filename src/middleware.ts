import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get auth state from cookie and parse it properly
    const authCookie = request.cookies.get('auth-storage')
    const authState = authCookie ? JSON.parse(authCookie.value).state : null

    // Check both initialization and authentication
    const isInitialized = authState?.initialized ?? false
    const isAuthenticated = authState?.isAuthenticated ?? false

    // If not initialized, allow the request to proceed
    if (!isInitialized) {
        return NextResponse.next()
    }

    // Public paths that don't require authentication
    const publicPaths = ['/login']

    // Protected paths that require authentication
    const protectedPaths = ['/dashboard', '/tokens', '/create', '/wallet', '/settings']

    // Current requested path without the route group prefix
    const currentPath = pathname.replace('/(authenticated)', '')

    // Only handle specific cases
    if (pathname === '/') {
        // Root path handling
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protected routes when not authenticated
    if (protectedPaths.includes(currentPath) && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Login page when already authenticated
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow all other requests to proceed
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
} 