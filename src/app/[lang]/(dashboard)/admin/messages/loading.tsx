import { Skeleton } from '@/components/ui/skeleton'

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-80 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-3/4" />
          ))}
        </div>
      </div>
    </div>
  )
}
