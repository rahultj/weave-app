// lib/scraps.ts
import { supabase } from './supabase'

export interface Scrap {
  id: string
  user_id?: string | null
  type: 'image' | 'text'
  title?: string | null  // Name of the cultural artifact
  content?: string | null  // User's observation/reflection
  image_url?: string | null
  creator?: string | null  // Author, artist, director, etc.
  medium?: string | null  // Book, film, artwork, etc.
  tags?: string[] | null
  created_at: string
  updated_at?: string | null
}

export interface CreateScrapData {
  type: 'text' | 'image'
  title?: string | null  // Name of the cultural artifact
  content?: string | null  // User's observation/reflection
  image_url?: string | null
  creator?: string | null  // Author, artist, director, etc.
  medium?: string | null  // Book, film, artwork, etc.
  tags?: string[] | null
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
        content: data.content,
        image_url: image_url,
        creator: data.creator,
        medium: data.medium,
        tags: data.tags || []
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