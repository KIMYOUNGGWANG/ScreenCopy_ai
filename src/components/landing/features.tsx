'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Smartphone, Palette, FileJson } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: Eye,
        title: 'Visual Context Understanding',
        description: 'Unlike generic AI, we analyze both your screenshot image AND text to create copy that perfectly matches your visuals.',
        color: 'text-neon-cyan',
    },
    {
        icon: Smartphone,
        title: 'iOS & Android Optimized',
        description: 'Optimized for 6-10 word headlines that drive conversions. Works perfectly for both App Store and Google Play.',
        color: 'text-neon-purple',
    },
    {
        icon: Palette,
        title: '5 Diverse Styles',
        description: 'Get options ranging from Bold, Subtle, Feature-focused, Benefit-focused, to Emotional.',
        color: 'text-pink-500',
    },
    {
        icon: FileJson,
        title: 'Designer-ready Export',
        description: 'One-click CSV/JSON export. Hand off perfectly formatted copy to your design team instantly.',
        color: 'text-yellow-400',
    },
];

export function Features() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 90%',
                        },
                        delay: index * 0.1,
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="features"
            ref={containerRef}
            className="relative w-full bg-background py-24 text-foreground"
        >
            <div className="container mx-auto px-4">
                <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
                    Why <span className="text-neon-cyan">ScreenCopy.ai</span>?
                </h2>

                <div className="grid gap-8 md:grid-cols-2">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className="group flex gap-6 rounded-2xl border border-black/10 bg-black/5 p-8 backdrop-blur-sm transition-colors hover:border-neon-cyan/50 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className={`shrink-0 ${feature.color}`}>
                                <feature.icon className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
