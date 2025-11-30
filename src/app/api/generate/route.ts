
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })
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
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({
                error: 'Please sign in to generate copy.'
            }, { status: 401 })
        }

        userId = session.user.id

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

            /* v2 Feature: SocialSnap (Disabled for v1 Launch)
            if (platform === 'twitter') {
                return `
You are a Viral Social Media Manager specializing in Twitter/X growth.
Analyze the screenshot and write a high-engagement Twitter Thread (5 tweets).
Style: #BuildInPublic, humble but excited, professional yet personal.

${commonContext}

TASK:
Write a 5-tweet thread.
Tweet 1: The Hook (Problem statement)
Tweet 2: The Old Way (Pain point)
Tweet 3: The Solution (Reference the screenshot)
Tweet 4: The Benefit (Result)
Tweet 5: CTA (Link placeholder)

OUTPUT FORMAT (JSON ARRAY):
[
  {
    "headline": "Tweet 1 (Hook)",
    "subtext": "Tweet 2 (Pain)",
    "style": "thread",
    "layout": "split",
    "color_hex": "#1DA1F2",
    "aso_score": 90,
    "benchmark_ref": "Twitter Thread Style",
    "reasoning": "Tweet 3: [Solution Content] | Tweet 4: [Benefit Content] | Tweet 5: [CTA]" 
  }
]
(Note: Pack the full thread content into the fields creatively. Headline=T1, Subtext=T2, Reasoning=T3-T5 for now, or we adapt the UI later. Let's stick to the schema: Headline=Hook, Subtext=Main Value Prop, Reasoning=Full Thread Content)
`
            } else if (platform === 'linkedin') {
                return `
You are a LinkedIn Top Voice and Thought Leader.
Analyze the screenshot and write a professional, insight-driven LinkedIn post.
Style: Storytelling, "Broetry" (spaced out lines), professional insights.

${commonContext}

TASK:
Write a LinkedIn post structure:
1. Attention Grabbing Header
2. The "Aha" Moment (Problem/Solution)
3. Key Takeaways (Bulleted list)
4. Call to Discussion

OUTPUT FORMAT (JSON ARRAY):
[
  {
    "headline": "Attention Grabbing Header",
    "subtext": "The core insight or 'Aha' moment",
    "style": "professional",
    "layout": "center",
    "color_hex": "#0A66C2",
    "aso_score": 85,
    "benchmark_ref": "LinkedIn Viral Post",
    "reasoning": "Full post body content goes here..."
  }
]
`
            } else if (platform === 'instagram') {
                return `
You are an Instagram Growth Expert.
Analyze the screenshot and write a captivating caption.
Style: Visual, Emotional, Emoji-rich.

${commonContext}

TASK:
Write an Instagram caption:
1. Hook (First line visible)
2. Value/Story
3. Engagement Question
4. Hashtags (30 optimized tags)

OUTPUT FORMAT (JSON ARRAY):
[
  {
    "headline": "Visual Hook (Short & Punchy)",
    "subtext": "The main caption body with emojis",
    "style": "emotional",
    "layout": "bottom",
    "color_hex": "#E1306C",
    "aso_score": 88,
    "benchmark_ref": "Instagram Influencer Style",
    "reasoning": "Hashtags: #..."
  }
]
`
            } else {
            */
            // Default: App Store
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
            // }
        }

        const prompt = getSystemPrompt()

        let generatedCopy = null
        let lastError = null

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
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

                // Clean up JSON string if needed
                const cleanContent = content?.replace(/```json\n|\n```/g, '') || '[]'
                generatedCopy = JSON.parse(cleanContent)

                if (generatedCopy && Array.isArray(generatedCopy) && generatedCopy.length > 0) {
                    break // Success!
                } else {
                    throw new Error('AI returned empty response')
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

        // 6. Save to Database (Generations table)
        const { error: dbError } = await supabase
            .from('generations')
            .insert({
                user_id: userId,
                image_url: publicUrl,
                input_context: { appName, category, targetAudience, tone, description, keywords, language, platform },
                output_copy: generatedCopy,
            })

        if (dbError) {
            console.error('DB Error:', dbError)
            throw new Error(`Failed to save history: ${dbError.message}`)
        }

        // 7. Log Transaction
        await supabase.from('transactions').insert({
            user_id: userId,
            amount: -1,
            type: 'generation'
        })

        return NextResponse.json({
            success: true,
            data: generatedCopy,
            imageUrl: publicUrl
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
