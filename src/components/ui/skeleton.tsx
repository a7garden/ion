interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ backgroundColor: 'hsla(40, 12%, 90%, 0.6)' }}
    />
  );
}

export function FeedSkeleton() {
  return (
    <div
      className="relative w-full h-full flex flex-col select-none"
      style={{
        paddingTop: 'calc(var(--safe-area-top) + 88px)',
        paddingBottom: 'calc(var(--safe-area-bottom) + 24px)',
        paddingLeft: 'max(16px, var(--safe-area-left))',
        paddingRight: 'max(16px, var(--safe-area-right))',
      }}
    >
      <div className="mx-auto w-full max-w-[420px] flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-[42px] h-[42px] rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-2.5 w-16 rounded" />
          </div>
        </div>

        <div className="mb-4 flex-shrink-0">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '4/5',
              boxShadow: '0 0 24px hsla(275, 60%, 55%, 0.2), 0 0 48px hsla(330, 65%, 55%, 0.12)',
            }}
          >
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>
        </div>

        <div className="flex-1 space-y-3 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[85%] rounded" />
          <Skeleton className="h-4 w-[70%] rounded" />
        </div>

        <div
          className="flex items-center gap-1 pt-3 border-t"
          style={{ borderColor: 'hsla(40, 10%, 87%, 0.3)' }}
        >
          <Skeleton className="w-11 h-11 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="w-11 h-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}
