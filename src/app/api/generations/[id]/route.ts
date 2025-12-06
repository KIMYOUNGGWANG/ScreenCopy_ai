import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { output_copy } = body

        if (!output_copy) {
            return NextResponse.json({ error: 'Missing output_copy' }, { status: 400 })
        }

        // Verify ownership
        const { data: generation } = await supabase
            .from('generations')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!generation || generation.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { error } = await supabase
            .from('generations')
            .update({ output_copy })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update error:', error)
        return NextResponse.json({ error: 'Failed to update generation' }, { status: 500 })
    }
}
