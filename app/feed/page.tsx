import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FeedView from './FeedView'
import type { Artifact } from '@/lib/types/knowledge-graph'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session }, error: authError } = await supabase.auth.getSession()

  // If not logged in, redirect to app (which has auth)
  // Note: This is a backup - middleware should handle this redirect
  if (authError || !session) {
    redirect('/app')
  }

  const user = session.user

  // Fetch user's artifacts directly from database
  let artifacts: Artifact[] = []
  try {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching artifacts:', error)
    } else {
      artifacts = data || []
    }
  } catch (error) {
    console.error('Error in FeedPage:', error)
    // Continue with empty artifacts array - don't crash the page
  }

  return <FeedView artifacts={artifacts} user={user} />
}
