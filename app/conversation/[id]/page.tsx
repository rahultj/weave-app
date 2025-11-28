import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import ConversationView from './ConversationView'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session }, error: authError } = await supabase.auth.getSession()

  if (authError || !session) {
    redirect('/app')
  }

  const user = session.user

  // Fetch the conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (convError || !conversation) {
    notFound()
  }

  // Fetch the artifact that was discovered in this conversation
  const { data: artifact } = await supabase
    .from('artifacts')
    .select('*')
    .eq('discovered_via', id)
    .eq('user_id', user.id)
    .single()

  return (
    <ConversationView 
      conversation={conversation} 
      artifact={artifact} 
      user={user}
    />
  )
}

