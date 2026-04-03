import { Skeleton } from '@/components/ui/skeleton'

export default function ClubAdminLoading() {
  return (
    <div className="@container flex flex-col h-full min-h-0">
      {/* Tab bar (narrow) — "Edit" / "Preview" tabs */}
      <div className="flex @[74rem]:hidden border-b border-border mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* Logo upload — 80px avatar + upload hint + button */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>

        {/* "Club Name" label (~75px) + input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[75px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* "Description" label (~80px) + textarea 4 rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* "Schedule / Availability" label (~150px) + textarea 3 rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* "How to Join" label (~85px) + textarea 3 rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[85px]" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* "Contact Email" label (~100px) + input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* "Contact Phone" label (~105px) + input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[105px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* "Contact Address" label (~115px) + textarea 2 rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[115px]" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>

        {/* "Website" label (~55px) + input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[55px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Photos section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[50px]" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
