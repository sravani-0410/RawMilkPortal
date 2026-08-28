'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, RawOrder } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { CheckCircle2, Truck, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function DeliveryAnalyticsPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const deliveryRates = useMemo(() => {
    if (!metrics || metrics.totalDeliveries === 0) {
      return { successRate: 100, skipRate: 0, pendingRate: 0 };
    }
    const totalScheduled = metrics.totalDeliveries + metrics.todayPending + metrics.todaySkipped;
    if (totalScheduled === 0) return { successRate: 100, skipRate: 0, pendingRate: 0 };

    const successRate = Math.round((metrics.totalDeliveries / totalScheduled) * 100);
    const skipRate = Math.round((metrics.todaySkipped / totalScheduled) * 100);
    const pendingRate = Math.round((metrics.todayPending / totalScheduled) * 100);

    return { successRate, skipRate, pendingRate };
  }, [metrics]);

  const deliveryTrendData = useMemo(() => {
    if (!data) return [];
    const deliveriesByDate: Record<string, { delivered: number; skipped: number }> = {};

    data.orders.forEach((o) => {
      const d = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';
      if (!deliveriesByDate[d]) deliveriesByDate[d] = { delivered: 0, skipped: 0 };
      if (o.status === 'Delivered') deliveriesByDate[d].delivered++;
      if (o.status === 'Skipped') deliveriesByDate[d].skipped++;
    });

    return Object.keys(deliveriesByDate)
      .sort()
      .slice(-14)
      .map((d) => ({
        date: d.split('-').slice(1).join('/'),
        Delivered: deliveriesByDate[d].delivered,
        Skipped: deliveriesByDate[d].skipped
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
          <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Delivery Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Delivery success rates, skip rates, pending dispatch tracking, and volume trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Delivered"
          value={metrics.totalDeliveries.toLocaleString()}
          subtitle={`${deliveryRates.successRate}% Success Rate`}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Today's Deliveries"
          value={metrics.todayDeliveries.toLocaleString()}
          subtitle={`${metrics.todayMilkVolumeL} Litres delivered`}
          icon={Truck}
          colorScheme="blue"
        />
        <KpiCard
          title="Pending Dispatches"
          value={metrics.todayPending.toLocaleString()}
          subtitle={`${deliveryRates.pendingRate}% Pending Rate`}
          icon={Clock}
          colorScheme="amber"
        />
        <KpiCard
          title="Skipped Deliveries"
          value={metrics.todaySkipped.toLocaleString()}
          subtitle={`${deliveryRates.skipRate}% Skip Rate`}
          icon={XCircle}
          colorScheme="rose"
        />
      </div>

      {/* Delivery Trend Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Daily Delivery Fulfillment Trend
        </h3>
        <div className="h-72 w-full">
          {deliveryTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryTrendData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="Delivered" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Skipped" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No delivery trend records.
            </div>
          )}
        </div>
      </div>

      {/* Delivery Log Table */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Fulfilled Delivery Records</h3>
        <PaginationTable<RawOrder>
          data={data.orders.filter((o) => o.status === 'Delivered' || o.status === 'Skipped')}
          defaultPageSize={25}
          emptyMessage="No delivery records found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">Delivery ID</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Delivery Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Credits Deducted</th>
            </tr>
          )}
          renderRow={(d, i) => (
            <tr key={d._id || d.id || i} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{d.id || d._id}</td>
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{d.userId}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{d.deliveryDate || d.createdAt || 'N/A'}</td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                  d.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {d.status}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-slate-900">
                {d.status === 'Delivered' ? '-1 Credit' : '0 Credits'}
              </td>
            </tr>
          )}
          keyExtractor={(d, i) => d._id || d.id || String(i)}
        />
      </div>
    </div>
  );
}
