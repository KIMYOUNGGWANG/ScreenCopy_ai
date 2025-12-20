'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Crown, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface UpgradePromptProps {
    remainingCredits?: number
    onClose?: () => void
}

export function UpgradePrompt({ remainingCredits = 0 }: UpgradePromptProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: 9,
            credits: 10,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
            features: ['10 generations', 'All platforms', 'Export to Typefully'],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 19,
            credits: 50,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
            features: ['50 generations', 'Priority processing', 'AI Magic Rewrite', 'Email support'],
            popular: true
        },
        {
            id: 'unlimited',
            name: 'Unlimited',
            price: 49,
            credits: 200,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED,
            features: ['200 generations', 'Bulk generation', 'Custom templates', 'Priority support'],
            popular: false
        }
    ]

    const handlePurchase = async (plan: typeof plans[0]) => {
        setIsLoading(plan.id)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    credits: plan.credits
                })
            })

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout')
            }
        } catch {
            toast.error('Failed to start checkout. Please try again.')
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">Loved by 1,000+ indie makers</span>
                </div>

                <h2 className="text-3xl font-bold mb-2">
                    {remainingCredits === 0 ? (
                        <>You&apos;ve used all your free credits! 🎉</>
                    ) : (
                        <>Upgrade for More Power</>
                    )}
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    {remainingCredits === 0 ? (
                        <>Your 3 free generations are done. Unlock unlimited AI-powered content with our affordable plans.</>
                    ) : (
                        <>You have {remainingCredits} credits left. Get more to keep the momentum going!</>
                    )}
                </p>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>8-second generation</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Crown className="w-4 h-4 text-purple-500" />
                    <span>Pro-grade copy</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>No subscription</span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative overflow-hidden transition-all hover:scale-105 ${plan.popular
                            ? 'border-purple-500 bg-gradient-to-b from-purple-500/10 to-transparent'
                            : 'border-slate-800 bg-slate-900'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0">
                                <Badge className="rounded-none rounded-bl-lg bg-purple-500 text-white">
                                    MOST POPULAR
                                </Badge>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>
                                <span className="text-3xl font-bold text-white">${plan.price}</span>
                                <span className="text-muted-foreground"> one-time</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                variant={plan.popular ? 'default' : 'outline'}
                                onClick={() => handlePurchase(plan)}
                                disabled={isLoading !== null}
                            >
                                {isLoading === plan.id ? (
                                    'Loading...'
                                ) : (
                                    <>
                                        Get {plan.credits} Credits
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
                <p>🔒 Secure payment via Stripe • 💳 No recurring charges • ✅ Instant delivery</p>
            </div>
        </div>
    )
}
