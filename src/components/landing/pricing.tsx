'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const plans = [
    {
        name: 'Starter Pack',
        credits: 10,
        price: '$5',
        perCredit: '$0.50/credit',
        features: ['10 Screenshot Analyses', '50 Copy Variations', 'Standard Support'],
        popular: false,
    },
    {
        name: 'Pro Plan',
        credits: 50,
        price: '$19',
        perCredit: '$0.38/credit',
        features: ['50 Screenshot Analyses', '250 Copy Variations', 'Priority Support', '20% Discount'],
        popular: true,
    },
    {
        name: 'Growth Plan',
        credits: 150,
        price: '$49',
        perCredit: '$0.33/credit',
        features: ['150 Screenshot Analyses', '750 Copy Variations', 'Dedicated Support', '33% Discount'],
        popular: false,
    },
];

export function Pricing() {
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
            id="pricing"
            ref={containerRef}
            className="relative w-full bg-background py-24 text-foreground"
        >
            <div className="container mx-auto px-4">
                <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
                    Simple, Transparent <span className="text-neon-purple">Pricing</span>
                </h2>

                <div className="grid gap-8 md:grid-cols-3">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all hover:-translate-y-2 ${plan.popular
                                ? 'border-neon-purple bg-neon-purple/10 shadow-[0_0_30px_rgba(178,58,255,0.2)]'
                                : 'border-black/10 bg-black/5 hover:border-black/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-neon-purple px-4 py-1 text-sm font-bold text-white">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                            <div className="mb-1 text-4xl font-bold">{plan.price}</div>
                            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">{plan.perCredit}</div>
                            <div className="mb-8 text-3xl font-bold text-neon-cyan">
                                {plan.credits} <span className="text-lg text-gray-900 dark:text-white">Credits</span>
                            </div>

                            <ul className="mb-8 flex-1 space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Check className="h-5 w-5 text-neon-cyan" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/dashboard"
                                className={`flex w-full items-center justify-center rounded-lg py-3 font-bold transition-colors ${plan.popular
                                    ? 'bg-neon-purple text-white hover:bg-neon-purple/80'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                Get Started
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
