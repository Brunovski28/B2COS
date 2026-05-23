import { Skeleton } from '@/components/ui/skeleton'

export function IdeaCardSkeleton() {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4 bg-[#18181B]" />
          <Skeleton className="h-3 w-full bg-[#18181B]" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full bg-[#18181B] ml-3 shrink-0" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded bg-[#18181B]" />
        <Skeleton className="h-5 w-16 rounded bg-[#18181B]" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-12 rounded bg-[#18181B]" />
        <Skeleton className="h-4 w-14 rounded bg-[#18181B]" />
      </div>
    </div>
  )
}

export function IdeaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <IdeaCardSkeleton key={i} />
      ))}
    </div>
  )
}
