import { Skeleton } from '@/components/ui/skeleton'

export default function InnerPageLoading() {
  return (
    <div className="py-16 lg:py-24">
      {/* Page title — h1 text-2xl font-bold (~160px for a typical page name) */}
      <Skeleton className="h-8 w-[160px] mb-6" />

      {/* Content elements — flex flex-col gap-4 */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-20 w-3/4 rounded-lg" />
      </div>
    </div>
  )
}
