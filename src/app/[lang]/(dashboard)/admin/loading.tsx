import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      {/* Conversation list */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[140px]" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-[240px]" />
        </div>
      ))}
    </div>
  )
}
