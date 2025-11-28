import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, customTitle } = body

    console.log('API: save-conversation called with', messages?.length, 'messages')

    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('API: Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    console.log('API: User authenticated:', user.id)

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages to save', success: false },
        { status: 400 }
      )
    }

    // Generate title from first user message
    const firstUserMessage = messages.find((m: any) => m.sender === 'user')
    const defaultTitle = firstUserMessage?.content.slice(0, 100) || 'Conversation with Bobbin'
    const title = customTitle || defaultTitle

    console.log('API: Generated title:', title)

    // Convert messages to storage format
    const conversationData = messages.map((msg: any) => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString(),
      media: msg.media
    }))

    const insertData = {
      user_id: user.id,
      type: 'conversation',
      title,
      content: JSON.stringify(conversationData),
      observations: null
    }

    console.log('API: Inserting data with RAW SQL to bypass PostgREST cache...')

    // Use raw SQL to bypass PostgREST's schema cache completely
    const { data: scrap, error } = await supabase.rpc('create_conversation_scrap', {
      p_user_id: user.id,
      p_title: title,
      p_content: JSON.stringify(conversationData)
    })

    if (error) {
      console.error('API: RPC error:', error)
      console.error('API: Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { error: error.message || 'Failed to save conversation', success: false },
        { status: 500 }
      )
    }

    console.log('API: Conversation saved successfully via RPC')

    return NextResponse.json({
      success: true,
      scrap
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
