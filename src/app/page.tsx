import { SmoothScroller } from '@/components/smooth-scroller';
import { Hero } from '@/components/landing/hero';
import { Problem } from '@/components/landing/problem';
import { Solution } from '@/components/landing/solution';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { CTA } from '@/components/landing/cta';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <SmoothScroller>
      <main className="flex min-h-screen flex-col bg-background text-foreground selection:bg-neon-cyan selection:text-black">
        <Header />
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </SmoothScroller>
  );
}
