import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Wand2 } from "lucide-react"
import { toast } from "sonner"
import { GeneratedCopy } from "./result-card"
import { ContextFormData } from "./context-form"

interface RefinementDialogProps {
    copy: GeneratedCopy
    onRefine: (refinedCopy: GeneratedCopy) => void
    context: ContextFormData
}

const QUICK_REFINEMENTS = [
    "Make it shorter (5-6 words)",
    "Make it more casual and friendly",
    "Add urgency and FOMO",
    "Focus on the main benefit",
    "Make it more professional"
]

export function RefinementDialog({ copy, onRefine, context }: RefinementDialogProps) {
    const [open, setOpen] = useState(false)
    const [instruction, setInstruction] = useState('')
    const [isRefining, setIsRefining] = useState(false)

    const handleRefine = async () => {
        if (!instruction.trim()) {
            toast.error('Please enter a refinement instruction')
            return
        }

        try {
            setIsRefining(true)
            const response = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalCopy: copy,
                    instruction: instruction,
                    context: context
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Refinement failed')
            }

            toast.success('Copy refined successfully!')
            onRefine({ ...result.data, style: copy.style })
            setOpen(false)
            setInstruction('')
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refine copy'
            toast.error(errorMessage)
        } finally {
            setIsRefining(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Wand2 className="w-4 h-4" />
                    Refine
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Refine This Copy</DialogTitle>
                    <DialogDescription>
                        Tell the AI how you&apos;d like to improve this headline.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="instruction">Your instruction</Label>
                        <Input
                            id="instruction"
                            placeholder="e.g., Make it shorter and more impactful"
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Quick suggestions:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {QUICK_REFINEMENTS.map((suggestion, i) => (
                                <Button
                                    key={i}
                                    variant="secondary"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setInstruction(suggestion)}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleRefine}
                        disabled={isRefining}
                        className="w-full"
                    >
                        {isRefining ? 'Refining...' : 'Generate Refined Version'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
