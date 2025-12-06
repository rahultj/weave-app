import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected routes (require auth)
  const protectedRoutes = ['/feed', '/weave-chat', '/conversation']
  
  // Define auth routes (should redirect if already logged in)
  const authRoutes = ['/app']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route)

  // If trying to access protected route without user, redirect to /app
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/app', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and trying to access /app, redirect to /feed
  if (isAuthRoute && user) {
    const redirectUrl = new URL('/feed', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

