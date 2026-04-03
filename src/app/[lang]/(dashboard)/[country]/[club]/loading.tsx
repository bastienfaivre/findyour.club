import { Skeleton } from '@/components/ui/skeleton'

export default function ClubPublicLoading() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {/* Hero card */}
        <div className="rounded-xl border p-4 flex flex-col items-center text-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-9 w-48" />
        </div>

        {/* "Who we are" section */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-6 w-[130px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* "Schedule" section */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-6 w-[75px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* "How to Join" section */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-6 w-[95px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* "Contact Info" section */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-6 w-[105px]" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-[130px]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-[220px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
