import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
}

/** Base skeleton – always visible; shimmer from CSS when loaded, else solid gray */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseClasses = 'rounded overflow-hidden';
  const variantClasses = {
    text: 'h-4 rounded min-h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg min-h-[0.5rem]',
  };
  const animationClasses = {
    shimmer: 'skeleton-shimmer bg-slate-200',
    pulse: 'animate-pulse bg-slate-200',
    none: 'bg-slate-200',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={classNames(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={Object.keys(style).length ? style : undefined}
      aria-hidden
    />
  );
};

/** Stat card skeleton – matches Dashboard stat cards */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" width={48} height={48} className="min-w-[48px]" />
      <Skeleton width={64} height={24} className="rounded-full" />
    </div>
    <Skeleton width={100} height={14} className="mb-2" />
    <Skeleton width={120} height={32} className="rounded-lg" />
  </div>
);

/** Chart area skeleton – for bar/line charts */
export const ChartSkeleton: React.FC = () => {
  const barHeights = [72, 48, 88, 56, 65, 42, 78, 52];
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <Skeleton width={180} height={24} className="rounded-lg" />
        <Skeleton width={140} height={40} className="rounded-xl" />
      </div>
      <div className="h-72 w-full flex items-end justify-between gap-2 px-2">
        {barHeights.map((height, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${height}%`}
            className="rounded-t-lg min-h-[24px] flex-1"
          />
        ))}
      </div>
    </div>
  );
};

/** Pie chart / donut skeleton */
export const PieChartSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
    <Skeleton width={140} height={24} className="mb-4 rounded-lg" />
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Skeleton variant="circular" width={160} height={160} />
    </div>
    <div className="space-y-3 mt-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Skeleton variant="circular" width={10} height={10} className="shrink-0" />
            <Skeleton width={`${60 + i * 10}%`} height={16} className="rounded" />
          </div>
          <Skeleton width={44} height={16} className="rounded shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

/** AI / feature banner skeleton – uses pulse on dark background */
export const AIBannerSkeleton: React.FC = () => (
  <div className="bg-linear-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 shadow-xl shadow-cyan-100 flex items-start gap-4 overflow-hidden">
    <Skeleton variant="circular" width={56} height={56} className="shrink-0 bg-white/20" animation="pulse" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton width={200} height={24} className="rounded-lg bg-white/20 max-w-full" animation="pulse" />
      <Skeleton width="100%" height={16} className="rounded bg-white/20" animation="pulse" />
      <Skeleton width="85%" height={16} className="rounded bg-white/20" animation="pulse" />
    </div>
  </div>
);

/** Table rows skeleton – professional row placeholders for data tables */
export interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  /** Optional: 'member' | 'default' – member shows avatar+name column first */
  variant?: 'member' | 'default';
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columnCount = 5,
  rowCount = 10,
  variant = 'member',
}) => {
  const alignForCol = (colIndex: number): 'left' | 'center' | 'right' => {
    if (variant === 'member') {
      if (colIndex === 0) return 'left';
      if (colIndex === columnCount - 1) return 'right';
      if (colIndex === 1) return 'center';
      return 'left';
    }
    return colIndex === columnCount - 1 ? 'right' : 'left';
  };

  return (
    <>
      {[...Array(rowCount)].map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="group">
          {[...Array(columnCount)].map((_, colIndex) => {
            const align = alignForCol(colIndex);
            return (
              <td
                key={colIndex}
                className={classNames(
                  'px-3 sm:px-6 py-3 sm:py-4',
                  align === 'center' && 'text-center',
                  align === 'right' && 'text-right'
                )}
              >
                <div
                  className={classNames(
                    'flex items-center',
                    align === 'center' && 'justify-center',
                    align === 'right' && 'justify-end'
                  )}
                >
                  {variant === 'member' && colIndex === 0 ? (
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <Skeleton variant="circular" width={40} height={40} className="shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton width="70%" height={16} className="rounded" />
                        <Skeleton width="50%" height={12} className="rounded" />
                      </div>
                    </div>
                  ) : align === 'center' ? (
                    <Skeleton width={64} height={24} className="rounded-full" />
                  ) : align === 'right' ? (
                    <div className="flex items-center gap-2">
                      <Skeleton width={36} height={36} className="rounded-lg" />
                      <Skeleton width={36} height={36} className="rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-2 w-full min-w-0">
                      <Skeleton width="90%" height={16} className="rounded" />
                      {colIndex === 1 && (
                        <Skeleton width="60%" height={14} className="rounded" />
                      )}
                    </div>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

/** Full-page or section data loading – centered, calm message */
export const DataLoadSkeleton: React.FC<{
  message?: string;
  showBlocks?: boolean;
}> = ({ message = 'Loading...', showBlocks = true }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    {showBlocks && (
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            width={12}
            height={12}
            variant="circular"
            className="opacity-60"
          />
        ))}
      </div>
    )}
    <p className="text-sm font-medium text-slate-500">{message}</p>
  </div>
);
