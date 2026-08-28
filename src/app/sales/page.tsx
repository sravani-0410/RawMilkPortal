'use client';

import React, { useState, useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, isDateInRange, getBoundsForRange } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { TrendingUp, IndianRupee, ShoppingBag, CheckCircle2, Truck, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';

export default function SalesAnalyticsPage() {
  const { data, loading, dateFilter } = useAnalytics();
  const [timeGroup, setTimeGroup] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const salesBreakdown = useMemo(() => {
    if (!data) return { todayRev: 0, weekRev: 0, monthRev: 0, avgDailyRev: 0 };
    const todayBounds = getBoundsForRange({ preset: 'today' });
    const weekBounds = getBoundsForRange({ preset: '7days' });
    const monthBounds = getBoundsForRange({ preset: 'thisMonth' });

    let todayRev = 0;
    let weekRev = 0;
    let monthRev = 0;

    data.orders.forEach((o) => {
      const rev = Number(o.totalAmount || 0);
      if (isDateInRange(o.createdAt || o.deliveryDate, todayBounds)) todayRev += rev;
      if (isDateInRange(o.createdAt || o.deliveryDate, weekBounds)) weekRev += rev;
      if (isDateInRange(o.createdAt || o.deliveryDate, monthBounds)) monthRev += rev;
    });

    const avgDailyRev = Math.round(weekRev / 7);

    return { todayRev, weekRev, monthRev, avgDailyRev };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const dateMap: Record<string, { revenue: number; orders: number; deliveries: number }> = {};

    data.orders.forEach((o) => {
      let key = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';

      if (timeGroup === 'weekly') {
        const d = new Date(key);
        const firstDay = new Date(d.setDate(d.getDate() - d.getDay()));
        key = `W-${firstDay.toISOString().split('T')[0].substring(5)}`;
      } else if (timeGroup === 'monthly') {
        key = key.substring(0, 7); // YYYY-MM
      } else {
        key = key.split('-').slice(1).join('/'); // MM/DD
      }

      if (!dateMap[key]) dateMap[key] = { revenue: 0, orders: 0, deliveries: 0 };
      dateMap[key].revenue += Number(o.totalAmount || 0);
      dateMap[key].orders++;
      if (o.status === 'Delivered') dateMap[key].deliveries++;
    });

    return Object.keys(dateMap)
      .sort()
      .slice(-14)
      .map((k) => ({
        label: k,
        Revenue: dateMap[k].revenue,
        Orders: dateMap[k].orders,
        Deliveries: dateMap[k].deliveries
      }));
  }, [data, timeGroup]);

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
          <TrendingUp className="w-6 h-6 text-sky-600" /> Sales & Revenue Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed sales volume, daily/weekly/monthly revenue breakdowns, and order-to-delivery conversions.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          subtitle="Cumulative sales revenue"
          icon={IndianRupee}
          colorScheme="indigo"
        />
        <KpiCard
          title="Today's Revenue"
          value={`₹${salesBreakdown.todayRev.toLocaleString()}`}
          subtitle="Current day sales"
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <KpiCard
          title="This Month's Revenue"
          value={`₹${salesBreakdown.monthRev.toLocaleString()}`}
          subtitle="Current month total"
          icon={Calendar}
          colorScheme="purple"
        />
        <KpiCard
          title="Average Daily Sales"
          value={`₹${salesBreakdown.avgDailyRev.toLocaleString()}`}
          subtitle="7-day moving average"
          icon={ShoppingBag}
          colorScheme="blue"
        />
      </div>

      {/* Time Group Controls & Sales Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-600" /> Sales & Order Fulfillment Comparison
          </h3>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['daily', 'weekly', 'monthly'] as const).map((group) => (
              <button
                key={group}
                onClick={() => setTimeGroup(group)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  timeGroup === group
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="Revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Deliveries" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No sales records available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
