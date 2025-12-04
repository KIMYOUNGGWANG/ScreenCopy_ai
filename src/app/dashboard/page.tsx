import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function CreditDisplay() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return <p className="text-gray-500 mb-4">0 credits remaining.</p>
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', session.user.id)
        .single()

    return (
        <p className="text-gray-500 mb-4">
            You have <span className="font-bold text-blue-600">{profile?.credits ?? 0}</span> credits remaining.
        </p>
    )
}

import { RefillButton } from "@/components/dashboard/refill-button"
import { CreditActions } from "@/components/dashboard/credit-actions"
import { Sparkles } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    const { count } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

    const hasHistory = count !== null && count > 0

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {!hasHistory ? (
                <div className="max-w-2xl mx-auto text-center py-16 border rounded-xl bg-muted/10">
                    <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Welcome to ScreenCopy.ai! 👋</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Ready to boost your app downloads? Let&apos;s create your first high-converting screenshot copy.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/generate">
                            <Button size="lg" className="gap-2 text-lg px-8">
                                <Sparkles className="w-5 h-5" />
                                Start Generating Now
                            </Button>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            <Suspense fallback={<Skeleton className="h-4 w-20 inline-block" />}>
                                <CreditDisplay />
                            </Suspense>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-6 border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                        <h2 className="text-xl font-semibold mb-2">New Generation</h2>
                        <p className="text-gray-500 mb-4">Create new marketing copy for your screenshots.</p>
                        <Link href="/generate">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">Start Generating</Button>
                        </Link>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                        <h2 className="text-xl font-semibold mb-2">History</h2>
                        <p className="text-gray-500 mb-4">View your past generations.</p>
                        <Link href="/history">
                            <Button className="w-full bg-slate-800 text-white hover:bg-slate-700 border-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">View History</Button>
                        </Link>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                        <h2 className="text-xl font-semibold mb-2">Credits</h2>
                        <Suspense fallback={<Skeleton className="h-6 w-full mb-4" />}>
                            <CreditDisplay />
                        </Suspense>
                        <CreditActions />
                    </div>
                </div>
            )}
        </div>
    )
}
