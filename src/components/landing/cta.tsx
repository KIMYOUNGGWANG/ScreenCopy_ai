'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 70%',
                    },
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative flex min-h-[60vh] w-full items-center justify-center bg-background px-4 py-24 text-center"
        >
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-neon-purple/20 blur-[120px]" />
            </div>

            <div ref={contentRef} className="z-10 max-w-4xl">
                <h2 className="mb-8 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
                    Ready to Boost Your <span className="text-neon-cyan">Downloads</span>?
                </h2>
                <p className="mb-12 text-xl text-gray-600 dark:text-gray-400 md:text-2xl">
                    Join thousands of developers who are optimizing their mobile app presence today.
                </p>

                <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-transform hover:scale-105"
                >
                    <span className="relative z-10">Generate Copy Now</span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-transform duration-500 group-hover:translate-x-0" />
                </Link>
            </div>
        </section>
    );
}
