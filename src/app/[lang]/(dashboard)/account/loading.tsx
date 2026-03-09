import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <div className="max-w-xl space-y-10">
      {/* "Signed in as user@example.com" — text-sm */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-[85px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Change Password section — text-lg heading */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <Skeleton className="h-6 w-[140px]" />
        </div>
        {/* "Current password" label (~120px) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* "New password" label (~100px) + hint */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
        {/* "Confirm new password" label (~150px) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* "Update password" button (~130px) */}
        <Skeleton className="h-9 w-[130px] rounded-md" />
      </section>

      {/* Two-Factor Authentication section — text-lg heading (~210px) */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <Skeleton className="h-6 w-[210px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-[70px] rounded-full" />
          <Skeleton className="h-4 w-[220px]" />
        </div>
        {/* "Enrol 2FA" / "Reset 2FA" button (~80px) */}
        <Skeleton className="h-9 w-[80px] rounded-md" />
      </section>

      {/* Passkeys section — text-lg heading (~75px) */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <Skeleton className="h-6 w-[75px]" />
        </div>
        <Skeleton className="h-4 w-[180px]" />
        {/* "Add passkey" button (~100px) */}
        <Skeleton className="h-9 w-[100px] rounded-md" />
      </section>
    </div>
  )
}
