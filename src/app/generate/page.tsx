'use client'

import { useState } from 'react'
import { UploadZone } from '@/components/upload-zone'
import { ContextForm, ContextFormData } from '@/components/context-form'
import { ResultCard, GeneratedCopy } from '@/components/result-card'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function GeneratePage() {
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<GeneratedCopy[] | null>(null)

    const handleGenerate = async (data: ContextFormData) => {
        if (!file) {
            toast.error('Please upload a screenshot first')
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('appName', data.appName)
            formData.append('category', data.category)
            formData.append('targetAudience', data.targetAudience)
            formData.append('tone', data.tone)
            formData.append('description', data.description)

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
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const resetGeneration = () => {
        setResults(null)
        setFile(null)
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
                            onRefine={(refinedCopy) => handleRefine(index, refinedCopy)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Generate App Store Copy</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Upload Screenshot</h2>
                    <UploadZone
                        onImageSelect={setFile}
                        selectedImage={file}
                        onClear={() => setFile(null)}
                    />
                    <p className="text-sm text-gray-500">
                        Upload a clear screenshot of your app. We support PNG, JPG, and WebP.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">2. Provide Context</h2>
                    <ContextForm
                        onSubmit={handleGenerate}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}
