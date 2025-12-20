'use client'

import { useState, useEffect } from 'react'
import { GhostwriterOutput, WeeklyThread } from '@/types/generation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Share2, Save, Loader2, Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WeeklyScheduleViewProps {
    results: GhostwriterOutput
    imageUrl?: string | null
    generationId?: string | null
    generationTime?: number | null
    onRegenerate?: () => void
}

export function WeeklyScheduleView({ results, generationId, generationTime, onRegenerate }: WeeklyScheduleViewProps) {
    const [activeTab, setActiveTab] = useState('Monday')
    const [editableResults, setEditableResults] = useState<GhostwriterOutput>(results)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [refiningIndex, setRefiningIndex] = useState<{ day: string, index: number } | null>(null)
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
    const [isRegenerating, setIsRegenerating] = useState(false)

    useEffect(() => {
        setEditableResults(results)
        setHasChanges(false)
        setFeedback(null)
    }, [results])

    const handleFeedback = async (type: 'positive' | 'negative') => {
        setFeedback(type)

        // Send feedback to analytics (could be expanded to API call)
        if (type === 'positive') {
            toast.success('Thanks for the feedback! 🎉')
        } else {
            toast('Not satisfied? Try regenerating or editing the content.', {
                action: onRegenerate ? {
                    label: 'Regenerate',
                    onClick: () => handleRegenerate()
                } : undefined
            })
        }

        // Optional: Save feedback to database
        if (generationId) {
            try {
                await fetch(`/api/generations/${generationId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback: type })
                })
            } catch {
                // Silent fail for feedback
            }
        }
    }

    const handleRegenerate = () => {
        if (onRegenerate) {
            setIsRegenerating(true)
            onRegenerate()
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Content copied to clipboard')
    }

    const handleTypefullyExport = (content: WeeklyThread) => {
        const fullText = [content.hook, ...content.thread].join('\n\n')
        navigator.clipboard.writeText(fullText)
        toast.success('Copied for Typefully! (Paste into editor)')
    }

    const handleUpdateHook = (day: string, newHook: string) => {
        const newBatch = editableResults.weekly_batch.map(d =>
            d.day === day ? { ...d, hook: newHook } : d
        )
        setEditableResults({ ...editableResults, weekly_batch: newBatch })
        setHasChanges(true)
    }

    const handleUpdateThread = (day: string, index: number, newText: string) => {
        const newBatch = editableResults.weekly_batch.map(d => {
            if (d.day === day) {
                const newThread = [...d.thread]
                newThread[index] = newText
                return { ...d, thread: newThread }
            }
            return d
        })
        setEditableResults({ ...editableResults, weekly_batch: newBatch })
        setHasChanges(true)
    }

    const handleRefineTweet = async (day: string, index: number, currentText: string, instruction: string) => {
        setRefiningIndex({ day, index })
        try {
            const response = await fetch('/api/refine-tweet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentText,
                    instruction,
                    context: editableResults.weekly_batch.find(d => d.day === day)?.theme
                })
            })

            const data = await response.json()
            if (data.refinedText) {
                handleUpdateThread(day, index, data.refinedText)
                toast.success('Tweet refined!')
            } else {
                throw new Error(data.error || 'Failed')
            }
        } catch (error) {
            toast.error('Failed to refine tweet')
            console.error(error)
        } finally {
            setRefiningIndex(null)
        }
    }

    const handleSave = async () => {
        if (!generationId) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/generations/${generationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ output_copy: editableResults })
            })

            if (!response.ok) throw new Error('Failed to save')

            toast.success('Changes saved successfully')
            setHasChanges(false)
        } catch (error) {
            toast.error('Failed to save changes')
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const getDayContent = (day: string) => {
        return editableResults.weekly_batch.find(d => d.day === day)
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header with Timer and Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                        Your Weekly Content Schedule
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                        {generationTime && (
                            <div className="flex items-center gap-1 text-green-400">
                                <Zap className="w-4 h-4" />
                                <span>Generated in {generationTime}s</span>
                            </div>
                        )}
                        <span>Click to edit • ✨ to rewrite with AI</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Feedback Buttons */}
                    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-3 ${feedback === 'positive' ? 'bg-green-500/20 text-green-400' : 'hover:bg-slate-700'}`}
                            onClick={() => handleFeedback('positive')}
                        >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {feedback === 'positive' ? 'Thanks!' : 'Good'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-3 ${feedback === 'negative' ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-700'}`}
                            onClick={() => handleFeedback('negative')}
                        >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Bad
                        </Button>
                    </div>

                    {/* Regenerate Button */}
                    {onRegenerate && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-700 hover:bg-slate-800"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </Button>
                    )}

                    {/* Save Button */}
                    {generationId && hasChanges && (
                        <Button onClick={handleSave} disabled={isSaving} className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </Button>
                    )}
                </div>
            </div>


            <Tabs defaultValue="Monday" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-900 border border-slate-800">
                        <TabsTrigger value="Monday">Monday</TabsTrigger>
                        <TabsTrigger value="Wednesday">Wednesday</TabsTrigger>
                        <TabsTrigger value="Friday">Friday</TabsTrigger>
                    </TabsList>
                </div>

                {['Monday', 'Wednesday', 'Friday'].map((day) => {
                    const content = getDayContent(day)
                    if (!content) return null

                    return (
                        <TabsContent key={day} value={day} className="space-y-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        Caption & Thread
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs border-slate-700 hover:bg-slate-800"
                                        onClick={() => handleTypefullyExport(content)}
                                    >
                                        <Share2 className="w-3 h-3 mr-2" />
                                        Copy for Typefully
                                    </Button>
                                </div>

                                <Card className="bg-slate-900 border-slate-800">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="w-full mr-4">
                                                <Badge variant="outline" className="mb-2 border-slate-700 text-slate-400">
                                                    {content.theme}
                                                </Badge>
                                                <Textarea
                                                    value={content.hook}
                                                    onChange={(e) => handleUpdateHook(day, e.target.value)}
                                                    className="text-xl font-bold text-white bg-transparent border-transparent hover:border-slate-700 focus:border-slate-700 p-0 min-h-[3rem] resize-none"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy(content.hook)}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            {content.thread.map((tweet, idx) => (
                                                <div key={idx} className="flex gap-4 group items-start relative">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono mt-1">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <Textarea
                                                            value={tweet}
                                                            onChange={(e) => handleUpdateThread(day, idx, e.target.value)}
                                                            className={`text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-transparent border-transparent hover:border-slate-700 focus:border-slate-700 p-2 min-h-[5rem] transition-colors ${refiningIndex?.day === day && refiningIndex?.index === idx ? 'animate-pulse bg-slate-800/50' : ''}`}
                                                            disabled={refiningIndex?.day === day && refiningIndex?.index === idx}
                                                        />

                                                        {/* Magic Rewrite Button */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="secondary" size="icon" className="h-6 w-6 bg-slate-800 hover:bg-slate-700 text-purple-400">
                                                                        <Sparkles className="w-3 h-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleRefineTweet(day, idx, tweet, "Make it shorter and punchier")}>
                                                                        ✂️ Make Shorter
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleRefineTweet(day, idx, tweet, "Add relevant emojis")}>
                                                                        😀 Add Emojis
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleRefineTweet(day, idx, tweet, "Make it more engaging/question")}>
                                                                        ❓ Make Engaging
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleRefineTweet(day, idx, tweet, "Fix grammar and polish tone")}>
                                                                        ✨ Fix Grammar
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>

                                                            <Button
                                                                variant="secondary"
                                                                size="icon"
                                                                className="h-6 w-6 bg-slate-800 hover:bg-slate-700"
                                                                onClick={() => handleCopy(tweet)}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-slate-800 flex gap-2">
                                            <Button className="w-full bg-white text-black hover:bg-slate-200" onClick={() => handleCopy([content.hook, ...content.thread].join('\n\n'))}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy Full Thread
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    )
}
