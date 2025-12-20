import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    try {
        const { originalCopy, instruction, context } = await request.json()

        if (!originalCopy || !instruction) {
            return NextResponse.json({
                error: 'Missing required fields: originalCopy and instruction'
            }, { status: 400 })
        }

        const supabase = await createClient()

        // Check Authentication (no credit deduction for refinement)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({
                error: 'Please sign in to refine copy.'
            }, { status: 401 })
        }

        const appName = context?.appName || 'App'
        const category = context?.category || 'General'
        const targetAudience = context?.targetAudience || 'General Users'
        const brandTone = context?.tone || 'Professional'

        // Call Claude to refine the copy
        const prompt = `
You are an expert Mobile App Copywriter (iOS & Android) specialized in ASO (App Store Optimization).
Your task is to refine the marketing headline based on the user's instruction, while ensuring it fits the app's brand and visual constraints.

---
APP CONTEXT (Do not ignore):
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone of Voice: ${brandTone}

CURRENT STATE:
- Headline: "${originalCopy.headline}"
- Subtext: "${originalCopy.subtext || ''}"
- Current Layout: ${originalCopy.layout}
- Current Color: ${originalCopy.color_hex}

USER INSTRUCTION:
${instruction}

---
TASK:
Refine the copy to strictly follow the User Instruction.
If the instruction is vague (e.g., "Make it better"), optimize for higher Click-Through Rate (CTR) based on the "App Context".

GUIDELINES:
1. Length: Keep headlines under 6 words for readability on small screens.
2. ASO: Prioritize clarity and benefit over cleverness unless instructed otherwise.
3. Visuals: Only suggest a layout/color change if the text change drastically requires it; otherwise, maintain the current style to ensure contrast safety.

OUTPUT FORMAT (JSON):
{
  "headline": "Refined headline text",
  "subtext": "Refined subtext",
  "layout": "top|bottom|center|split (Return '${originalCopy.layout}' unless change is critical)",
  "color_hex": "Hex Code (Return '${originalCopy.color_hex}' unless user specifically asked for color change)",
  "aso_score": 0-100 (Score based on: Brevity, Keyword relevance, Emotional hook),
  "benchmark_ref": "Modeled after successful apps in ${category} category",
  "reasoning": "Explain exactly how the new copy meets the user's instruction AND the app's context."
}

Return ONLY the JSON object. No other text, no markdown fencing.
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
