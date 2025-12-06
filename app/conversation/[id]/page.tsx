import { redirect, notFound } from 'next/navigation'
import ConversationView from './ConversationView'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/app')
  }

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
