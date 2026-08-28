'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, getTier, RawSubscription } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { CalendarCheck, Users, Award, TrendingUp, XCircle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function SubscriptionsAnalyticsPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const noPlanCount = useMemo(() => {
    if (!data) return 0;
    return data.users.filter((u) => u.subscriptionStatus === 'No Plan' || !data.subscriptions.some((s) => s.userId === u.uid)).length;
  }, [data]);

  const growthChartData = useMemo(() => {
    if (!data) return [];
    const subsByMonth: Record<string, number> = {};
    data.subscriptions.forEach((s) => {
      const d = s.createdAt || s.startDate;
      if (d) {
        const monthKey = d.substring(0, 7); // YYYY-MM
        subsByMonth[monthKey] = (subsByMonth[monthKey] || 0) + 1;
      }
    });

    return Object.keys(subsByMonth)
      .sort()
      .slice(-12)
      .map((m) => ({
        month: m,
        subscriptions: subsByMonth[m]
      }));
  }, [data]);

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
          <CalendarCheck className="w-6 h-6 text-purple-600" /> Subscription Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Subscriber metrics, Silver/Gold tier distribution, and active plan growth calculated from live database records.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Subscribers"
          value={metrics.activeSubscriptions.toLocaleString()}
          subtitle="Users with active subscription plans"
          icon={CalendarCheck}
          colorScheme="purple"
        />
        <KpiCard
          title="Active Plans"
          value={metrics.activeSubscriptions.toLocaleString()}
          subtitle="ACTIVE PLAN Status"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="No Plan / Expired"
          value={noPlanCount.toLocaleString()}
          subtitle="Users currently without active plan"
          icon={XCircle}
          colorScheme="amber"
        />
        <KpiCard
          title="Silver vs Gold Ratio"
          value={`${metrics.silverCustomers} : ${metrics.goldCustomers}`}
          subtitle="Silver (500ML) vs Gold (1L)"
          icon={Award}
          colorScheme="blue"
        />
      </div>

      {/* Subscription Growth Graph */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" /> Subscription Registrations & Growth
        </h3>
        <div className="h-64 w-full">
          {growthChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthChartData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="subscriptions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No historical subscription growth logs.
            </div>
          )}
        </div>
      </div>

      {/* Subscription Directory Table */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Active Subscriptions Directory</h3>
        <PaginationTable<RawSubscription>
          data={data.subscriptions}
          defaultPageSize={25}
          emptyMessage="No subscription records found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Plan Name</th>
              <th className="py-3 px-4">Unit Size</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Plan Value</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Start Date</th>
            </tr>
          )}
          renderRow={(s, i) => (
            <tr key={s._id || s.id || i} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{s.userId}</td>
              <td className="py-3.5 px-4 font-bold text-slate-900">{s.productTitle || 'Milk Subscription'}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{s.unitSize || (getTier(s) === 'gold' ? '1L' : '500ml')}</td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                  getTier(s) === 'gold' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {getTier(s)}
                </span>
              </td>
              <td className="py-3.5 px-4 font-bold text-emerald-700">₹{s.planValue || (getTier(s) === 'gold' ? 2700 : 1500)}</td>
              <td className="py-3.5 px-4">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  {s.status || 'ACTIVE PLAN'}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-500 font-medium">{s.startDate || s.createdAt || 'N/A'}</td>
            </tr>
          )}
          keyExtractor={(s, i) => s._id || s.id || String(i)}
        />
      </div>
    </div>
  );
}
