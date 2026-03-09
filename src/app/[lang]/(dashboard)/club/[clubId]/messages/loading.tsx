import { Skeleton } from '@/components/ui/skeleton'

export default function ClubMessagesLoading() {
  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)]">
      {/* Chat messages area */}
      <div className="flex-1 space-y-4 p-4">
        {/* Incoming message (left-aligned) */}
        <div className="flex gap-2 max-w-[70%]">
          <div className="space-y-1">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-16 w-[280px] rounded-lg" />
          </div>
        </div>

        {/* Outgoing message (right-aligned) */}
        <div className="flex gap-2 max-w-[70%] ml-auto">
          <div className="space-y-1 items-end flex flex-col">
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-10 w-[200px] rounded-lg" />
          </div>
        </div>

        {/* Incoming message */}
        <div className="flex gap-2 max-w-[70%]">
          <div className="space-y-1">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-12 w-[320px] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Compose area — textarea + send button */}
      <div className="border-t p-4 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  )
}
