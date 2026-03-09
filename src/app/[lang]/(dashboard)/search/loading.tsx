import { Skeleton } from '@/components/ui/skeleton'
import { ClubCardSkeleton } from '@/components/app/directory/ClubCard'

export default function SearchLoading() {
  return (
    <div>
      {/* "Search" h1 — text-2xl font-bold (~65px) */}
      <Skeleton className="h-8 w-[65px] mb-6" />

      {/* DirectoryFilters — row of Select dropdowns, min-w-[140px] each */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-[140px] rounded-md" />
        <Skeleton className="h-9 w-[140px] rounded-md" />
        <Skeleton className="h-9 w-[140px] rounded-md" />
        <Skeleton className="h-9 w-[140px] rounded-md" />
      </div>

      {/* Club count text — "X clubs" */}
      <Skeleton className="mt-4 h-4 w-[100px]" />

      {/* Club card grid — reuses ClubCardSkeleton */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
