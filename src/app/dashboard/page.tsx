import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function CreditDisplay() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

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

export default async function DashboardPage() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">New Generation</h2>
                    <p className="text-gray-500 mb-4">Create new marketing copy for your screenshots.</p>
                    <Link href="/generate">
                        <Button>Start Generating</Button>
                    </Link>
                </div>
                <div className="p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">History</h2>
                    <p className="text-gray-500 mb-4">View your past generations.</p>
                    <Link href="/history">
                        <Button variant="outline">View History</Button>
                    </Link>
                </div>
                <div className="p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Credits</h2>
                    <Suspense fallback={<Skeleton className="h-6 w-full mb-4" />}>
                        <CreditDisplay />
                    </Suspense>
                    <Button variant="secondary">Buy More</Button>
                </div>
            </div>
        </div>
    )
}
