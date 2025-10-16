import { TailSpinPreloader } from '../icons/tail-spin-preloader';
import { Skeleton } from '@/components/ui/skeleton';

export function ActionLoading() {
  return (
    <div className="min-h-[30vh] items-center w-full flex justify-center">
      <TailSpinPreloader width={100} height={100} fill="#224FF0" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="rounded-xl border p-4 space-y-4">
          <Skeleton className="h-4 w-32" /> {/* Title */}
          <Skeleton className="h-8 w-40" /> {/* Masked balance */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-20" /> {/* $0.00 */}
            <Skeleton className="h-6 w-16" /> {/* percentage */}
          </div>
        </div>

        {/* Unassigned Balance + Chart */}
        <div className="rounded-xl border p-4 flex justify-between items-center">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-24 w-24 rounded-full" /> {/* Chart */}
        </div>
      </div>

      {/* Tokens Table */}
      <div className="rounded-xl border p-4">
        <Skeleton className="h-5 w-24 mb-4" /> {/* Tokens Title */}
        {/* Table Header */}
        <div className="grid grid-cols-5 py-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* Single Row */}
        <div className="grid grid-cols-5 items-center py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
            <Skeleton className="h-4 w-24" /> {/* Name */}
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16" /> {/* Button */}
        </div>
      </div>
    </div>
  );
}
