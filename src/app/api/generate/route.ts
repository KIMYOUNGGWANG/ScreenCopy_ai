
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { GhostwriterOutput, WeeklyThread } from '@/types/generation'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = await createClient()
    let creditDeducted = false
    let userId: string | null = null

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const appName = formData.get('appName') as string
        const category = formData.get('category') as string
        const targetAudience = formData.get('targetAudience') as string
        const tone = formData.get('tone') as string
        const description = formData.get('description') as string

        const keywords = formData.get('keywords') as string
        const language = formData.get('language') as string

        if (!file) {
            return NextResponse.json({
                error: 'No image provided. Please upload a screenshot to continue.'
            }, { status: 400 })
        }

        // 1. Check Authentication & Credits
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({
                error: 'Please sign in to generate copy.'
            }, { status: 401 })
        }

        userId = user.id

        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single()

        if (!profile || profile.credits < 1) {
            return NextResponse.json({
                error: 'You have no credits left. Purchase more credits to continue generating copy.'
            }, { status: 403 })
        }

        // 2. Deduct Credit BEFORE generation (optimistic)
        const { error: deductError } = await supabase
            .from('profiles')
            .update({ credits: profile.credits - 1 })
            .eq('id', userId)

        if (deductError) {
            console.error('Credit deduction error:', deductError)
            throw new Error('Failed to process credit. Please try again.')
        }

        creditDeducted = true

        // 3. Upload Image to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('screenshots')
            .upload(fileName, file)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error('Failed to upload image. Your credit has been restored.')
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('screenshots')
            .getPublicUrl(fileName)

        // 4. Prepare Image for Claude (Fetch and convert to Base64)
        const imageResponse = await fetch(publicUrl)
        if (!imageResponse.ok) {
            throw new Error('Failed to retrieve uploaded image.')
        }
        const imageBuffer = await imageResponse.arrayBuffer()
        const imageBase64 = Buffer.from(imageBuffer).toString('base64')
        const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

        const platform = formData.get('platform') as string || 'app_store'

        // 5. Call Anthropic Claude 4.5 Sonnet with Retry Logic
        const getSystemPrompt = () => {
            const commonContext = `
CONTEXT:
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- App Description: ${description}
- Keywords: ${keywords || 'None'}
- Language: ${language || 'English'}
`

            if (platform === 'app_store') {
                return `
You are an expert Mobile App Growth Expert specializing in App Store & Google Play optimization. Perform a multi-agent analysis on this screenshot to create high-converting marketing copy.

AGENTS:
1. VISION AGENT: Analyze the screenshot's composition. Identify the best "safe zone" for text (top, bottom, center, or split) where it won't cover important UI elements. Extract the dominant color and suggest a contrasting text color.
2. STRATEGY AGENT: Based on the Category (${category}), select a benchmark app style (e.g., Tinder for Dating, Calm for Health, Duolingo for Education) and adopt its tone.
3. ASO AGENT: Analyze the provided keywords (${keywords || 'None'}) and generate copy that naturally integrates them. Score the result (0-100) based on keyword usage and conversion potential.

${commonContext}

TASK:
Create 5 distinct marketing variations.

OUTPUT FORMAT (JSON ARRAY):
[
  {
    "headline": "Main headline (6-10 words)",
    "subtext": "Supporting subtitle (10-15 words)",
    "style": "bold|subtle|feature|benefit|emotional",
    "layout": "top|bottom|center|split",
    "color_hex": "#FFFFFF (suggested text color)",
    "aso_score": 85 (0-100),
    "benchmark_ref": "Modeled after [App Name]",
    "reasoning": "Why this works..."
  }
]
Return ONLY the JSON array. No other text.
`
            } else {
                // v2 Ghostwriter Logic (Twitter/LinkedIn/Instagram)
                return `
You are a Silicon Valley Growth Engineer (Y-Combinator style).
Your goal is to ghostwrite a high-quality "Weekly Twitter Content Schedule" for an indie developer based on their app screenshot.

${commonContext}

CONSTRAINTS:
- BAN WORDS: "Revolutionary", "Game-changer", "Unleash", "Elevate", "Excited to share", "Dive in". (No marketing fluff).
- TONE: Humble, Vulnerable, Punchy, Data-driven. Use #BuildInPublic style.
- FORMAT: You must generate a 3-day schedule (Monday, Wednesday, Friday).

TASK:
1. Analyze the screenshot to understand the "Feature" or "Value".
2. Create 3 distinct threads:
   - Monday (Origin Story): Why I built this? What was the pain point?
   - Wednesday (Feature Deep-dive): How does it work? (Explain the screenshot).
   - Friday (Social Proof/Vision): What is the result? Where are we going?

OUTPUT SCHEMA (JSON ONLY):
{
  "design_config": {
    "accent_color": "#Extracted_Hex_Code_From_Image_Or_Blue",
    "suggested_layout": "bento"
  },
  "weekly_batch": [
    {
      "day": "Monday",
      "theme": "Origin Story",
      "hook": "Click-baity first line (under 50 chars)",
      "thread": [
        "Tweet 1: The Hook (Problem)",
        "Tweet 2: The Struggle (Old Way)",
        "Tweet 3: The Solution (My App)",
        "Tweet 4: The Benefit (Result)",
        "Tweet 5: CTA (Link)"
      ]
    },
    {
      "day": "Wednesday",
      "theme": "Feature Deep-dive",
      "hook": "How-to style hook",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    },
    {
      "day": "Friday",
      "theme": "Social Proof",
      "hook": "Visionary hook",
      "thread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }
  ]
}
`
            }
        }

        const prompt = getSystemPrompt()

        let generatedCopy = null
        let lastError = null

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const message = await anthropic.messages.create({
                    model: "claude-sonnet-4-5",
                    max_tokens: 4096,
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

                // Clean up JSON string if needed
                const cleanContent = content?.replace(/```json\n|\n```/g, '') || '{}'
                generatedCopy = JSON.parse(cleanContent)

                // Validation: Support both v1 (Array) and v2 (Object)
                const isValidV1 = Array.isArray(generatedCopy) && generatedCopy.length > 0
                const isValidV2 = !Array.isArray(generatedCopy) && 'weekly_batch' in generatedCopy

                if (isValidV1 || isValidV2) {
                    break // Success!
                } else {
                    throw new Error('AI returned invalid response format')
                }
            } catch (error) {
                lastError = error as Error
                console.error(`Generation attempt ${attempt + 1} failed:`, error)

                if (attempt < MAX_RETRIES - 1) {
                    await sleep(RETRY_DELAY * (attempt + 1)) // Exponential backoff
                }
            }
        }

        if (!generatedCopy) {
            throw new Error(lastError?.message || 'AI generation failed after multiple attempts. Your credit has been restored.')
        }

        // 6. Auto-Design Engine (Day 2 Feature)
        let generatedImageUrl = publicUrl // Default to original screenshot

        if (generatedCopy && !Array.isArray(generatedCopy) && 'weekly_batch' in generatedCopy) {
            try {
                const output = generatedCopy as GhostwriterOutput
                const mondayThread = output.weekly_batch.find((d: WeeklyThread) => d.day === 'Monday')

                if (mondayThread) {
                    const { generateSocialImage } = await import('@/lib/design-engine')

                    // Extract key points for the bento grid
                    const bentoItems = mondayThread.thread.slice(0, 4).map((t: string) => t.replace(/^Tweet \d+: /, '').substring(0, 60) + '...')

                    const imageBuffer = await generateSocialImage(
                        mondayThread.hook, // Title
                        "Monday: Origin Story", // Subtitle
                        bentoItems,
                        output.design_config.accent_color || '#3B82F6'
                    )

                    // Upload generated image
                    const genFileName = `${userId}/gen_${Date.now()}.png`
                    const { error: genUploadError } = await supabase.storage
                        .from('screenshots')
                        .upload(genFileName, imageBuffer, {
                            contentType: 'image/png'
                        })

                    if (!genUploadError) {
                        const { data: { publicUrl: genPublicUrl } } = supabase.storage
                            .from('screenshots')
                            .getPublicUrl(genFileName)
                        generatedImageUrl = genPublicUrl
                    }
                }
            } catch (designError) {
                console.error('Auto-Design failed:', designError)
                // Fallback to original image, don't fail the request
            }
        }

        // 7. Save to Database (Generations table)
        const { error: dbError } = await supabase
            .from('generations')
            .insert({
                user_id: userId,
                image_url: generatedImageUrl, // Use the NEW generated image if available
                input_context: { appName, category, targetAudience, tone, description, keywords, language, platform },
                output_copy: generatedCopy,
            })

        if (dbError) {
            console.error('DB Error:', dbError)
            throw new Error(`Failed to save history: ${dbError.message}`)
        }

        // 8. Log Transaction
        await supabase.from('transactions').insert({
            user_id: userId,
            amount: -1,
            type: 'generation'
        })

        return NextResponse.json({
            success: true,
            data: generatedCopy,
            imageUrl: generatedImageUrl
        })

    } catch (error: unknown) {
        console.error('Generation error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

        // CRITICAL: Restore credit if it was deducted but generation failed
        if (creditDeducted && userId) {
            try {
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('credits')
                    .eq('id', userId)
                    .single()

                if (currentProfile) {
                    await supabase
                        .from('profiles')
                        .update({ credits: currentProfile.credits + 1 })
                        .eq('id', userId)

                    await supabase.from('transactions').insert({
                        user_id: userId,
                        amount: 1,
                        type: 'refund',
                        reason: `Generation failed: ${errorMessage}`
                    })

                    console.log('Credit restored to user:', userId)
                }
            } catch (restoreError) {
                console.error('Failed to restore credit:', restoreError)
            }
        }

        return NextResponse.json({
            error: errorMessage || 'An unexpected error occurred. Please try again.'
        }, { status: 500 })
    }
}
