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



export async function getChatHistory(scrapId: string, userId: string): Promise<ChatHistory | null> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - this is expected for new conversations
        return null
      }
      throw error
    }

    if (!data || !data.user_id || !data.scrap_id) return null

    // Parse the messages JSON and convert timestamps back to Date objects
    const messages: ChatMessage[] = (data.messages as unknown as ChatMessage[]).map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))

    return {
      id: data.id,
      user_id: data.user_id,
      scrap_id: data.scrap_id,
      messages,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
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
  try {
    // Convert Date objects to ISO strings for JSON storage
    const messagesForStorage = messages.map((msg: ChatMessage) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    })) as Database['public']['Tables']['chat_history']['Insert']['messages']

    // Try to update existing chat history first
    const { data: updateData } = await supabase
      .from('chat_history')
      .update({ 
        messages: messagesForStorage,
        updated_at: new Date().toISOString()
      })
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateData && updateData.user_id && updateData.scrap_id) {
      // Successfully updated existing chat history
      const parsedMessages: ChatMessage[] = (updateData.messages as unknown as ChatMessage[]).map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      return {
        id: updateData.id,
        user_id: updateData.user_id,
        scrap_id: updateData.scrap_id,
        messages: parsedMessages,
        created_at: updateData.created_at || new Date().toISOString(),
        updated_at: updateData.updated_at || new Date().toISOString()
      }
    }

    // If no existing chat history, create new one
    const { data: insertData, error: insertError } = await supabase
      .from('chat_history')
      .insert({
        scrap_id: scrapId,
        user_id: userId,
        messages: messagesForStorage
      })
      .select()
      .single()

    if (insertError) throw insertError
    if (!insertData || !insertData.user_id || !insertData.scrap_id) return null

    const parsedMessages: ChatMessage[] = (insertData.messages as unknown as ChatMessage[]).map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))

    return {
      id: insertData.id,
      user_id: insertData.user_id,
      scrap_id: insertData.scrap_id,
      messages: parsedMessages,
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