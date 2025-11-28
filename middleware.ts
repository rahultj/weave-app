import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Define protected routes (require auth)
  const protectedRoutes = ['/feed', '/weave-chat', '/conversation']
  
  // Define auth routes (should redirect if already logged in)
  const authRoutes = ['/app']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // If trying to access protected route without session, redirect to /app
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/app', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and trying to access /app, redirect to /feed
  if (isAuthRoute && session) {
    const redirectUrl = new URL('/feed', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
}

