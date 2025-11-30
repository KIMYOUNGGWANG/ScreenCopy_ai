'use client'

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RefillButton() {
    const router = useRouter()

    const handleRefill = async () => {
        try {
            const res = await fetch('/api/test/add-credits', { method: 'POST' })
            if (res.ok) {
                toast.success('Added 50 test credits!')
                router.refresh()
            } else {
                toast.error('Failed to add credits')
            }
        } catch {
            toast.error('Error adding credits')
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleRefill} className="mt-2 w-full">
            Refill Test Credits
        </Button>
    )
}
