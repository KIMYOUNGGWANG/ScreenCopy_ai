'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const scrollHintRef = useRef<HTMLDivElement>(null);

    const [demoStep, setDemoStep] = useState<'analyzing' | 'result'>('analyzing');

    // Better implementation with recursive setTimeout for variable delays
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const cycle = () => {
            if (demoStep === 'analyzing') {
                timeoutId = setTimeout(() => setDemoStep('result'), 3000);
            } else {
                timeoutId = setTimeout(() => setDemoStep('analyzing'), 4000);
            }
        };

        cycle();
        return () => clearTimeout(timeoutId);
    }, [demoStep]);

    // ... (gsap code) ...

    // ... (render) ...

    {/* Mock Content */ }
    <div className="absolute inset-0 pt-12 flex items-center justify-center p-6">
        {demoStep === 'analyzing' ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 mx-auto border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan" style={{ height: '200%', top: '-50%' }} />
                </div>
                <p className="text-lg font-medium text-white/70">Analyzing your screenshot...</p>
            </div>
        ) : (
            <div className="w-full max-w-md bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 mb-4">
                    <div className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold uppercase tracking-wider border border-neon-cyan/30">
                        Viral Style
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-500/30">
                        ASO 98
                    </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                    Track your workouts <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">in seconds.</span>
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    Stop wasting time with complex logs. The easiest way to stay fit and reach your goals, starting today.
                </p>
            </div>
        )}
    </div>

    return (
        <section
            ref={containerRef}
            className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background text-center text-foreground pt-32 pb-20 overflow-x-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Dot Matrix Pattern with Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.08] dark:opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>

                {/* Aurora Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000" />
            </div>

            <div className="z-10 px-4 max-w-5xl">
                <div className="inline-flex items-center rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-sm font-medium text-neon-cyan mb-6 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-neon-cyan mr-2 animate-pulse"></span>
                    v1.0 Launch Special
                </div>
                <h1
                    ref={titleRef}
                    className="mb-6 bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl lg:text-8xl leading-tight"
                >
                    Turn Screenshots into <br />
                    <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">Viral Marketing Copy</span>
                </h1>
                <p
                    ref={subtitleRef}
                    className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400 md:text-2xl mb-10 leading-relaxed"
                >
                    Stop staring at a blank screen. Upload your app screenshot and let AI generate high-converting text for App Store, Twitter, and LinkedIn in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all rounded-full">
                        <Link href="/login">
                            Start Generating Free
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-white/20 hover:bg-white/10 rounded-full backdrop-blur-sm">
                        <Link href="#how-it-works">
                            See How It Works
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Visual Mockup */}
            <div className="relative z-10 w-full max-w-5xl px-4 perspective-1000 mb-12">
                <div className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/5 to-neon-purple/5" />

                    {/* Mock UI Header */}
                    <div className="absolute top-0 inset-x-0 h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-black/20">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>

                    {/* Mock Content */}
                    <div className="absolute inset-0 pt-12 flex items-center justify-center p-6">
                        {demoStep === 'analyzing' ? (
                            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 mx-auto border border-white/10 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan" style={{ height: '200%', top: '-50%' }} />
                                </div>
                                <p className="text-lg font-medium text-white/70">Analyzing your screenshot...</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-md bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="px-2 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold uppercase tracking-wider border border-neon-cyan/30">
                                        Viral Style
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-500/30">
                                        ASO 98
                                    </div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                    Track your workouts <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">in seconds.</span>
                                </h3>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                    Stop wasting time with complex logs. The easiest way to stay fit and reach your goals, starting today.
                                </p>
                            </div>
                        )}
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
            </div>

            <div
                ref={scrollHintRef}
                className="z-10 flex flex-col items-center gap-2 text-gray-500 animate-bounce"
            >
                <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
                <ArrowDown className="h-4 w-4" />
            </div>
        </section>
    );
}
