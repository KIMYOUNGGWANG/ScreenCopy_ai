
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { priceId, quantity = 1, credits } = await req.json()

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity,
                },
            ],
            metadata: {
                userId: session.user.id,
                credits: credits.toString(), // Pass credits amount to webhook
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
