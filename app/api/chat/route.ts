import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { saveChatHistory } from '@/lib/chat-history'
import { getEnv } from '@/lib/env'

const anthropic = new Anthropic({
  apiKey: getEnv().ANTHROPIC_API_KEY
})

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per user
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Clean up every 5 minutes

// Rate limiting storage: Map<userId, { requests: timestamp[], lastCleanup: timestamp }>
interface RateLimitData {
  requests: number[]
  lastCleanup: number
}

const rateLimitStore = new Map<string, RateLimitData>()

// Cleanup old rate limit entries
function cleanupRateLimitStore() {
  const now = Date.now()
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS
  
  for (const [userId, data] of rateLimitStore.entries()) {
    // Remove old requests
    data.requests = data.requests.filter(timestamp => timestamp > cutoffTime)
    
    // Remove users with no recent requests
    if (data.requests.length === 0) {
      rateLimitStore.delete(userId)
    } else {
      // Update last cleanup time
      data.lastCleanup = now
    }
  }
}

// Check if user is rate limited
function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS
  
  // Get or create user data
  let userData = rateLimitStore.get(userId)
  if (!userData) {
    userData = { requests: [], lastCleanup: now }
    rateLimitStore.set(userId, userData)
  }
  
  // Clean up old requests for this user
  userData.requests = userData.requests.filter(timestamp => timestamp > cutoffTime)
  
  // Check if user has exceeded rate limit
  if (userData.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  
  // Add current request
  userData.requests.push(now)
  
  // Periodic cleanup (every 5 minutes)
  if (now - userData.lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupRateLimitStore()
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, scrap, chatHistory } = body

    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Rate limiting check
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment before sending another message.',
          success: false,
          rateLimitExceeded: true
        },
        { status: 429 }
      )
    }

    // Build comprehensive context about the scrap
    const buildScrapContext = (scrap: {
      id: string
      title?: string | null
      observations?: string | null
      creator?: string | null
      medium?: string | null
      tags?: string[] | null
      type: string
      image_url?: string | null
      created_at?: string | null
    }) => {
      const parts = []
      
      // Start with the type and title
      if (scrap.title) {
        parts.push(`Title: "${scrap.title}"`)
      }
      
      // Add content type information
      if (scrap.type === 'text') {
        parts.push(`Content Type: Text/Quote`)
      } else if (scrap.type === 'image') {
        parts.push(`Content Type: Image`)
      } else {
        parts.push(`Content Type: ${scrap.type}`)
      }
      
      // Add creator information
      if (scrap.creator) {
        parts.push(`Creator: ${scrap.creator}`)
      }
      
      // Add medium information
      if (scrap.medium) {
        parts.push(`Medium: ${scrap.medium}`)
      }
      
      // Add tags/categories
      if (scrap.tags && scrap.tags.length > 0) {
        parts.push(`Categories: ${scrap.tags.join(', ')}`)
      }
      
      // Add the actual observations
      if (scrap.observations) {
        if (scrap.type === 'text') {
          parts.push(`Quote/Observations: "${scrap.observations}"`)
        } else if (scrap.type === 'image') {
          parts.push(`Image Observations: "${scrap.observations}"`)
        } else {
          parts.push(`Observations: "${scrap.observations}"`)
        }
      }
      
      // Add image URL info for image scraps
      if (scrap.type === 'image' && scrap.image_url) {
        parts.push(`Image URL: Available`)
      }
      
      // Add creation date for context
      if (scrap.created_at) {
        const createdDate = new Date(scrap.created_at).toLocaleDateString()
        parts.push(`Added to collection: ${createdDate}`)
      }
      
      return parts.join('\n')
    }

    const scrapContext = buildScrapContext(scrap)

    // Build conversation history for Claude
    const conversationHistory = chatHistory.map((msg: { sender: string; content: string }) => {
      return `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`
    }).join('')

    const prompt = `You are Bobbin, a friendly and helpful AI companion. You help users understand their saved cultural discoveries in a clear, simple way.

When responding:
- Keep explanations short and direct (1-2 short paragraphs max)
- Use simple, everyday language
- Focus on the most interesting or relevant point first
- If suggesting related content, limit to 1-2 specific recommendations
- Avoid abstract or overly academic language
- Reference specific details from their saved item when relevant (title, creator, content type, etc.)

The user is asking about this item from their collection:

${scrapContext}

When they ask questions like "what is this about?", "tell me more about this", or "who created this?", use the specific information provided above to give detailed, contextual answers.

${conversationHistory ? `Previous conversation:\n${conversationHistory}` : ''}

H: ${message}

A:`

    // Send the prompt to Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    // Safely extract the AI text from the response
    let aiText = '';
    if (Array.isArray(response.content) && response.content.length > 0) {
      const firstBlock = response.content[0];
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        aiText = firstBlock.text;
      } else {
        aiText = 'I apologize, but I encountered an error processing your request.';
      }
    } else {
      aiText = 'I apologize, but I encountered an error processing your request.';
    }

    // Save the updated chat history to the database
    const updatedMessages = [
      ...chatHistory,
      { id: Date.now().toString(), content: message, sender: 'user', timestamp: new Date() },
      { id: (Date.now() + 1).toString(), content: aiText, sender: 'ai', timestamp: new Date() }
    ]
    
    try {
      await saveChatHistory(scrap.id, user.id, updatedMessages)
    } catch (error) {
      console.error('Error saving chat history in API:', error)
      // Don't fail the request if saving history fails
    }

    // Return the AI response
    return NextResponse.json({ 
      response: aiText,
      success: true 
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request', success: false },
      { status: 500 }
    )
  }
}