'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PricingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const PRICING_TIERS = [
    {
        id: 'starter',
        name: 'Starter Pack',
        credits: 10,
        price: 5,
        priceId: 'price_starter_placeholder', // REPLACE WITH REAL STRIPE PRICE ID
        features: ['10 AI Generations', 'High Quality Images', 'Commercial Use'],
        popular: false
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        credits: 50,
        price: 19,
        priceId: 'price_pro_placeholder', // REPLACE WITH REAL STRIPE PRICE ID
        features: ['50 AI Generations', 'Priority Support', 'Commercial Use', 'Save 20%'],
        popular: true
    },
    {
        id: 'agency',
        name: 'Agency Pack',
        credits: 150,
        price: 49,
        priceId: 'price_agency_placeholder', // REPLACE WITH REAL STRIPE PRICE ID
        features: ['150 AI Generations', 'Dedicated Support', 'Commercial Use', 'Save 33%'],
        popular: false
    }
]

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleCheckout = async (tier: typeof PRICING_TIERS[0]) => {
        try {
            setLoading(tier.id)
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: tier.priceId,
                    credits: tier.credits,
                }),
            })

            const data = await response.json()

            if (!response.ok) throw new Error('Checkout failed')

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast.error('Failed to start checkout')
        } finally {
            setLoading(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold">Top Up Credits</DialogTitle>
                    <DialogDescription className="text-center">
                        Choose a package to continue generating high-converting screenshots.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {PRICING_TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative p-6 rounded-xl border-2 transition-all ${tier.popular
                                ? 'border-primary bg-primary/5 shadow-lg scale-105'
                                : 'border-muted hover:border-primary/50'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="font-bold text-lg">{tier.name}</h3>
                                <div className="flex items-baseline justify-center gap-1 mt-2">
                                    <span className="text-3xl font-bold">${tier.price}</span>
                                    <span className="text-muted-foreground">/ {tier.credits} credits</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={tier.popular ? 'default' : 'outline'}
                                onClick={() => handleCheckout(tier)}
                                disabled={!!loading}
                            >
                                {loading === tier.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Buy Now
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
