'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, Zap, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        icon: Layers,
        title: '1. Upload',
        description: 'Upload your app screenshot.',
    },
    {
        icon: Zap,
        title: '2. Input',
        description: 'Enter app details and target audience.',
    },
    {
        icon: Zap,
        title: '3. Analyze',
        description: 'GPT-4o Vision analyzes image + text.',
    },
    {
        icon: CheckCircle2,
        title: '4. Generate',
        description: 'Get 5 marketing copy options.',
    },
    {
        icon: CheckCircle2,
        title: '5. Select',
        description: 'Copy your favorite one.',
    },
];

export function Solution() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
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
        <section ref={containerRef} className="bg-background py-24 text-foreground">
            <div className="container mx-auto px-4">
                <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
                    The <span className="text-neon-cyan">Solution</span>
                </h2>

                <div className="flex flex-wrap justify-center gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className="flex w-full max-w-[250px] flex-col items-center text-center opacity-0"
                        >
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon-cyan/50 bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                                <step.icon className="h-10 w-10 text-neon-cyan" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold">{step.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
