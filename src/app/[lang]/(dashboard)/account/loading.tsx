import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      {/* "Signed in as" */}
      <div className="rounded-xl border p-4 flex items-center gap-1.5">
        <Skeleton className="h-4 w-[85px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Profile section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[60px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[75px]" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-[60px] rounded-md" />
      </div>

      {/* Change Password section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[140px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-[130px] rounded-md" />
      </div>

      {/* Two-Factor Authentication section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[210px]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-[70px] rounded-full" />
          <Skeleton className="h-4 w-[220px]" />
        </div>
        <Skeleton className="h-9 w-[80px] rounded-md" />
      </div>

      {/* Passkeys section */}
      <div className="rounded-xl border p-4 space-y-4">
        <Skeleton className="h-4 w-[75px]" />
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-9 w-[100px] rounded-md" />
      </div>
    </div>
  )
}
