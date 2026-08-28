'use client';

import React from 'react';

export const KpiSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded-md w-24"></div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-3 bg-slate-100 rounded-md w-40"></div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading Chart...' }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded-md w-48"></div>
        <div className="h-4 bg-slate-100 rounded-md w-20"></div>
      </div>
      <div className="h-64 bg-slate-100/70 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
        {title}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 animate-pulse">
      <div className="h-6 bg-slate-200 rounded-md w-40 mb-4"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded-md w-32"></div>
          <div className="h-4 bg-slate-100 rounded-md w-24"></div>
          <div className="h-4 bg-slate-100 rounded-md w-16"></div>
        </div>
      ))}
    </div>
  );
};
