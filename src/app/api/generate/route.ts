
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

        // 5. Call Anthropic Claude 4.5 Sonnet with Retry Logic
        const prompt = `
You are an expert App Store marketer. Analyze this screenshot and create 5 compelling marketing headlines.

CONTEXT:
- App Name: ${appName}
- Category: ${category}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- App Description: ${description}

TASK:
Create 5 marketing headlines (6-10 words each) optimized for App Store conversion.

OUTPUT FORMAT (JSON):
[
  {
    "headline": "...",
    "subtext": "...",
    "style": "bold|subtle|feature|benefit|emotional",
    "reasoning": "..."
  }
]
Return ONLY the JSON array. No other text.
`

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
                input_context: { appName, category, targetAudience, tone, description },
                output_copy: generatedCopy,
            })

        if (dbError) {
            console.error('DB Error:', dbError)
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
