import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  console.log('API route called') // Debug log
  
  try {
    const body = await request.json()
    console.log('Request body:', body) // Debug log
    
    const { message, scrap, chatHistory } = body

    // Build context about the scrap
    const scrapContext = scrap.type === 'text' 
      ? `A quote/thought: "${scrap.content}" from ${scrap.source || 'unknown source'}`
      : `An image scrap titled "${scrap.title}" with description: "${scrap.content}" from ${scrap.source || 'unknown source'}`

    // Build conversation history for Claude
    const conversationHistory = chatHistory.map((msg: { sender: string; content: string }) => {
      return `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`
    }).join('')

    const prompt = `You are a thoughtful cultural curator and literary companion. The user has saved this cultural discovery in their personal scrapbook: ${scrapContext}

Help them explore and understand this content more deeply. You can:
- Explain context, themes, and meanings
- Suggest related books, art, music, or ideas  
- Discuss the cultural significance
- Share interesting connections and insights
- Answer questions about the creator or work

Be conversational, insightful, and encouraging of intellectual curiosity. Keep responses focused but not overly long - aim for 1-2 paragraphs maximum.

${conversationHistory ? `Previous conversation:\n${conversationHistory}` : ''}

Human: ${message}

Assistant:`

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

    // Debug: Log the full response from Anthropic
    console.log('Claude API raw response:', JSON.stringify(response, null, 2));
    // Try to log possible text locations
    if (Array.isArray(response.content) && response.content.length > 0) {
      const firstBlock = response.content[0];
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        console.log('Claude API text:', firstBlock.text);
      } else {
        console.log('Claude API first block (no text):', firstBlock);
      }
    }
    console.log('Claude API content:', response.content)
    console.log('Claude API content block type:', response.content?.[0]?.type);
    
    // Safely extract the AI text from the response
    let aiText = '';
    if (Array.isArray(response.content) && response.content.length > 0) {
      const firstBlock = response.content[0];
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        aiText = firstBlock.text;
        console.log('Claude API text:', aiText);
      } else {
        aiText = JSON.stringify(firstBlock);
        console.log('Claude API first block (no text):', firstBlock);
      }
    } else {
      console.log('Claude API content is empty or not an array:', response.content);
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