import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/i

// Public routes that don't require authentication
const publicPaths = [
  '/',
  '/venue/login',
  '/venue/register',
  '/venue/onboarding',
  '/staff/login',
  '/tip',
  '/api/auth',
  '/api/otp',
  '/api/tip',
  '/api/tips',
  '/api/webhook',
  '/api/dev',
  '/api/venues/midtrans/validate',
  '/api/health',
  '/landing-v3',
]

// Role requirements for protected areas
const roleRequirements: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/api/admin': ['ADMIN'],
  '/venue': ['MANAGER', 'ADMIN'],
  '/api/venues': ['MANAGER', 'ADMIN'],
  '/api/staff': ['MANAGER', 'ADMIN', 'STAFF'],
  '/api/qr': ['MANAGER', 'ADMIN'],
  '/api/payouts': ['MANAGER', 'ADMIN'],
  '/staff/dashboard': ['STAFF', 'MANAGER', 'ADMIN'],
  '/staff/history': ['STAFF', 'MANAGER', 'ADMIN'],
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
}

function getRequiredRoles(pathname: string): string[] | null {
  // Find the most specific matching role requirement
  const sortedPaths = Object.keys(roleRequirements).sort((a, b) => b.length - a.length)
  
  for (const path of sortedPaths) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return roleRequirements[path]
    }
  }
  
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }
  
  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }
  
  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname)
  
  if (!requiredRoles) {
    // Not a protected route
    return NextResponse.next()
  }
  
  // Get session using auth()
  const session = await auth()
  
  console.log('[Middleware]', {
    pathname,
    hasSession: !!session,
    userRole: session?.user?.role,
    requiredRoles
  })
  
  // No session - redirect to login
  if (!session || !session.user) {
    console.log('[Middleware] No session, redirecting to login')
    const loginUrl = pathname.startsWith('/admin') || pathname.startsWith('/venue')
      ? '/venue/login'
      : '/staff/login'
    
    const url = new URL(loginUrl, request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Check role
  const userRole = (session.user as { role?: string }).role
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    // Unauthorized - redirect to appropriate page
    if (userRole === 'STAFF') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url))
    } else if (userRole === 'MANAGER') {
      return NextResponse.redirect(new URL('/venue/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
