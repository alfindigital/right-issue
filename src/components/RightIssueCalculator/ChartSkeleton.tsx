import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder yang menyerupai ukuran chart aslinya.
 * Mencegah layout shift saat lazy chunk recharts dimuat.
 */
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="card-calculator animate-fade-in">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div
      className="w-full flex items-end gap-2 px-2"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <Skeleton className="flex-1 h-[60%] rounded-t-md" />
      <Skeleton className="flex-1 h-[85%] rounded-t-md" />
      <Skeleton className="flex-1 h-[45%] rounded-t-md" />
      <Skeleton className="flex-1 h-[70%] rounded-t-md" />
    </div>
    <div className="flex justify-center gap-3 mt-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const SectionSkeleton: React.FC = () => (
  <div className="card-calculator animate-fade-in space-y-3">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="h-24 w-full mt-2" />
  </div>
);

export default ChartSkeleton;