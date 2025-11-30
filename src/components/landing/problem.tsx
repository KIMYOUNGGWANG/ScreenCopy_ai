'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const problems = [
    {
        icon: XCircle,
        title: 'Lack of Copywriting Skills',
        description: '"I can code, but I don\'t know how to write marketing copy."',
        color: 'text-red-500',
    },
    {
        icon: AlertTriangle,
        title: 'High Cost',
        description: 'Professional copywriters cost $500-$2000 per project.',
        color: 'text-orange-500',
    },
    {
        icon: Clock,
        title: 'Time Consuming',
        description: 'Spending days brainstorming headlines instead of coding.',
        color: 'text-yellow-500',
    },
    {
        icon: XCircle,
        title: 'Low Conversion',
        description: 'Great app, but screenshots that fail to drive downloads.',
        color: 'text-red-500',
    },
];

export function Problem() {
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
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                        delay: index * 0.2,
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full bg-background py-24 text-foreground"
        >
            <div className="container mx-auto px-4">
                <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
                    The <span className="text-neon-purple">Problem</span>
                </h2>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-8 backdrop-blur-sm transition-colors hover:border-neon-purple/50 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black/5 group-hover:bg-neon-purple/20 dark:bg-white/5">
                                <problem.icon className={`h-8 w-8 ${problem.color}`} />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">{problem.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
