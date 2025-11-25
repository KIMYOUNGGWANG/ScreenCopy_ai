import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200", className)}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
        </div>
    )
}

export function HistorySkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
