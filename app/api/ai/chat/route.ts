import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const systemPrompt = `You are Ndukaagu, an expert AI tutor specializing in teaching indigenous Nigerian languages.
You help students learn Igbo, Yoruba, Hausa, Ibibio, and Efik with cultural context and authentic usage.`

    // Using Vercel AI Gateway default model
    const response = await fetch('https://api.vercel.ai/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error('AI API error')
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Unable to process your question.'

    return NextResponse.json({
      message: reply,
      success: true,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message', success: false },
      { status: 500 }
    )
  }
}
