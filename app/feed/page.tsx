import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FeedView from './FeedView'
import { getUserArtifacts } from '@/lib/knowledge-graph'

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

  // Fetch user's artifacts
  let artifacts = []
  try {
    artifacts = await getUserArtifacts(user.id, supabase)
  } catch (error) {
    console.error('Error fetching artifacts:', error)
  }

  return <FeedView artifacts={artifacts} user={user} />
}
