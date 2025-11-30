import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

const LOADING_STEPS = [
    "Analyzing your screenshot...",
    "Finding the perfect spot for text...",
    "Researching top-performing styles...",
    "Writing catchy headlines...",
    "Optimizing for more downloads...",
    "Polishing the final look..."
]

interface GenerationLoadingProps {
    imageUrl?: string | null
}

export function GenerationLoading({ imageUrl }: GenerationLoadingProps) {
    const [loadingStep, setLoadingStep] = useState(0)

    useEffect(() => {
        setLoadingStep(0)
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 border-primary/20 bg-primary/5">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-primary/20 shadow-lg bg-black/5">
                {imageUrl ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="Analyzing"
                            className="w-full h-full object-cover opacity-80"
                        />
                        {/* Scanning Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scan" style={{ height: '200%', top: '-50%' }} />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <span className="text-4xl">🤖</span>
                    </div>
                )}
            </div>

            <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold animate-pulse">Creating Magic...</h3>
                <p className="text-muted-foreground transition-all duration-500 min-h-[24px] font-medium">
                    {LOADING_STEPS[loadingStep]}
                </p>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(50%); }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </Card>
    )
}
