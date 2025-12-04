'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BentoGridTemplate } from '@/components/templates/bento-grid'
import { ArrowRight, Sparkles, Smartphone } from 'lucide-react'

export type DemoState = 'idle' | 'loading' | 'complete'

export function HeroDemo({ showTitle = true, demoState }: { showTitle?: boolean, demoState?: DemoState }) {
    // Internal state for auto-looping if no external control
    const [internalState, setInternalState] = useState<DemoState>('idle')

    // Auto-loop logic
    useEffect(() => {
        // Don't auto-loop if controlled externally (i.e., demoState prop is explicitly provided)
        if (demoState !== undefined) return

        let timeoutId: NodeJS.Timeout | undefined

        const runLoop = () => {
            if (internalState === 'idle') {
                timeoutId = setTimeout(() => setInternalState('loading'), 3000)
            } else if (internalState === 'loading') {
                timeoutId = setTimeout(() => setInternalState('complete'), 2000)
            } else if (internalState === 'complete') {
                timeoutId = setTimeout(() => setInternalState('idle'), 4000)
            }
        }

        runLoop()

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [internalState, demoState])

    // Use external state if provided, otherwise internal loop
    const currentState = demoState !== undefined ? demoState : internalState

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            {showTitle && (
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Turn Screenshots into <span className="text-blue-400">Viral Content</span>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-2">
                        Stop posting raw screenshots. Let AI design and write for you.
                    </p>
                </div>
            )}

            <div className="relative aspect-video w-full bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-2xl group">

                {/* Label Badge */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-white transition-all">
                    <span className={currentState === 'idle' ? "text-blue-400" : "text-slate-500"}>Raw Screenshot</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className={currentState === 'complete' ? "text-green-400" : "text-slate-500"}>Viral Post</span>
                </div>

                <AnimatePresence mode="wait">
                    {(currentState === 'idle' || currentState === 'loading') && (
                        <motion.div
                            key="before"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "brightness(2)" }} // Flash effect on exit
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-900"
                        >
                            {/* Mock Raw Screenshot */}
                            <div className="w-[280px] h-[500px] bg-white rounded-[30px] border-[8px] border-slate-800 overflow-hidden relative shadow-xl transform rotate-[-5deg] transition-transform duration-700">
                                <div className="absolute top-0 inset-x-0 h-6 bg-slate-100 flex items-center justify-center gap-1">
                                    <div className="w-12 h-4 bg-black rounded-b-xl"></div>
                                </div>
                                <div className="p-4 pt-10 space-y-4 opacity-50">
                                    <div className="w-full h-32 bg-slate-200 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                                        <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                                    </div>
                                    <div className="w-full h-20 bg-slate-200 rounded-lg"></div>
                                    <div className="w-full h-20 bg-slate-200 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="w-full h-4 bg-slate-200 rounded"></div>
                                        <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
                                        <div className="w-4/6 h-4 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/10 backdrop-blur-[2px] p-4 rounded-xl text-slate-800 font-mono text-xs text-center">
                                        Raw Screenshot<br />(Boring...)
                                    </div>
                                </div>

                                {/* Scanning Overlay */}
                                {currentState === 'loading' && (
                                    <motion.div
                                        initial={{ top: "-10%" }}
                                        animate={{ top: "110%" }}
                                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                        className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent z-10"
                                    >
                                        <div className="w-full h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Scanning Text */}
                            {currentState === 'loading' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-10 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-blue-500/30 text-blue-400 font-mono text-sm flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    AI Analyzing Layout...
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {currentState === 'complete' && (
                        <motion.div
                            key="after"
                            initial={{ opacity: 0, scale: 0.95, filter: "brightness(2)" }} // Flash in
                            animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
                            transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
                            className="absolute inset-0"
                        >
                            {/* Render the actual Bento Template */}
                            <div className="w-full h-full transform scale-[0.8] origin-center">
                                <BentoGridTemplate
                                    title="FitLife Pro: Home Workouts"
                                    subtitle="Get fit in 15 mins/day. No equipment needed."
                                    items={[
                                        "Personalized AI Plans",
                                        "Real-time Form Correction",
                                        "Gamified Progress Tracking",
                                        "Community Challenges"
                                    ]}
                                    accentColor="#10b981" // Emerald
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
