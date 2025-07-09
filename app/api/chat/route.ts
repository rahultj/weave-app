import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { saveChatHistory } from '@/lib/chat-history'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

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

    // Build context about the scrap
    const scrapContext = scrap.type === 'text' 
      ? `A quote/thought: "${scrap.content}" from ${scrap.source || 'unknown source'}`
      : `An image scrap titled "${scrap.title}" with description: "${scrap.content}" from ${scrap.source || 'unknown source'}`

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

The user has saved this in their collection: ${scrapContext}

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