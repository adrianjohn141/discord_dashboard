function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[20px] bg-white/[0.06] ${className}`} />;
}

export function DashboardIndexSkeleton() {
  return (
    <div className="space-y-6">
      <div className="table-panel p-6">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-4 h-10 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="metric-card bg-[var(--bg-surface)]">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-10 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="table-panel p-5">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-40 max-w-full" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuildRouteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="table-panel rounded-[24px] p-6">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-4 h-10 w-72 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="metric-card bg-[var(--bg-surface)]">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-10 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="table-panel p-6">
            <SkeletonBlock className="h-6 w-44" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-14 w-full" />
              ))}
            </div>
          </div>
          <div className="table-panel p-6">
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-6 flex h-[200px] items-end gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className={`w-full max-w-[44px] rounded-t-lg ${index % 2 === 0 ? "h-24" : "h-36"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="table-panel p-6">
              <SkeletonBlock className="h-6 w-36" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, innerIndex) => (
                  <SkeletonBlock key={innerIndex} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackRouteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="table-panel p-8">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="table-panel p-5">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-4 h-16 w-full" />
            <SkeletonBlock className="mt-6 h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommandsRouteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="table-panel p-8">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="table-panel p-5">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
