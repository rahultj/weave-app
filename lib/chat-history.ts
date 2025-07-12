import { supabase } from './supabase'
import { Database } from './database.types'

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export interface ChatHistory {
  id: string
  user_id: string
  scrap_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

// Helper function to serialize dates for storage
function serializeMessages(messages: ChatMessage[]): any[] {
  console.log('Serializing messages:', messages.length)
  return messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString()
  }))
}

// Helper function to deserialize dates from storage
function deserializeMessages(messages: any[]): ChatMessage[] {
  console.log('Deserializing messages:', messages.length)
  return messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  }))
}

export async function getChatHistory(scrapId: string, userId: string): Promise<ChatHistory | null> {
  console.log('getChatHistory called with:', { scrapId, userId })
  
  // Validate inputs
  if (!scrapId || !userId) {
    console.error('Missing required parameters:', { scrapId, userId })
    return null
  }
  
  try {
    console.log('Executing Supabase query...')
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })  // ← NEW: Get most recent record
      .limit(1)  // ← NEW: Only get one record

    console.log('Supabase query completed:', { 
      error: error ? { 
        message: error.message, 
        code: error.code,
        details: error.details 
      } : null,
      dataCount: data?.length || 0
    })

    if (error) {
      console.error('Supabase error:', error)
      return null
    }

    if (!data || data.length === 0) {
      console.log('No chat history found (this is normal for new conversations)')
      return null
    }

    const chatData = data[0]
    console.log('Processing chat data:', { 
      id: chatData.id, 
      messageCount: Array.isArray(chatData.messages) ? chatData.messages.length : 'not array' 
    })

    if (!chatData.messages || !Array.isArray(chatData.messages)) {
      console.error('Invalid messages data:', chatData.messages)
      return null
    }

    return {
      id: chatData.id,
      user_id: chatData.user_id || '',
      scrap_id: chatData.scrap_id || '',
      messages: deserializeMessages(chatData.messages),
      created_at: chatData.created_at || new Date().toISOString(),
      updated_at: chatData.updated_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Unexpected error in getChatHistory:', error)
    return null
  }
}

export async function saveChatHistory(
  scrapId: string, 
  userId: string, 
  messages: ChatMessage[]
): Promise<ChatHistory | null> {
  console.log('saveChatHistory called with:', { 
    scrapId, 
    userId, 
    messageCount: messages.length 
  })
  
  if (!scrapId || !userId || !Array.isArray(messages)) {
    console.error('Invalid parameters:', { scrapId, userId, messages: Array.isArray(messages) })
    return null
  }

  try {
    const messagesForStorage = serializeMessages(messages)
    const now = new Date().toISOString()
    
    // Use standard Supabase upsert with unique constraint
    console.log('Executing standard upsert...')
    const { data, error } = await supabase
      .from('chat_history')
      .upsert({
        scrap_id: scrapId,
        user_id: userId,
        messages: messagesForStorage,
        updated_at: now
      }, {
        onConflict: 'scrap_id,user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Upsert error:', error)
      return null
    }

    const result = data
    console.log('Successfully upserted:', { 
      id: result.id,
      messageCount: Array.isArray(result.messages) ? result.messages.length : 0
    })
    
    return {
      id: result.id,
      user_id: result.user_id || '',
      scrap_id: result.scrap_id || '',
      messages: deserializeMessages(result.messages as any[]),
      created_at: result.created_at || now,
      updated_at: result.updated_at || now
    }
  } catch (error) {
    console.error('Unexpected error in saveChatHistory:', error)
    return null
  }
}

export async function deleteChatHistory(scrapId: string, userId: string): Promise<boolean> {
  console.log('deleteChatHistory called with:', { scrapId, userId })
  
  if (!scrapId || !userId) {
    console.error('Missing required parameters for delete')
    return false
  }

  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    console.log('Successfully deleted chat history')
    return true
  } catch (error) {
    console.error('Unexpected error in deleteChatHistory:', error)
    return false
  }
} 