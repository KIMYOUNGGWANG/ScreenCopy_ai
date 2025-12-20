import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAIClient } from '@/lib/ai/client'

export async function POST(request: Request) {
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

        // 3. Call AI Provider
        const aiClient = getAIClient()
        const analysisResult = await aiClient.analyzeImage(file)

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
