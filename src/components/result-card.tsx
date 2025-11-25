'use client'

import { Copy, Check, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export interface GeneratedCopy {
    headline: string
    subtext: string
    style: string
    reasoning: string
}

interface ResultCardProps {
    copy: GeneratedCopy
    index: number
    onRefine?: (refinedCopy: GeneratedCopy) => void
}

export function ResultCard({ copy, index, onRefine }: ResultCardProps) {
    const [copied, setCopied] = useState(false)
    const [refineOpen, setRefineOpen] = useState(false)
    const [refineInstruction, setRefineInstruction] = useState('')
    const [refining, setRefining] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copy.headline)
            setCopied(true)
            toast.success('Headline copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy text')
        }
    }

    const handleRefine = async () => {
        if (!refineInstruction.trim()) {
            toast.error('Please enter a refinement instruction')
            return
        }

        try {
            setRefining(true)
            const response = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalCopy: copy,
                    instruction: refineInstruction
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Refinement failed')
            }

            toast.success('Copy refined successfully!')
            if (onRefine) {
                onRefine({ ...result.data, style: copy.style })
            }
            setRefineOpen(false)
            setRefineInstruction('')
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refine copy'
            toast.error(errorMessage)
        } finally {
            setRefining(false)
        }
    }

    const quickRefinements = [
        "Make it shorter (5-6 words)",
        "Make it more casual and friendly",
        "Add urgency and FOMO",
        "Focus on the main benefit",
        "Make it more professional"
    ]

    return (
        <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <Badge variant="secondary" className="uppercase text-xs">
                        {copy.style}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Option {index + 1}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div>
                    <h3 className="text-xl font-bold leading-tight mb-2">{copy.headline}</h3>
                    <p className="text-sm text-muted-foreground">{copy.subtext}</p>
                </div>

                <div className="mt-auto pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3 italic">
                        &quot;{copy.reasoning}&quot;
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant={copied ? "default" : "outline"}
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>

                        <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
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
                                            value={refineInstruction}
                                            onChange={(e) => setRefineInstruction(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Quick suggestions:</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {quickRefinements.map((suggestion, i) => (
                                                <Button
                                                    key={i}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => setRefineInstruction(suggestion)}
                                                >
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleRefine}
                                        disabled={refining}
                                        className="w-full"
                                    >
                                        {refining ? 'Refining...' : 'Generate Refined Version'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
