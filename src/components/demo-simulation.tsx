
"use client"

import { useState, useEffect } from "react"
import { Copy, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function DemoSimulation() {
    const [step, setStep] = useState(0)

    // Animation sequence
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 4)
        }, 4000) // Loop every 4 seconds for the whole cycle? No, that's too fast.

        // Let's do a one-time sequence that loops
        // 0: Idle/Start
        // 1: Scanning
        // 2: Analyzing
        // 3: Results

        return () => clearInterval(timer)
    }, [])

    // Better approach: Custom timeout sequence
    useEffect(() => {
        const runSequence = () => {
            setStep(0) // Reset
            setTimeout(() => setStep(1), 1000) // Start Scanning
            setTimeout(() => setStep(2), 3000) // Analyzing (gave scanning 2s)
            setTimeout(() => setStep(3), 5000) // Show Results (gave analyzing 2s)
            setTimeout(() => runSequence(), 12000) // Loop after 12s (Results visible for 7s)
        }

        runSequence()
        return () => { } // Cleanup not strictly necessary for this simple loop logic if component unmounts
    }, [])

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
            {/* Left: Phone Mockup & Scanning Area */}
            <div className="relative w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 min-h-[450px]">
                <div className="relative w-64 h-[480px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-xl overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                    {/* Screen Content (Abstract Fitness App) */}
                    <div className="w-full h-full pt-8 px-4 flex flex-col gap-4 bg-gray-100">
                        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-40 w-full bg-blue-500 rounded-xl shadow-sm flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">Run Tracker</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-24 w-1/2 bg-white rounded-xl shadow-sm"></div>
                            <div className="h-24 w-1/2 bg-white rounded-xl shadow-sm"></div>
                        </div>
                        <div className="h-12 w-full bg-green-500 rounded-full mt-auto mb-8 shadow-lg"></div>
                    </div>

                    {/* Scanning Overlay */}
                    <div
                        className={cn(
                            "absolute inset-0 bg-blue-500/10 z-10 transition-opacity duration-500",
                            step >= 1 && step < 3 ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <div
                            className={cn(
                                "absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]",
                                step >= 1 && step < 3 ? "animate-[scan_2s_ease-in-out_infinite]" : "hidden"
                            )}
                        ></div>
                    </div>
                </div>

                {/* Floating Badges (Analysis) */}
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 transition-all duration-500",
                    step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                )}>
                    <div className="bg-white/90 backdrop-blur shadow-lg px-4 py-2 rounded-full text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" /> Detecting UI Elements...
                    </div>
                    <div className="bg-white/90 backdrop-blur shadow-lg px-4 py-2 rounded-full text-sm font-bold text-gray-800 flex items-center gap-2 delay-100">
                        <Zap className="w-4 h-4 text-yellow-500" /> Analyzing Context...
                    </div>
                </div>
            </div>

            {/* Right: Results Panel */}
            <div className="w-full md:w-1/2 p-8 flex flex-col bg-white overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        AI Generated Copy
                    </h3>
                    <p className="text-sm text-gray-500">Optimized for App Store conversion</p>
                </div>

                <div className="space-y-4 flex-1">
                    {/* Result Cards */}
                    {[
                        {
                            title: "Track Your Progress",
                            subtitle: "Visualize your running journey with detailed analytics.",
                            tag: "Professional"
                        },
                        {
                            title: "Run Smarter, Not Harder",
                            subtitle: "AI-powered insights to help you reach your goals faster.",
                            tag: "Persuasive"
                        },
                        {
                            title: "Crush Your Goals 🏃‍♂️",
                            subtitle: "Join millions of runners achieving their dreams today.",
                            tag: "Energetic"
                        }
                    ].map((card, i) => (
                        <div
                            key={i}
                            className={cn(
                                "border rounded-xl p-4 transition-all duration-500 transform",
                                step >= 3
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                            )}
                            style={{ transitionDelay: `${i * 200}ms` }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {card.tag}
                                </span>
                                <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{card.title}</h4>
                            <p className="text-sm text-gray-600">{card.subtitle}</p>
                        </div>
                    ))}
                </div>

                {/* Loading State for Results */}
                <div className={cn(
                    "flex-1 flex items-center justify-center text-gray-400 gap-2",
                    step < 3 ? "flex" : "hidden"
                )}>
                    {step >= 1 && (
                        <>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                        </>
                    )}
                    {step === 0 && "Waiting for upload..."}
                </div>
            </div>
        </div>
    )
}
