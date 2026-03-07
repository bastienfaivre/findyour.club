export default function InnerPageLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-[240px] md:flex-shrink-0" />
      <main className="flex-1 flex items-start justify-center pt-16 md:pt-0">
        <div className="max-w-4xl w-full px-4 py-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
          <div className="flex flex-col gap-4">
            <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-24 w-3/4 bg-muted animate-pulse rounded-lg" />
            <div className="h-24 w-5/6 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
}
