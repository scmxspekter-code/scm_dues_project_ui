import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-slate-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_1.6s_ease-in-out_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton components
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton width={60} height={24} className="rounded-full" />
    </div>
    <Skeleton width={120} height={16} className="mb-2" />
    <Skeleton width={100} height={32} />
  </div>
);

export const ChartSkeleton: React.FC = () => {
  const barHeights = [65, 45, 80, 55, 70, 40];
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <Skeleton width={180} height={24} />
        <Skeleton width={120} height={32} className="rounded-lg" />
      </div>
      <div className="h-72 w-full flex items-end justify-between gap-2 px-4">
        {barHeights.map((height, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${height}%`}
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  );
};

export const PieChartSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
    <Skeleton width={140} height={24} className="mb-4" />
    <div className="flex-1 relative flex items-center justify-center">
      <Skeleton variant="circular" width={160} height={160} />
    </div>
    <div className="space-y-2 mt-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={16} />
          </div>
          <Skeleton width={40} height={16} />
        </div>
      ))}
    </div>
  </div>
);

export const AIBannerSkeleton: React.FC = () => (
  <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 shadow-xl shadow-cyan-100 flex items-start space-x-4">
    <Skeleton variant="circular" width={56} height={56} className="bg-white/20" />
    <div className="flex-1">
      <Skeleton width={200} height={24} className="mb-2 bg-white/20" />
      <Skeleton width="100%" height={16} className="mb-1 bg-white/20" />
      <Skeleton width="80%" height={16} className="bg-white/20" />
    </div>
  </div>
);
