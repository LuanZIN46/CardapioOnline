import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface flex gap-4 p-4">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
    </div>
  );
}
