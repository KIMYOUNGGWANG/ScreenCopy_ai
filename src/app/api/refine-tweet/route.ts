import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAIClient } from '@/lib/ai/client'

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { text, instruction, context } = await request.json()

        if (!text || !instruction) {
            return NextResponse.json({ error: 'Missing text or instruction' }, { status: 400 })
        }

        // 2. Call AI Provider
        const aiClient = getAIClient()
        const refinedText = await aiClient.refineText({
            text,
            instruction,
            context
        })

        return NextResponse.json({ refinedText })

    } catch (error) {
        console.error('Refine error:', error)
        return NextResponse.json({ error: 'Failed to refine text' }, { status: 500 })
    }
}
