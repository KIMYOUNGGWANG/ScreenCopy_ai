import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    try {
        // 1. Check Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({
                error: 'Please sign in to analyze images.'
            }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({
                error: 'No image provided.'
            }, { status: 400 })
        }

        // 2. Prepare Image for Claude (Convert to Base64)
        const arrayBuffer = await file.arrayBuffer()
        const imageBase64 = Buffer.from(arrayBuffer).toString('base64')
        const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

        // 3. Call Anthropic Claude 4.5 Sonnet
        const prompt = `
You are an expert App Store Optimization (ASO) and UI/UX specialist.
Analyze this app screenshot and extract the following metadata to pre-fill a marketing form.

Fields to extract:
1. App Name: Look for the logo or header. If not found, infer a generic name or leave empty.
2. Category: Choose one from [productivity, game, social, health, education, business, other].
3. Target Audience: Infer who would use this app (e.g., "Fitness enthusiasts", "Students", "Project Managers").
4. Tone: Infer the brand voice from the UI style [professional, casual, playful, inspirational].
5. Description: A 1-sentence summary of what the app does.
6. Keywords: 5-7 relevant ASO keywords (comma separated).
7. Accent Color: Extract the dominant brand color from the UI (buttons, headers, logos). Return as Hex Code (e.g., "#FF5733").
8. Suggested Layout: Based on the screenshot density, suggest the best layout for a marketing card:
   - "bento": If the screen has many distinct feature blocks.
   - "device": If the screen is a clean, single view (best for wrapping in a phone frame).
   - "viral": If the screen is text-heavy or simple (best for typography focus).

OUTPUT FORMAT (JSON ONLY):
{
  "appName": "string",
  "category": "string",
  "targetAudience": "string",
  "tone": "string",
  "description": "string",
  "keywords": "string",
  "accentColor": "#HexCode",
  "suggestedLayout": "bento|device|viral"
}
`

        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,
                                data: imageBase64,
                            },
                        },
                        {
                            type: "text",
                            text: prompt
                        }
                    ],
                }
            ],
        })

        // Handle TextBlock content safely
        const contentBlock = message.content[0]
        const content = contentBlock.type === 'text' ? contentBlock.text : ''
        const cleanContent = content?.replace(/```json\n|\n```/g, '') || '{}'
        const analysisResult = JSON.parse(cleanContent)

        return NextResponse.json({
            success: true,
            data: analysisResult
        })

    } catch (error: unknown) {
        console.error('Analysis error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

        return NextResponse.json({
            error: errorMessage
        }, { status: 500 })
    }
}
