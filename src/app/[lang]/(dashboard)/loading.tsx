import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <>
      {/* Hero — text-4xl sm:text-5xl h1 + text-base tagline + text-base philosophy */}
      <section className="py-16 lg:py-24 text-center space-y-4">
        <Skeleton className="h-12 w-96 max-w-full mx-auto" />
        <Skeleton className="h-5 w-80 max-w-full mx-auto" />
        <Skeleton className="h-5 w-72 max-w-full mx-auto" />
      </section>

      {/* Stats — 3 cards matching max-w-xl grid-cols-3 gap-4, text-2xl number + text-[11px] label */}
      <section className="mx-auto grid max-w-xl grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border py-4 flex flex-col items-center gap-1">
            <Skeleton className="h-8 w-6" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </section>

      {/* Countries — text-[10px] uppercase heading + CountryButton rows */}
      <section className="py-16 lg:py-24 text-center space-y-3">
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

        <div className="pt-4" />
        <Skeleton className="h-3 w-24 mx-auto" />
        <div className="flex flex-wrap justify-center gap-[10px]">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[180px] items-center gap-3 rounded-[10px] border px-4 py-[10px] opacity-45"
            >
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
