import { Skeleton } from '@/components/ui/skeleton'

export default function ClubPublicLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero — ClubHeroSection: size-24 avatar + text-2xl sm:text-4xl h1 + text-base description */}
      <section className="flex flex-col items-center text-center gap-6 py-16">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-[500px] max-w-full" />
      </section>

      {/* Content — ProfilePage max-w-3xl */}
      <div className="mx-auto w-full max-w-3xl px-4">
        {/* Photo carousel */}
        <Skeleton className="h-64 w-full rounded-lg" />

        {/* "Schedule" section — text-lg font-semibold heading (~75px) + text-sm lines */}
        <section className="py-6">
          <Skeleton className="h-6 w-[75px] mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </section>

        {/* "How to Join" section — heading (~95px) + text-sm lines */}
        <section className="py-6">
          <Skeleton className="h-6 w-[95px] mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </section>

        {/* "Contact Info" section — heading (~105px) + icon rows */}
        <section className="py-6">
          <Skeleton className="h-6 w-[105px] mb-3" />
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
        </section>
      </div>
    </div>
  )
}
