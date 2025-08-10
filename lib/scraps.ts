// lib/scraps.ts
import { supabase } from './supabase'

export interface Scrap {
  id: string
  user_id?: string | null
  type: 'image' | 'text' | 'conversation'
  title: string  // Name of the cultural artifact or first part of conversation
  observations?: string | null  // User's observation/reflection
  content?: string | null  // For conversation type: JSON string of message array
  image_url?: string | null
  creator?: string | null  // Author, artist, director, etc.
  medium?: string | null  // Book, film, artwork, etc.
  tags?: string[] | null
  conversation_id?: string | null  // Link to conversation that generated this scrap
  created_at: string
  updated_at?: string | null
}

export interface CreateScrapData {
  type: 'text' | 'image' | 'conversation'
  title: string  // Name of the cultural artifact or first part of conversation
  observations?: string | null  // User's observation/reflection (renamed from content)
  content?: string | null  // For conversation type: JSON string of message array
  image_url?: string | null
  creator?: string | null  // Author, artist, director, etc.
  medium?: string | null  // Book, film, artwork, etc.
  tags?: string[] | null
  conversation_id?: string | null  // Link to conversation that generated this scrap
}

// new function to upload image to supabase storage
// lib/scraps.ts (update uploadImage function with debug logging)
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('scrap-images')
    .upload(fileName, file)
  
  if (error) {
    console.error('Error uploading image:', error)
    return null
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('scrap-images')
    .getPublicUrl(data.path)
  
  return publicUrl
}

// lib/scraps.ts (update the createScrap function)
export async function createScrap(data: CreateScrapData, imageFile?: File): Promise<Scrap | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  let image_url = data.image_url
  
  // Upload image if provided
  if (imageFile) {
    image_url = await uploadImage(imageFile, user.id)
    if (!image_url) {
      throw new Error('Failed to upload image')
    }
  }
  
  const { data: scrap, error } = await supabase
    .from('scraps')
    .insert([
      {
        user_id: user.id,
        type: data.type,
        title: data.title,
        observations: data.observations,
        content: data.content,
        image_url: image_url,
        creator: data.creator,
        medium: data.medium,
        tags: data.tags || [],
        conversation_id: data.conversation_id
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating scrap:', error)
    return null
  }
  
  return scrap as Scrap
}

export async function getScraps(): Promise<Scrap[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data: scraps, error } = await supabase
    .from('scraps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching scraps:', error)
    return []
  }
  
  return (scraps || []) as Scrap[]
}

// Add these functions to your existing lib/scraps.ts file

export async function updateScrap(scrapId: string, updates: Partial<Scrap>) {
  const { data, error } = await supabase
    .from('scraps')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', scrapId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating scrap:', error)
    throw error
  }
  
  return data
}

export async function deleteScrap(scrapId: string) {
  const { error } = await supabase
    .from('scraps')
    .delete()
    .eq('id', scrapId)
  
  if (error) {
    console.error('Error deleting scrap:', error)
    throw error
  }
}

// Simple conversation scrap functions

/**
 * Create a conversation scrap from first message
 */
export async function createConversationScrap(
  conversationId: string, 
  firstMessage: string
): Promise<Scrap | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('No user found for conversation scrap creation')
    return null
  }
  
  try {
    // Create title from first 50 characters
    const title = firstMessage.length > 50 
      ? firstMessage.slice(0, 50) + '...' 
      : firstMessage;

    // Initialize conversation array
    const conversationArray = [
      {
        sender: 'user',
        message: firstMessage,
        timestamp: new Date().toISOString()
      }
    ];

    const { data: scrap, error } = await supabase
      .from('scraps')
      .insert([
        {
          user_id: user.id,
          type: 'conversation',
          title,
          content: JSON.stringify(conversationArray),
          conversation_id: conversationId
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating conversation scrap:', error)
      return null
    }
    
    console.log('Conversation scrap created:', title)
    return scrap as Scrap
  } catch (error) {
    console.error('Error in createConversationScrap:', error)
    return null
  }
}

/**
 * Update conversation scrap with new message
 */
export async function updateConversationScrap(
  conversationId: string,
  sender: 'user' | 'bobbin',
  message: string
): Promise<void> {
  try {
    // Find the conversation scrap by conversation_id
    const { data: scrap, error: fetchError } = await supabase
      .from('scraps')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('type', 'conversation')
      .single()
    
    if (fetchError || !scrap) {
      console.error('Error fetching conversation scrap for update:', fetchError)
      return
    }

    // Parse existing conversation from content field
    let conversationArray: any[] = [];
    try {
      conversationArray = JSON.parse((scrap as any).content || '[]');
    } catch (e) {
      console.error('Error parsing conversation content:', e);
      conversationArray = [];
    }

    // Add new message
    conversationArray.push({
      sender,
      message,
      timestamp: new Date().toISOString()
    });

    // Update the scrap with new conversation data
    const { error: updateError } = await supabase
      .from('scraps')
      .update({
        content: JSON.stringify(conversationArray),
        updated_at: new Date().toISOString()
      })
      .eq('id', scrap.id)
    
    if (updateError) {
      console.error('Error updating conversation scrap:', updateError)
    }
  } catch (error) {
    console.error('Error in updateConversationScrap:', error)
  }
}

/**
 * Get scraps linked to a specific conversation
 */
export async function getScrapsByConversation(conversationId: string): Promise<Scrap[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data: scraps, error } = await supabase
    .from('scraps')
    .select('*')
    .eq('user_id', user.id)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching scraps by conversation:', error)
    return []
  }
  
  return (scraps || []) as Scrap[]
}