'use client'

import { useState, useRef } from 'react'
import { CopyDemo, CopyDemoState } from '@/components/copy-demo'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function CopyDemoSection() {
    const [demoState, setDemoState] = useState<CopyDemoState>('idle')
    const containerRef = useRef<HTMLDivElement>(null)

    const handleDemo = () => {
        if (demoState === 'complete') {
            setDemoState('idle')
            setTimeout(() => setDemoState('analyzing'), 50)
        } else {
            setDemoState('analyzing')
        }

        setTimeout(() => {
            setDemoState('complete')
        }, 2000)
    }

    return (
        <section id="demo" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Not Just Visuals. <br />
                        <span className="text-neon-cyan">High-Converting Copy</span>, Instantly.
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">
                        Our AI analyzes your screenshot to write ASO-optimized headlines and descriptions that drive downloads.
                    </p>

                    <Button
                        size="lg"
                        onClick={handleDemo}
                        disabled={demoState === 'analyzing'}
                        className="bg-white text-black hover:bg-slate-200 rounded-full px-8 h-12 font-bold"
                    >
                        {demoState === 'idle' ? 'Generate Copy Demo' : demoState === 'analyzing' ? 'Writing...' : 'Generate Again'}
                        {demoState === 'complete' && <Sparkles className="w-4 h-4 ml-2" />}
                    </Button>
                </div>

                <CopyDemo demoState={demoState} />
            </div>
        </section>
    )
}
