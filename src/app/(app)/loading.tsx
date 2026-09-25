import { Skeleton } from '@/components/ui/misc'

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Loading">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-44 rounded-3xl" />
      <Skeleton className="h-[68px] rounded-2xl" />
      <Skeleton className="h-[68px] rounded-2xl" />
    </div>
  )
}
