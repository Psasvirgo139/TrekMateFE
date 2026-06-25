import React from 'react';

export default function TourSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="h-56 bg-slate-200 relative"></div>
      <div className="flex-grow p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
        <div className="flex flex-wrap gap-2 my-2">
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 w-full">
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
