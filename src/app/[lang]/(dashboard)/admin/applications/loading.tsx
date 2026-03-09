import { Skeleton } from '@/components/ui/skeleton'

export default function ApplicationsLoading() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar — "Applications" / "Review" */}
      <div className="flex border-b border-border mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Filters — country + canton + activity selects, min-w-[140px] each */}
      <div className="space-y-3 mb-4 max-w-xl">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
        </div>
      </div>

      {/* Application list — p-3 border rounded-lg cards: font-medium name + badges row */}
      <div className="space-y-2 max-w-xl flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-[80px] rounded-full" />
              <Skeleton className="h-4 w-[24px]" />
              <Skeleton className="h-4 w-[72px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
