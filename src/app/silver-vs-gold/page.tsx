'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, getTier } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { Award, Milk, Users, IndianRupee, Wallet, CheckCircle2, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function SilverVsGoldPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const chartData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        metric: 'Customers',
        Silver: metrics.silverCustomers,
        Gold: metrics.goldCustomers
      },
      {
        metric: 'Deliveries',
        Silver: metrics.silverDeliveries,
        Gold: metrics.goldDeliveries
      },
      {
        metric: 'Revenue (₹)',
        Silver: metrics.silverRevenue,
        Gold: metrics.goldRevenue
      },
      {
        metric: 'Remaining Credits',
        Silver: metrics.silverCreditsRemaining,
        Gold: metrics.goldCreditsRemaining
      }
    ];
  }, [metrics]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-600" /> Silver vs Gold Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Comparative performance metrics between Silver (500 ML • ₹1500 Plan) and Gold (1 L • ₹2700 Plan) subscription tiers.
        </p>
      </div>

      {/* Side-by-Side Detailed Tier Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Silver Tier Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black uppercase tracking-wider">
                SILVER TIER • 500 ML
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">₹1,500 Plan</h2>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold">
              500ML
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Active Customers</span>
              <span className="text-2xl font-black text-slate-900">{metrics.silverCustomers}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Total Deliveries</span>
              <span className="text-2xl font-black text-slate-900">{metrics.silverDeliveries}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Total Revenue</span>
              <span className="text-2xl font-black text-emerald-700">₹{metrics.silverRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Remaining Credits</span>
              <span className="text-2xl font-black text-sky-700">{metrics.silverCreditsRemaining}</span>
            </div>
          </div>
        </div>

        {/* Gold Tier Card */}
        <div className="bg-gradient-to-br from-amber-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-800 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-800/80 pb-4">
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-black uppercase tracking-wider border border-amber-500/30">
                GOLD TIER • 1 LITRE
              </span>
              <h2 className="text-2xl font-black text-amber-100 mt-2">₹2,700 Plan</h2>
            </div>
            <div className="w-12 h-12 bg-amber-900/60 rounded-2xl flex items-center justify-center text-amber-300 font-black">
              1L
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/50">
              <span className="text-amber-400 font-bold uppercase block text-[10px]">Active Customers</span>
              <span className="text-2xl font-black text-amber-100">{metrics.goldCustomers}</span>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/50">
              <span className="text-amber-400 font-bold uppercase block text-[10px]">Total Deliveries</span>
              <span className="text-2xl font-black text-amber-100">{metrics.goldDeliveries}</span>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/50">
              <span className="text-amber-400 font-bold uppercase block text-[10px]">Total Revenue</span>
              <span className="text-2xl font-black text-emerald-400">₹{metrics.goldRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/50">
              <span className="text-amber-400 font-bold uppercase block text-[10px]">Remaining Credits</span>
              <span className="text-2xl font-black text-amber-300">{metrics.goldCreditsRemaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Comparison Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-600" /> Tier Distribution & Volume Comparison
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="Silver" fill="#64748b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Gold" fill="#d97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
