export default function FeedSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex overflow-hidden animate-pulse">
          <div className="flex flex-col items-center gap-2 px-3 py-4 bg-zinc-950/40 min-w-[56px]">
            <div className="w-4 h-4 rounded bg-zinc-800" />
            <div className="w-6 h-4 rounded bg-zinc-800" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-full" />
            <div className="h-3 bg-zinc-800 rounded w-2/3" />
            <div className="flex gap-4 mt-3">
              <div className="h-3 bg-zinc-800 rounded w-16" />
              <div className="h-3 bg-zinc-800 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
