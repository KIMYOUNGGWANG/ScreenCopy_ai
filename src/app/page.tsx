import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Sparkles, Zap, Upload, Wand2, Copy, Star } from "lucide-react"
import { DemoSimulation } from "@/components/demo-simulation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-gradient-to-tr from-primary to-violet-600 text-white p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              ScreenCopy.ai
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium text-gray-600 hover:text-primary hover:bg-primary/5">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply animate-blob" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium mb-8 animate-fade-in-up hover:border-primary/30 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-gray-600">Powered by <span className="text-primary font-semibold">GPT-4o Vision</span></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
            Stop writing boring <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-600 to-pink-600 animate-gradient-x">
              App Store Screenshots
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload your screenshot. Let our AI analyze the visual context and generate
            high-converting marketing headlines in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                Start Generating Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium px-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 3 free credits</span>
            </div>
          </div>

          {/* Hero Image / Demo */}
          <div className="relative max-w-5xl mx-auto group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 border-b flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="pt-12">
                <DemoSimulation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by indie developers building</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><div className="w-6 h-6 bg-black rounded" /> Acme Corp</div>
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><div className="w-6 h-6 bg-blue-600 rounded" /> Appify</div>
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><div className="w-6 h-6 bg-green-600 rounded" /> LaunchPad</div>
            <div className="flex items-center gap-2 font-bold text-xl text-gray-800"><div className="w-6 h-6 bg-purple-600 rounded" /> IndieStack</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Developers Love ScreenCopy.ai</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stop struggling with writer&apos;s block. Get professional copy that converts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Visual Understanding",
                desc: "Our AI sees your screenshot and understands the context, UI elements, and value proposition just like a human marketer.",
                icon: <Sparkles className="w-6 h-6 text-white" />,
                color: "bg-violet-500"
              },
              {
                title: "Conversion Focused",
                desc: "Generated headlines are optimized for App Store conversion rates using proven marketing psychology triggers like FOMO.",
                icon: <Zap className="w-6 h-6 text-white" />,
                color: "bg-amber-500"
              },
              {
                title: "Multiple Styles",
                desc: "Get options ranging from professional to playful. Choose the tone that fits your brand voice perfectly.",
                icon: <CheckCircle2 className="w-6 h-6 text-white" />,
                color: "bg-emerald-500"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How it Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Three simple steps to professional App Store copy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-primary/30 to-gray-200 -z-10" />

            {[
              {
                step: "01",
                title: "Upload Screenshot",
                desc: "Drag & drop your app screenshot. We support PNG, JPG, and WebP formats.",
                icon: <Upload className="w-5 h-5 text-primary" />
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Advanced Vision AI analyzes your UI, context, and target audience instantly.",
                icon: <Wand2 className="w-5 h-5 text-primary" />
              },
              {
                step: "03",
                title: "Get Results",
                desc: "Receive 5 high-converting headlines optimized for App Store algorithms.",
                icon: <Copy className="w-5 h-5 text-primary" />
              }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center mb-6 relative z-10 group hover:scale-105 transition-transform duration-300">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Loved by Indie Hackers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              See what other developers are saying about ScreenCopy.ai
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "I used to spend hours brainstorming headlines. Now I get 5 amazing options in seconds. It's a no-brainer.",
                author: "Sarah Jenkins",
                role: "iOS Developer",
                avatar: "S"
              },
              {
                quote: "The visual analysis is surprisingly accurate. It picked up on features I forgot to mention in the description!",
                author: "Mike Chen",
                role: "Indie Hacker",
                avatar: "M"
              },
              {
                quote: "My conversion rate went up by 15% after updating my screenshots with these headlines. Highly recommend.",
                author: "Alex Rivera",
                role: "Product Designer",
                avatar: "A"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{testimonial.author}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the credit system work?</AccordionTrigger>
              <AccordionContent>
                You get 3 free credits when you sign up. Each credit allows you to generate 5 copy variations for one screenshot. You can purchase more credits as needed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I use this for Google Play Store?</AccordionTrigger>
              <AccordionContent>
                Absolutely! While we optimize for App Store best practices, the marketing principles apply equally well to the Google Play Store.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do you support languages other than English?</AccordionTrigger>
              <AccordionContent>
                Currently, we optimize for English copy. However, the AI can understand screenshots in other languages and generate English headlines for them.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-gray-900">ScreenCopy.ai</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">Terms of Service</Link>
              <Link href="#" className="hover:text-primary">Contact</Link>
            </div>
            <p className="text-sm text-gray-400">&copy; 2025 ScreenCopy.ai</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
