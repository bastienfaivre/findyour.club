import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      {/* Hero */}
      <div className="rounded-xl border p-4 text-center space-y-4">
        <Skeleton className="h-12 w-96 max-w-full mx-auto" />
        <Skeleton className="h-5 w-80 max-w-full mx-auto" />
        <Skeleton className="h-5 w-72 max-w-full mx-auto" />
      </div>

      {/* Bootstrap message */}
      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* City search */}
      <div className="rounded-xl border p-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Countries */}
      <div className="rounded-xl border p-4 text-center space-y-4">
        <Skeleton className="h-3 w-24 mx-auto" />
        <div className="flex flex-wrap justify-center gap-[10px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[180px] items-center gap-3 rounded-[10px] border px-4 py-[10px]"
            >
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
