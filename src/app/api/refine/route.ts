import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    try {
        const { originalCopy, instruction } = await request.json()

        if (!originalCopy || !instruction) {
            return NextResponse.json({
                error: 'Missing required fields: originalCopy and instruction'
            }, { status: 400 })
        }

        const cookieStore = await cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

        // Check Authentication (no credit deduction for refinement)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({
                error: 'Please sign in to refine copy.'
            }, { status: 401 })
        }

        // Call Claude to refine the copy
        const prompt = `
You are an expert App Store copywriter. Your task is to refine the following marketing headline based on the user's instruction.

ORIGINAL HEADLINE:
"${originalCopy.headline}"

ORIGINAL SUBTEXT:
"${originalCopy.subtext || ''}"

USER INSTRUCTION:
${instruction}

TASK:
Create a refined version of the headline that follows the user's instruction while maintaining marketing effectiveness.

OUTPUT FORMAT (JSON):
{
  "headline": "...",
  "subtext": "...",
  "reasoning": "Explain what changes you made and why"
}

Return ONLY the JSON object. No other text.
`

        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
        })

        const contentBlock = message.content[0]
        const content = contentBlock.type === 'text' ? contentBlock.text : ''
        const cleanContent = content?.replace(/```json\n|\n```/g, '') || '{}'
        const refinedCopy = JSON.parse(cleanContent)

        return NextResponse.json({
            success: true,
            data: refinedCopy
        })

    } catch (error: unknown) {
        console.error('Refinement error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: errorMessage || 'Failed to refine copy. Please try again.'
        }, { status: 500 })
    }
}
