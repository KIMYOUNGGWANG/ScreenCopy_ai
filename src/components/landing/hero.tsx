'use client';

import { useRef } from 'react';
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



    // ... (gsap code) ...

    return (
        <section
            ref={containerRef}
            className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background text-center text-foreground pt-32 pb-20 overflow-x-hidden"
        >
            {/* ... Background Effects ... */}

            <div className="z-10 px-4 max-w-5xl">
                <div className="inline-flex items-center rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-sm font-medium text-neon-cyan mb-6 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-neon-cyan mr-2 animate-pulse"></span>
                    Beta Launch
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
                    Stop staring at a blank screen. Upload your app screenshot and let AI generate high-converting text for App Store, Google Play, Twitter, and LinkedIn in seconds. <br className="hidden md:block" />
                    <span className="text-neon-cyan font-medium">Perfect for Indie Devs & Solopreneurs.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all rounded-full">
                        <Link href="/login">
                            Start Generating Free
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 text-lg font-medium border-white/20 hover:bg-white/10 rounded-full backdrop-blur-sm transition-all"
                        onClick={() => {
                            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        See How It Works
                    </Button>
                </div>
            </div>

            {/* Visual Mockup */}
            {/* <div className="relative z-10 w-full max-w-5xl px-4 perspective-1000 mb-12">
                <HeroDemo showTitle={false} />
            </div> */}

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
