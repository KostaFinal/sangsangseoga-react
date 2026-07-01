import React from 'react';

export const SkeletonLoading = ({
  type = 'card', // 'card' | 'list' | 'text'
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return (
          <div className="flex gap-4 p-4 bg-white border border-neutral-100 rounded-3xl animate-pulse">
            <div className="w-16 h-20 bg-neutral-100 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2.5 py-1">
              <div className="h-4 bg-neutral-150 rounded-md w-1/3" />
              <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
              <div className="h-3 bg-neutral-100 rounded-md w-3/4" />
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3 py-2 animate-pulse text-left">
            <div className="h-4 bg-neutral-150 rounded-md w-1/4" />
            <div className="h-3.5 bg-neutral-100 rounded-md w-full" />
            <div className="h-3.5 bg-neutral-100 rounded-md w-11/12" />
            <div className="h-3.5 bg-neutral-100 rounded-md w-5/6" />
          </div>
        );
      default: // 'card'
        return (
          <div className="bg-white border border-neutral-100/40 rounded-3xl p-4 shadow-xs space-y-4 animate-pulse text-left">
            <div className="aspect-[3/4] w-full rounded-2xl bg-neutral-100" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-150 rounded-md w-2/3" />
              <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
              <div className="h-3 bg-neutral-100 rounded-md w-full pt-1" />
            </div>
          </div>
        );
    }
  };

  const wrapperClass = () => {
    if (type === 'card') {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6';
    }
    return 'space-y-4 w-full';
  };

  return (
    <div className={wrapperClass()}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
