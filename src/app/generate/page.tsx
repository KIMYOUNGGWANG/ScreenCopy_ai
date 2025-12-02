'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UploadZone } from '@/components/upload-zone'
import { ContextForm, ContextFormData } from '@/components/context-form'
import { ResultCard, GeneratedCopy } from '@/components/result-card'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { GenerationLoading } from '@/components/generation-loading'

export default function GeneratePage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<GeneratedCopy[] | null>(null)
    const [contextData, setContextData] = useState<ContextFormData | null>(null)
    const [initialValues, setInitialValues] = useState<Partial<ContextFormData> | undefined>(undefined)

    const handleGenerate = async (data: ContextFormData) => {
        if (!file) {
            toast.error('Please upload a screenshot first')
            return
        }

        setError(null)
        setIsGenerating(true)
        setContextData(data)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('appName', data.appName)
            formData.append('category', data.category)
            formData.append('targetAudience', data.targetAudience)
            formData.append('tone', data.tone)
            formData.append('description', data.description)
            if (data.keywords) formData.append('keywords', data.keywords)
            formData.append('language', data.language)
            formData.append('platform', data.platform)

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate copy')
            }

            toast.success('Copy generated successfully!')
            setResults(result.data)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            setError(errorMessage)
            toast.error(errorMessage, {
                duration: 5000,
                description: "Don't worry, your credit has been restored."
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDemoClick = async () => {
        try {
            // Load a placeholder image
            const response = await fetch('https://placehold.co/1080x1920/png?text=App+Screenshot')
            const blob = await response.blob()
            const demoFile = new File([blob], "demo_screenshot.png", { type: "image/png" })

            setFile(demoFile)
            setPreviewUrl(URL.createObjectURL(demoFile))

            setInitialValues({
                appName: "FitLife Pro",
                category: "health",
                targetAudience: "Busy professionals wanting to stay fit",
                tone: "inspirational",
                description: "A fitness app that creates 15-minute home workout routines for busy people.",
                keywords: "fitness, home workout, quick, health",
                language: "English"
            })

            toast.success('Demo data loaded! Click "Generate Copy" to try.')
        } catch (error) {
            console.error('Demo load error:', error)
            toast.error('Failed to load demo data')
        }
    }

    const handleImageSelect = async (selectedFile: File) => {
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))

        // Start Auto-fill Analysis
        setIsAnalyzing(true)
        const toastId = toast.loading('Analyzing screenshot context...')

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Analysis failed')
            }

            if (result.success && result.data) {
                setInitialValues(result.data)
                toast.success('Context auto-filled!', { id: toastId })
            }
        } catch (error) {
            console.error('Analysis error:', error)
            toast.dismiss(toastId)
            // Silent fail or small notification
        } finally {
            setIsAnalyzing(false)
        }
    }

    const resetGeneration = () => {
        setResults(null)
        setFile(null)
        setPreviewUrl(null)
    }

    const handleRefine = (index: number, refinedCopy: GeneratedCopy) => {
        if (!results) return
        const newResults = [...results]
        newResults[index] = refinedCopy
        setResults(newResults)
    }

    if (results) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <Button
                    variant="ghost"
                    onClick={resetGeneration}
                    className="mb-6 gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Generate New
                </Button>

                <h1 className="text-3xl font-bold mb-2 text-center">Generated Copy Options</h1>
                <p className="text-center text-muted-foreground mb-8">
                    Choose the best headline for your App Store screenshot.
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((copy, index) => (
                        <ResultCard
                            key={index}
                            copy={copy}
                            index={index}
                            imageUrl={previewUrl}
                            onRefine={(refinedCopy) => handleRefine(index, refinedCopy)}
                            isExpanded={true}
                            context={contextData!}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Generate Copy</h1>
                <Button asChild variant="ghost" className="gap-2">
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Upload Screenshot</CardTitle>
                                <CardDescription>
                                    Upload your app screenshot to generate optimized copy.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDemoClick}>
                                Try Demo Image
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <UploadZone
                                onImageSelect={handleImageSelect}
                                selectedImage={file}
                                onClear={() => {
                                    setFile(null)
                                    setPreviewUrl(null)
                                }}
                            />
                            <ContextForm
                                onSubmit={handleGenerate}
                                isLoading={isGenerating}
                                initialValues={initialValues}
                                isAnalyzing={isAnalyzing}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {isGenerating ? (
                        <GenerationLoading imageUrl={previewUrl} />
                    ) : results ? (
                        <div className="grid gap-6">
                            {(results as GeneratedCopy[]).map((copy, index) => (
                                <div key={index} className="w-full">
                                    <ResultCard
                                        copy={copy}
                                        index={index}
                                        imageUrl={previewUrl}
                                        onRefine={(refined) => handleRefine(index, refined)}
                                        isExpanded={true}
                                        context={contextData!}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-red-200 bg-red-50 rounded-lg">
                            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-red-900 mb-2">Generation Failed</h3>
                            <p className="text-red-700 max-w-xs mb-6">{error}</p>
                            <Button onClick={() => setError(null)} variant="outline" className="border-red-200 hover:bg-red-100 text-red-700">
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50">
                            <p>Generated results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
