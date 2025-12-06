import { redirect } from 'next/navigation'
import FeedView from './FeedView'
import { createClient } from '@/lib/supabase/server'
import type { Artifact } from '@/lib/types/knowledge-graph'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If not logged in, redirect to app (which has auth)
  // Note: This is a backup - middleware should handle this redirect
  if (authError || !user) {
    redirect('/app')
  }

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
