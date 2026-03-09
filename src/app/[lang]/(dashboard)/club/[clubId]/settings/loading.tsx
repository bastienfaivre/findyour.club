import { Skeleton } from '@/components/ui/skeleton'

export default function ClubSettingsLoading() {
  return (
    <div className="max-w-xl space-y-8">
      {/* VisibilityToggle — title + switch row */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-[80px]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-4 w-[50px]" />
        </div>
      </div>

      {/* "View public page" link — icon + text */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[120px]" />
      </div>

      {/* MembershipPanel — section heading + table + invite form */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[80px]" />

        {/* Member rows */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-5 w-[55px] rounded-full" />
            <Skeleton className="h-5 w-[50px] rounded-full" />
          </div>
        ))}

        {/* Invite form — label + input + button */}
        <div className="flex items-end gap-2 pt-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-[80px] rounded-md" />
        </div>
      </div>
    </div>
  )
}
