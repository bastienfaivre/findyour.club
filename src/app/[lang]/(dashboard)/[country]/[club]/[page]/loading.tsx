import { Skeleton } from '@/components/ui/skeleton'

export default function InnerPageLoading() {
  return (
    <div className="w-full mx-auto max-w-3xl space-y-4">
      {/* Page title */}
      <div className="rounded-xl border p-4">
        <Skeleton className="h-8 w-[160px]" />
      </div>

      {/* Content elements */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-20 w-3/4 rounded-lg" />
      </div>
    </div>
  )
}
