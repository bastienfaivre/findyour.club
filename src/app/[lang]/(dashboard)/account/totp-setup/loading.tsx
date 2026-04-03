import { Skeleton } from '@/components/ui/skeleton'

export default function TotpSetupLoading() {
  return (
    <div className="w-full mx-auto max-w-2xl space-y-4">
      <div className="rounded-xl border p-4 space-y-4">
        {/* Subtitle text */}
        <Skeleton className="h-4 w-[280px]" />

        {/* QR code + secret + copy button */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-[200px] w-[200px] rounded border" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[260px]" />
            <Skeleton className="h-8 w-[60px] rounded-md" />
          </div>
        </div>

        {/* OTP input */}
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-4 w-[260px]" />
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>
        </div>

        {/* "Activate 2FA" button */}
        <div className="flex justify-center">
          <Skeleton className="h-9 w-[100px] rounded-md" />
        </div>
      </div>
    </div>
  )
}
