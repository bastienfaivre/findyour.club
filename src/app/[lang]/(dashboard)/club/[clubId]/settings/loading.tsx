import { Skeleton } from '@/components/ui/skeleton'

export default function ClubSettingsLoading() {
  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      {/* Visibility section */}
      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-4 w-[80px]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-4 w-[50px]" />
        </div>
        <Skeleton className="h-9 w-[140px] rounded-md" />
      </div>

      {/* Team section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[40px]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-5 w-[55px] rounded-full" />
            <Skeleton className="h-5 w-[50px] rounded-full" />
          </div>
        ))}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-[80px] rounded-md" />
        </div>
      </div>

      {/* Data section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[35px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-[120px] rounded-md" />
      </div>
    </div>
  )
}
