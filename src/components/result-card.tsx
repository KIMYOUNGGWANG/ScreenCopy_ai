'use client'

import { Copy, Check, Wand2, GripHorizontal } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { RefinementDialog } from './refinement-dialog'
import { ContextFormData } from './context-form'

export interface GeneratedCopy {
    headline: string
    subtext: string
    style: string
    layout: 'top' | 'bottom' | 'center' | 'split'
    color_hex: string
    aso_score: number
    benchmark_ref: string
    reasoning: string
}

interface ResultCardProps {
    copy: GeneratedCopy
    index: number
    imageUrl?: string | null
    onRefine?: (refinedCopy: GeneratedCopy) => void
    isExpanded?: boolean
    context: ContextFormData
}

const FONT_STYLES = [
    { name: 'Modern', class: 'font-sans' },
    { name: 'Impact', class: 'font-extrabold tracking-tight' },
    { name: 'Elegant', class: 'font-serif' },
    { name: 'Playful', class: 'font-mono' },
]

export function ResultCard({ copy, index, imageUrl, onRefine, isExpanded = false, context }: ResultCardProps) {
    const [copied, setCopied] = useState(false)
    const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview')
    const [currentFontIndex, setCurrentFontIndex] = useState(0)

    // Local state for editable text
    const [headline, setHeadline] = useState(copy.headline)
    const [subtext, setSubtext] = useState(copy.subtext)

    // Update local state when prop changes
    useEffect(() => {
        setHeadline(copy.headline)
        setSubtext(copy.subtext)
    }, [copy.headline, copy.subtext])

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

    const toggleStyle = () => {
        setCurrentFontIndex((prev) => (prev + 1) % FONT_STYLES.length)
    }

    const getLayoutClasses = (layout: string) => {
        switch (layout) {
            case 'top': return 'justify-start pt-12'
            case 'bottom': return 'justify-end pb-12'
            case 'center': return 'justify-center'
            case 'split': return 'justify-between py-12'
            default: return 'justify-center'
        }
    }

    return (
        <Card className="h-full flex flex-col hover:border-primary/50 transition-colors overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 flex-wrap gap-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="uppercase text-xs">
                        {copy.style}
                    </Badge>
                    <Badge variant={copy.aso_score >= 80 ? "default" : "outline"} className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                        ASO {copy.aso_score}
                    </Badge>
                </div>
                <div className="flex bg-muted rounded-md p-0.5">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${viewMode === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('text')}
                        className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${viewMode === 'text' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Text
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-0">
                {viewMode === 'preview' && imageUrl ? (
                    <div className="relative aspect-[9/16] w-full bg-black overflow-hidden group">
                        {/* Image Layer (Blurred Background for Fill) */}
                        <div className="absolute inset-0 opacity-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Background"
                                className="w-full h-full object-cover blur-xl scale-110"
                            />
                        </div>

                        {/* Image Layer (Main Image - Contain) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="App Screenshot"
                                className="w-full h-full object-contain z-10"
                            />
                            {/* Overlay Gradient on top of image */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-20" />
                        </div>

                        {/* iOS Status Bar Simulation */}
                        <div className="absolute top-0 inset-x-0 h-8 z-40 flex items-center justify-between px-6 text-white text-[10px] font-medium opacity-90">
                            <span>9:41</span>
                            <div className="flex items-center gap-1.5">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M1.41 9.32c.39-.39 1.02-.39 1.41 0l1.26 1.26c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L2.83 6.5c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.26 1.26c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zm21.18 0c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.26-1.26c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.26 1.26c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0zM12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" /></svg>
                                <div className="w-4 h-2.5 border border-white rounded-[2px] relative">
                                    <div className="absolute inset-0.5 bg-white rounded-[1px]" />
                                </div>
                            </div>
                        </div>

                        {/* Text Layer (Draggable Area) */}
                        <div className="absolute inset-0 overflow-hidden z-30 pointer-events-none">
                            <motion.div
                                drag
                                dragMomentum={false}
                                dragConstraints={{ left: -100, right: 100, top: -200, bottom: 200 }}
                                className={`absolute inset-x-0 p-4 md:p-6 flex flex-col items-center ${getLayoutClasses(copy.layout)} cursor-grab active:cursor-grabbing pointer-events-auto group/drag`}
                            >
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`relative text-center transition-all duration-300 ${FONT_STYLES[currentFontIndex].class} bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 w-[95%] mx-auto hyphens-none group-hover/drag:border-white/30`}
                                                style={{ color: copy.color_hex || '#ffffff' }}
                                            >
                                                {/* Drag Handle */}
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-full p-1 opacity-50 group-hover/drag:opacity-100 transition-opacity">
                                                    <GripHorizontal className="w-4 h-4 text-white" />
                                                </div>

                                                <h3
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => setHeadline(e.currentTarget.textContent || '')}
                                                    className={`text-lg md:text-2xl font-bold leading-tight mb-2 drop-shadow-lg outline-none focus:bg-white/10 rounded px-1 ${isExpanded ? '' : 'line-clamp-4'}`}
                                                >
                                                    {headline}
                                                </h3>
                                                <p
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => setSubtext(e.currentTarget.textContent || '')}
                                                    className={`text-xs md:text-sm font-medium drop-shadow-md opacity-90 outline-none focus:bg-white/10 rounded px-1 ${isExpanded ? '' : 'line-clamp-3'}`}
                                                >
                                                    {subtext}
                                                </p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-black/80 text-white border-none text-xs">
                                            <p>Drag to position • Click to edit</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        </div>

                        {/* Style Shuffle Button */}
                        <button
                            onClick={toggleStyle}
                            className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-20"
                            title="Shuffle Font Style"
                        >
                            <Wand2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="p-6 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold leading-tight">{headline}</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(headline)
                                        toast.success('Headline copied!')
                                    }}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-muted-foreground">{subtext}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(subtext)
                                        toast.success('Subtext copied!')
                                    }}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-xs text-muted-foreground border-l-2 pl-2">
                            <p className="italic">&quot;{copy.reasoning}&quot;</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-semibold text-neon-cyan">Benchmark:</span>
                                <span>{copy.benchmark_ref}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-auto p-4 pt-0">
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

                        <RefinementDialog
                            copy={copy}
                            onRefine={(refined) => onRefine && onRefine(refined)}
                            context={context}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
