'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ResultCard, GeneratedCopy } from '@/components/result-card'
import { ContextFormData } from '@/components/context-form'

export type CopyDemoState = 'idle' | 'analyzing' | 'complete'

const MOCK_CONTEXT: ContextFormData = {
    appName: "FitLife Pro",
    category: "health",
    targetAudience: "Busy professionals",
    tone: "inspirational",
    description: "Home workout app",
    keywords: "fitness, home, quick",
    language: "English",
    platform: "app_store"
}

const MOCK_RESULTS: GeneratedCopy[] = [
    {
        headline: "Stop Wasting Hours on Gym Commutes",
        subtext: "Get a full-body workout in 15 minutes at home. No equipment, just results. Join 50k+ users transforming their bodies.",
        style: "Pain-Agitation-Solution",
        layout: "top",
        color_hex: "#ef4444",
        aso_score: 92,
        benchmark_ref: "Modeled after Calm",
        reasoning: "Highlights the pain of commuting to position the app as the time-saving solution."
    },
    {
        headline: "Your Personal Trainer in Your Pocket",
        subtext: "AI-powered plans that adapt to your progress. Reach your fitness goals 3x faster with real-time form correction.",
        style: "Benefit Driven",
        layout: "bottom",
        color_hex: "#3b82f6",
        aso_score: 88,
        benchmark_ref: "Modeled after Nike Training Club",
        reasoning: "Focuses on the core benefit of having professional guidance anywhere."
    },
    {
        headline: "Become the Best Version of Yourself",
        subtext: "Join 50,000+ busy professionals transforming their lives with FitLife Pro. Start your journey today.",
        style: "Emotional",
        layout: "center",
        color_hex: "#10b981",
        aso_score: 85,
        benchmark_ref: "Modeled after Headspace",
        reasoning: "Appeals to the user's desire for self-improvement and social proof."
    }
]

export function CopyDemo({ demoState = 'idle' }: { demoState?: CopyDemoState }) {
    // Internal state for auto-loop if needed, but we'll control it from parent
    const currentState = demoState

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="relative min-h-[600px] bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-8">

                {/* Header UI */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs font-mono text-slate-500">AI Copy Generator v1.0</div>
                </div>

                <AnimatePresence mode="wait">
                    {currentState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-lg">
                                <Sparkles className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 mb-2">Ready to Generate</h3>
                            <p className="text-slate-500 max-w-md">
                                Click &quot;Generate Copy Demo&quot; to see how AI creates high-converting headlines for your app.
                            </p>
                        </motion.div>
                    )}

                    {currentState === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10"
                        >
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-neon-cyan/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-neon-cyan animate-pulse" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-neon-cyan font-mono text-sm animate-pulse">Analyzing Screenshot Context...</p>
                                <p className="text-slate-500 text-xs">Identifying keywords: Fitness, Home, AI, Quick</p>
                            </div>
                        </motion.div>
                    )}

                    {currentState === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, staggerChildren: 0.1 }}
                            className="grid md:grid-cols-3 gap-6 h-full"
                        >
                            {MOCK_RESULTS.map((result, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.15 }}
                                    className="h-full"
                                >
                                    <ResultCard
                                        copy={result}
                                        index={index}
                                        imageUrl="https://placehold.co/1080x1920/png?text=FitLife+Pro" // Placeholder for demo
                                        context={MOCK_CONTEXT}
                                        isExpanded={true}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
