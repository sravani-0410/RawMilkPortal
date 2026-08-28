'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, computeInactiveCustomers, InactiveCustomerRow } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { Users, UserCheck, Clock, Calendar, ExternalLink, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function CustomerActivityPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const activityBreakdown = useMemo(() => {
    if (!data) return [];
    return computeInactiveCustomers(data, 0); // Get all customers with inactivity days calculated
  }, [data]);

  const activityBuckets = useMemo(() => {
    if (!activityBreakdown) return { day1: 0, days3: 0, days5: 0, days7: 0, days14: 0, days30: 0 };
    return {
      day1: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive <= 1).length,
      days3: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive >= 3 && r.daysInactive < 5).length,
      days5: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive >= 5 && r.daysInactive < 7).length,
      days7: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive >= 7 && r.daysInactive < 14).length,
      days14: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive >= 14 && r.daysInactive < 30).length,
      days30: activityBreakdown.filter((r) => r.daysInactive !== null && r.daysInactive >= 30).length
    };
  }, [activityBreakdown]);

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
          <Activity className="w-6 h-6 text-sky-600" /> Customer Activity Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor customer activity timelines, active vs inactive user ratios, and recent delivery engagements.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          subtitle="Registered user accounts"
          icon={Users}
          colorScheme="blue"
        />
        <KpiCard
          title="Active (Last 30 Days)"
          value={metrics.activeCustomers.toLocaleString()}
          subtitle="Recent order/delivery activity"
          icon={UserCheck}
          colorScheme="emerald"
        />
        <KpiCard
          title="Inactive Accounts"
          value={metrics.inactiveCustomers.toLocaleString()}
          subtitle="No activity in 30+ days"
          icon={Clock}
          colorScheme="amber"
        />
        <KpiCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toLocaleString()}
          subtitle="ACTIVE PLAN Status"
          icon={Calendar}
          colorScheme="purple"
        />
      </div>

      {/* Inactivity Period Breakdown Cards */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Customer Recency & Inactivity Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Active (≤1 Day)</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{activityBuckets.day1}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">3+ Days Ago</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">{activityBuckets.days3}</span>
          </div>
          <div className="bg-amber-100/60 border border-amber-300 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">5+ Days Ago</span>
            <span className="text-2xl font-black text-amber-950 mt-1 block">{activityBuckets.days5}</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-orange-700 uppercase block">7+ Days Ago</span>
            <span className="text-2xl font-black text-orange-900 mt-1 block">{activityBuckets.days7}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">14+ Days Ago</span>
            <span className="text-2xl font-black text-rose-900 mt-1 block">{activityBuckets.days14}</span>
          </div>
          <div className="bg-slate-100 border border-slate-300 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">30+ Days Ago</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{activityBuckets.days30}</span>
          </div>
        </div>
      </div>

      {/* Customer Activity Directory */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">All Customers Activity Directory</h3>
        <PaginationTable<InactiveCustomerRow>
          data={activityBreakdown}
          defaultPageSize={25}
          emptyMessage="No customer records found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Last Delivery</th>
              <th className="py-3 px-4 text-center">Days Inactive</th>
              <th className="py-3 px-4 text-right">Remaining Credits</th>
              <th className="py-3 px-4 text-center">360 View</th>
            </tr>
          )}
          renderRow={(r) => (
            <tr key={r.uid} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{r.userDisplayId}</td>
              <td className="py-3.5 px-4 font-bold text-slate-900">{r.name}</td>
              <td className="py-3.5 px-4 text-slate-500 font-medium">{r.mobile}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{r.lastDeliveryDate}</td>
              <td className="py-3.5 px-4 text-center">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                  r.daysInactive === null ? 'bg-slate-100 text-slate-600' :
                  r.daysInactive <= 1 ? 'bg-emerald-100 text-emerald-800' :
                  r.daysInactive <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {r.daysInactiveDisplay}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-slate-900">{r.creditsRemaining}</td>
              <td className="py-3.5 px-4 text-center">
                <Link href={`/customer-360?q=${r.uid}`} className="text-sky-600 font-bold hover:underline">
                  Inspect
                </Link>
              </td>
            </tr>
          )}
          keyExtractor={(r) => r.uid}
        />
      </div>
    </div>
  );
}
