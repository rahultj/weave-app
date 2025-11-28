import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HomeContent from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()

  // If logged in, redirect to new feed UI
  // Note: This is a backup - middleware should handle this redirect
  if (session) {
    redirect('/feed')
  }

  // If not logged in, show sign-in UI
  return <HomeContent />
}
