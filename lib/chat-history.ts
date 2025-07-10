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
  return messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString()
  }))
}

// Helper function to deserialize dates from storage
function deserializeMessages(messages: any[]): ChatMessage[] {
  return messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  }))
}

export async function getChatHistory(scrapId: string, userId: string): Promise<ChatHistory | null> {
  console.log('Fetching chat history for:', { scrapId, userId })
  console.log('User ID type:', typeof userId, 'Scrap ID type:', typeof scrapId)
  
  try {
    // Try without .single() first to see if we get any results
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)

    if (error) {
      console.error('Detailed error information:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        statusCode: (error as any).statusCode
      })
      console.error('Error in getChatHistory:', error)
      return null
    }

    console.log('Query result:', { dataLength: data?.length, data })

    if (!data || data.length === 0) {
      console.log('No existing chat history found (expected for new conversations)')
      return null
    }

    // Take the first result (should only be one anyway)
    const chatData = data[0]
    
    if (!chatData || !chatData.user_id || !chatData.scrap_id) {
      console.log('No valid chat history data found')
      return null
    }

    console.log('Found chat history:', chatData)

    return {
      id: chatData.id,
      user_id: chatData.user_id,
      scrap_id: chatData.scrap_id,
      messages: deserializeMessages(chatData.messages as any[]),
      created_at: chatData.created_at || new Date().toISOString(),
      updated_at: chatData.updated_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return null
  }
}

export async function saveChatHistory(
  scrapId: string, 
  userId: string, 
  messages: ChatMessage[]
): Promise<ChatHistory | null> {
  console.log('Saving chat history:', { scrapId, userId, messageCount: messages.length })
  console.log('Messages to save:', messages.map(m => ({ sender: m.sender, content: m.content.substring(0, 50) + '...' })))
  try {
    // Serialize messages for storage
    const messagesForStorage = serializeMessages(messages)
    console.log('Serialized messages:', messagesForStorage.length, 'items')

    // Try to update existing chat history first
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
      console.log('No existing chat history to update, creating new one')
    } else if (updateData && updateData.user_id && updateData.scrap_id) {
      console.log('Successfully updated existing chat history')
      return {
        id: updateData.id,
        user_id: updateData.user_id,
        scrap_id: updateData.scrap_id,
        messages: deserializeMessages(updateData.messages as any[]),
        created_at: updateData.created_at || new Date().toISOString(),
        updated_at: updateData.updated_at || new Date().toISOString()
      }
    }

    // If no existing chat history, create new one
    console.log('Creating new chat history')
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
      console.error('Error creating new chat history:', insertError)
      throw insertError
    }
    
    if (!insertData || !insertData.user_id || !insertData.scrap_id) {
      console.error('Failed to create chat history - no data returned')
      return null
    }

    console.log('Successfully created new chat history')
    return {
      id: insertData.id,
      user_id: insertData.user_id,
      scrap_id: insertData.scrap_id,
      messages: deserializeMessages(insertData.messages as any[]),
      created_at: insertData.created_at || new Date().toISOString(),
      updated_at: insertData.updated_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error saving chat history:', error)
    return null
  }
}

export async function deleteChatHistory(scrapId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting chat history:', error)
    return false
  }
} 