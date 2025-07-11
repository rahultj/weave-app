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
    
    // First, check if a record exists
    const { data: existingData } = await supabase
      .from('chat_history')
      .select('id')
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)
      .limit(1)

    if (existingData && existingData.length > 0) {
      // Update existing record
      console.log('Updating existing chat history...')
      const { data: updateData, error: updateError } = await supabase
        .from('chat_history')
        .update({ 
          messages: messagesForStorage,
          updated_at: new Date().toISOString()
        })
        .eq('scrap_id', scrapId)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return null
      }

      console.log('Successfully updated existing chat history')
      return {
        id: updateData.id,
        user_id: updateData.user_id || '',
        scrap_id: updateData.scrap_id || '',
        messages: deserializeMessages(updateData.messages as any[]),
        created_at: updateData.created_at || new Date().toISOString(),
        updated_at: updateData.updated_at || new Date().toISOString()
      }
    } else {
      // Create new record
      console.log('Creating new chat history record...')
      const { data: insertData, error: insertError } = await supabase
        .from('chat_history')
        .insert({
          scrap_id: scrapId,
          user_id: userId,
          messages: messagesForStorage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        return null
      }

      console.log('Successfully created new chat history')
      return {
        id: insertData.id,
        user_id: insertData.user_id || '',
        scrap_id: insertData.scrap_id || '',
        messages: deserializeMessages(insertData.messages as any[]),
        created_at: insertData.created_at || new Date().toISOString(),
        updated_at: insertData.updated_at || new Date().toISOString()
      }
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