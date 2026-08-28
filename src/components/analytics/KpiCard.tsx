'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    comparisonText?: string;
  };
  icon: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate' | 'indigo' | 'sky';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  colorScheme = 'blue'
}) => {
  const schemeStyles = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-sky-50/50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
      value: 'text-blue-950',
    },
    sky: {
      bg: 'bg-gradient-to-br from-sky-50 to-blue-50/50',
      border: 'border-sky-100',
      iconBg: 'bg-sky-600 text-white shadow-sky-500/20',
      value: 'text-sky-950',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50/50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
      value: 'text-emerald-950',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50/50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600 text-white shadow-amber-500/20',
      value: 'text-amber-950',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50/50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white shadow-purple-500/20',
      value: 'text-purple-950',
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-50 to-pink-50/50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white shadow-rose-500/20',
      value: 'text-rose-950',
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100/50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-700 text-white shadow-slate-500/20',
      value: 'text-slate-900',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-blue-50/50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-500/20',
      value: 'text-indigo-950',
    }
  }[colorScheme];

  return (
    <div className={`p-5 rounded-2xl border ${schemeStyles.border} ${schemeStyles.bg} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight mt-1.5 ${schemeStyles.value}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl shadow-md ${schemeStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 font-semibold">
              {trend.isNeutral ? (
                <span className="text-slate-500 flex items-center gap-0.5">
                  <Minus className="w-3.5 h-3.5" /> {trend.value}
                </span>
              ) : trend.isPositive ? (
                <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" /> {trend.value}
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  <TrendingDown className="w-3.5 h-3.5" /> {trend.value}
                </span>
              )}
              {trend.comparisonText && (
                <span className="text-slate-400 font-normal">
                  {trend.comparisonText}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 font-medium">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
