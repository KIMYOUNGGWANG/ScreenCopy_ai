import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: unknown) {
        return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown Error'}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const userId = session.metadata?.userId
        const credits = Number(session.metadata?.credits)

        if (!userId || !credits) {
            return new NextResponse('Webhook Error: Missing metadata', { status: 400 })
        }

        // 1. Update User Credits
        const { error: updateError } = await supabase.rpc('increment_credits', {
            user_id: userId,
            amount: credits
        })

        // Fallback if RPC doesn't exist (though RPC is safer for concurrency)
        if (updateError) {
            console.error('RPC Error, falling back to direct update:', updateError)

            // Fetch current credits
            const { data: profile } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single()

            if (profile) {
                const { error: directUpdateError } = await supabase
                    .from('profiles')
                    .update({ credits: (profile.credits || 0) + credits })
                    .eq('id', userId)

                if (directUpdateError) {
                    console.error('Direct Update Error:', directUpdateError)
                    return new NextResponse('Database Error', { status: 500 })
                }
            }
        }

        // 2. Record Transaction
        await supabase.from('transactions').insert({
            user_id: userId,
            amount: session.amount_total ? session.amount_total / 100 : 0, // Store in dollars/won
            type: 'purchase',
            reason: `Purchased ${credits} credits`,
        })
    }

    return new NextResponse(null, { status: 200 })
}
