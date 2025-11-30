'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/80 backdrop-blur-md border-b border-border py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tighter">
                        Screen<span className="text-neon-cyan">Copy</span>.ai
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/#features"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="/#pricing"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Pricing
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="default" className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setUser(null);
                                    window.location.href = '/';
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Button asChild variant="default" className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold">
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
