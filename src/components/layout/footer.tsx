export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background py-12 text-muted-foreground">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex flex-col items-center gap-2 md:items-start">
                        <span className="text-xl font-bold tracking-tighter text-foreground">
                            Screen<span className="text-neon-cyan">Copy</span>.ai
                        </span>
                        <p className="text-sm">
                            AI-powered App Store screenshot copywriting.
                        </p>
                    </div>

                    <div className="flex gap-8 text-sm">
                        <a href="#" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Contact
                        </a>
                    </div>

                    <div className="text-sm">
                        © {new Date().getFullYear()} ScreenCopy.ai. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
