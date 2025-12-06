import { redirect } from 'next/navigation'
import HomeContent from '@/components/HomeContent'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to new feed UI
  // Note: This is a backup - middleware should handle this redirect
  if (user) {
    redirect('/feed')
  }

  // If not logged in, show sign-in UI
  return <HomeContent />
}
