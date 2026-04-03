import { Skeleton } from '@/components/ui/skeleton'
import { ClubCardSkeleton } from '@/components/app/directory/ClubCard'

export default function SearchLoading() {
  return (
    <div className="space-y-4">
      {/* Title + filters */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-8 w-[65px]" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
        </div>
        <Skeleton className="h-4 w-[100px]" />
      </div>

      {/* Club card grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
