import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current credits
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error('Error fetching profile:', fetchError)
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const currentCredits = profile?.credits || 0
    const newCredits = currentCredits + 50

    // Upsert credits (create if not exists, update if exists)
    const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: userId, credits: newCredits })
        .select()

    if (updateError) {
        console.error('Error updating credits:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, credits: newCredits })
}
