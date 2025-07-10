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
  
  // First, let's test if we can access the table at all
  try {
    console.log('Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('chat_history')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Database connection test failed:', testError)
      console.error('Error details:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      })
    } else {
      console.log('Database connection test passed')
    }
  } catch (error) {
    console.error('Database connection test error:', error)
  }

  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('scrap_id', scrapId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Detailed error information:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        statusCode: (error as any).statusCode
      })
      
      if (error.code === 'PGRST116') {
        console.log('No existing chat history found (expected for new conversations)')
        return null
      }
      console.error('Error in getChatHistory:', error)
      throw error
    }

    if (!data || !data.user_id || !data.scrap_id) {
      console.log('No valid chat history data found')
      return null
    }

    console.log('Found chat history:', data)

    return {
      id: data.id,
      user_id: data.user_id,
      scrap_id: data.scrap_id,
      messages: deserializeMessages(data.messages as any[]),
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
  console.log('Saving chat history:', { scrapId, userId, messageCount: messages.length })
  try {
    // Serialize messages for storage
    const messagesForStorage = serializeMessages(messages)

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