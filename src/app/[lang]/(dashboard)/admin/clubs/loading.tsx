import { Skeleton } from '@/components/ui/skeleton'

export default function ClubsLoading() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar — "Clubs" / "Club Moderation" */}
      <div className="flex border-b border-border mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Filters — country + activity + status selects, min-w-[140px] each */}
      <div className="space-y-3 mb-4 max-w-xl">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
        </div>
      </div>

      {/* Club list — p-3 border rounded-lg cards: font-medium name + badge + country + status */}
      <div className="space-y-2 max-w-xl flex-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-5 w-[180px]" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-[90px] rounded-full" />
              <Skeleton className="h-4 w-[24px]" />
              <Skeleton className="h-5 w-[55px] rounded-full ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
