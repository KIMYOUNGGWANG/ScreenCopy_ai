'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Star, ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { HistorySkeleton } from '@/components/ui/skeleton'
import { GeneratedCopy } from '@/components/result-card'

interface Generation {
    id: string
    created_at: string
    image_url: string
    input_context: {
        appName: string
        category: string
        tone: string
        [key: string]: unknown
    }
    output_copy: GeneratedCopy[]
    is_favorite?: boolean
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResultCard } from '@/components/result-card'
import { ContextFormData } from '@/components/context-form'

export default function HistoryPage() {
    const [generations, setGenerations] = useState<Generation[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function loadGenerations() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const { data, error } = await supabase
                    .from('generations')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setGenerations(data || [])
            } catch (error) {
                console.error('Error loading generations:', error)
                toast.error('Failed to load history')
            } finally {
                setLoading(false)
            }
        }
        loadGenerations()
    }, [supabase])

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation() // Prevent card click
        if (!confirm('Are you sure you want to delete this?')) return

        try {
            const { error } = await supabase
                .from('generations')
                .delete()
                .eq('id', id)

            if (error) throw error

            setGenerations(prev => prev.filter(g => g.id !== id))
            toast.success('Generation deleted')
            if (selectedGeneration?.id === id) setSelectedGeneration(null)
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete')
        }
    }

    async function handleToggleFavorite(id: string, currentStatus: boolean, e: React.MouseEvent) {
        e.stopPropagation() // Prevent card click
        try {
            const { error } = await supabase
                .from('generations')
                .update({ is_favorite: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setGenerations(prev =>
                prev.map(g =>
                    g.id === id ? { ...g, is_favorite: !currentStatus } : g
                )
            )
            toast.success(!currentStatus ? 'Added to favorites' : 'Removed from favorites')
        } catch (error) {
            console.error('Favorite error:', error)
            toast.error('Failed to update favorite')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8">Generation History</h1>
                <HistorySkeleton />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-6">
                <Button asChild variant="ghost" className="gap-2">
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <h1 className="text-3xl font-bold mb-8">Generation History</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {generations?.map((gen) => (
                    <Card
                        key={gen.id}
                        className="overflow-hidden flex flex-col group cursor-pointer hover:border-primary transition-all hover:shadow-md"
                        onClick={() => setSelectedGeneration(gen)}
                    >
                        <div className="aspect-video relative bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={gen.image_url}
                                alt="Screenshot"
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-none gap-1.5 hover:bg-black/70">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(gen.created_at), { addSuffix: true })}
                                </Badge>
                            </div>
                            {/* Action Buttons */}
                            <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 bg-white/90 backdrop-blur-sm"
                                    onClick={(e) => handleToggleFavorite(gen.id, gen.is_favorite || false, e)}
                                >
                                    <Star
                                        className={`h-4 w-4 ${gen.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                    />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={(e) => handleDelete(gen.id, e)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg truncate flex items-center gap-2">
                                {gen.input_context.appName}
                                {gen.is_favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            </CardTitle>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline">{gen.input_context.category}</Badge>
                                <Badge variant="outline">{gen.input_context.tone}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2">
                                {gen.output_copy.slice(0, 2).map((copy: GeneratedCopy, i: number) => (
                                    <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                                        <p className="font-medium line-clamp-2">{copy.headline}</p>
                                    </div>
                                ))}
                                {gen.output_copy.length > 2 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        + {gen.output_copy.length - 2} more options
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {generations?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <p>No generations yet. Start creating!</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedGeneration} onOpenChange={(open) => !open && setSelectedGeneration(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Generation Details</DialogTitle>
                    </DialogHeader>

                    {selectedGeneration && (
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            {selectedGeneration.output_copy.map((copy, index) => (
                                <div key={index} className="w-full">
                                    <ResultCard
                                        copy={copy}
                                        index={index}
                                        imageUrl={selectedGeneration.image_url}
                                        isExpanded={true}
                                        context={selectedGeneration.input_context as unknown as ContextFormData}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
