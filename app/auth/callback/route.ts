import { createRouteClient } from '@/lib/supabase/route'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/feed'

  if (code) {
    const supabase = await createRouteClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the specified next URL (e.g., /reset-password) or default to /feed
  return NextResponse.redirect(new URL(next, request.url))
}