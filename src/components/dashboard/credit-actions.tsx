'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PricingModal } from '@/components/pricing-modal'
import { RefillButton } from '@/components/dashboard/refill-button'

export function CreditActions() {
    const [pricingOpen, setPricingOpen] = useState(false)

    return (
        <>
            <Button
                variant="default"
                className="w-full mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                onClick={() => setPricingOpen(true)}
            >
                Buy More Credits
            </Button>

            {/* Keep RefillButton for testing if needed, or remove if strictly production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="opacity-50 hover:opacity-100 transition-opacity">
                    <RefillButton />
                </div>
            )}

            <PricingModal
                open={pricingOpen}
                onOpenChange={setPricingOpen}
            />
        </>
    )
}
