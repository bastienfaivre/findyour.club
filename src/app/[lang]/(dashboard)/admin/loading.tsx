import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-border mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Conversation list — club name + last message preview + unread badge */}
      <div className="space-y-1 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-[240px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
