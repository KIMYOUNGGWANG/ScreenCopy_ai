import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GhostwriterOutput, WeeklyThread } from '@/types/generation'
import { getAIClient } from '@/lib/ai/client'


export async function POST(request: Request) {
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
        // Note: imageBuffer was removed as it's not used; image is passed via file to AI provider

        const platform = formData.get('platform') as string || 'app_store'

        // 5. Call AI Provider (Gemini or Claude)
        let generatedCopy = null
        try {
            const aiClient = getAIClient()
            const result = await aiClient.generateCopy({
                file,
                context: {
                    appName,
                    category,
                    targetAudience,
                    tone,
                    description,
                    keywords,
                    language,
                    platform
                }
            })
            generatedCopy = result.generatedCopy
        } catch (error) {
            console.error('AI Generation failed:', error)
            throw new Error('AI generation failed. Your credit has been restored.')
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
        const { data: insertedGeneration, error: dbError } = await supabase
            .from('generations')
            .insert({
                user_id: userId,
                image_url: generatedImageUrl, // Use the NEW generated image if available
                input_context: { appName, category, targetAudience, tone, description, keywords, language, platform },
                output_copy: generatedCopy,
            })
            .select()
            .single()

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
            imageUrl: generatedImageUrl,
            id: insertedGeneration.id
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
