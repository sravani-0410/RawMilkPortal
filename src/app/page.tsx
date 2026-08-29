'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, computeInactiveCustomers } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { KpiSkeletonGrid, ChartSkeleton, TableSkeleton } from '@/components/analytics/SkeletonLoader';
import { 
  Users, 
  CalendarCheck, 
  Truck, 
  IndianRupee, 
  Wallet, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCw,
  Award,
  Milk
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function OverviewPage() {
  const { data, loading, error, dateFilter, refreshData } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const inactiveReport = useMemo(() => {
    if (!data) return [];
    return computeInactiveCustomers(data, 5);
  }, [data]);

  const lowCreditUsers = useMemo(() => {
    if (!data) return [];
    return data.users.filter((u) => Number(u.walletBalance || 0) <= 5);
  }, [data]);

  const revenueChartData = useMemo(() => {
    if (!data) return [];
    const revenueByDate: Record<string, number> = {};
    data.orders.forEach((o) => {
      const d = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';
      revenueByDate[d] = (revenueByDate[d] || 0) + Number(o.totalAmount || 0);
    });

    return Object.keys(revenueByDate)
      .sort()
      .slice(-14)
      .map((d) => ({
        date: d.split('-').slice(1).join('/'),
        revenue: revenueByDate[d]
      }));
  }, [data]);

  if (loading || !data || !metrics) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-slate-200 rounded-md w-64 animate-pulse"></div>
        <KpiSkeletonGrid count={4} />
        <KpiSkeletonGrid count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton title="Revenue Trend Loading..." />
          </div>
          <ChartSkeleton title="Operational Dispatch Status Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Database Connection Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => refreshData(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Delivered', value: metrics.todayDeliveries, color: '#10b981' },
    { name: 'Pending', value: metrics.todayPending, color: '#f59e0b' },
    { name: 'Skipped', value: metrics.todaySkipped, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Executive Title & Snapshot Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Executive Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Business Intelligence calculated from live database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-600 shadow-xs">
          <span>Active Users: <strong className="text-slate-900">{metrics.activeCustomers}</strong></span>
          <span className="text-slate-200">|</span>
          <span>Active Subscriptions: <strong className="text-sky-700">{metrics.activeSubscriptions}</strong></span>
          <span className="text-slate-200">|</span>
          <span>Range Revenue: <strong className="text-emerald-700">₹{metrics.totalRevenue.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Row 1 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          subtitle={`${metrics.activeCustomers} Active • ${metrics.inactiveCustomers} Inactive`}
          icon={Users}
          colorScheme="blue"
        />
        <KpiCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toLocaleString()}
          subtitle={`${metrics.silverCustomers} Silver (500ML) • ${metrics.goldCustomers} Gold (1L)`}
          icon={CalendarCheck}
          colorScheme="purple"
        />
        <KpiCard
          title="Today's Deliveries"
          value={metrics.todayDeliveries.toLocaleString()}
          subtitle={`${metrics.todayMilkVolumeL} Litres delivered today`}
          icon={Truck}
          colorScheme="emerald"
        />
        <KpiCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          subtitle={`Today: ₹${metrics.todayRevenue.toLocaleString()}`}
          icon={IndianRupee}
          colorScheme="indigo"
        />
      </div>

      {/* Row 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Credits Remaining"
          value={metrics.totalCreditsRemaining.toLocaleString()}
          subtitle="Across all customer wallets"
          icon={Wallet}
          colorScheme="amber"
        />
        <KpiCard
          title="Credits Used"
          value={metrics.totalCreditsUsed.toLocaleString()}
          subtitle="Confirmed milk deliveries fulfilled"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Total Milk Sold"
          value={`${metrics.totalMilkVolumeL} L`}
          subtitle={`Silver: ${metrics.silverDeliveries * 0.5}L • Gold: ${metrics.goldDeliveries * 1.0}L`}
          icon={Milk}
          colorScheme="blue"
        />
        <Link href="/slot-requests" className="block transition-transform hover:-translate-y-0.5">
          <KpiCard
            title="Slot Requests"
            value={(data?.slotRequests?.length || 0).toLocaleString()}
            subtitle={`New: ${data?.slotRequests?.filter(r => (r.status || 'NEW').toUpperCase().trim() === 'NEW').length || 0} Pending Requests`}
            icon={Clock}
            colorScheme="indigo"
          />
        </Link>
      </div>

      {/* Silver vs Gold Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SILVER TIER • 500 ML (₹1500 Plan)</span>
            <div className="text-2xl font-black mt-1 text-slate-100">{metrics.silverCustomers} Active Customers</div>
            <div className="text-xs text-slate-300 mt-2 flex gap-4">
              <span>Deliveries: <strong>{metrics.silverDeliveries}</strong></span>
              <span>Revenue: <strong>₹{metrics.silverRevenue.toLocaleString()}</strong></span>
              <span>Credits Left: <strong>{metrics.silverCreditsRemaining}</strong></span>
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-slate-300">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-950 to-amber-900 text-amber-50 rounded-2xl p-6 shadow-md border border-amber-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">GOLD TIER • 1 L (₹2700 Plan)</span>
            <div className="text-2xl font-black mt-1 text-amber-100">{metrics.goldCustomers} Active Customers</div>
            <div className="text-xs text-amber-200 mt-2 flex gap-4">
              <span>Deliveries: <strong>{metrics.goldDeliveries}</strong></span>
              <span>Revenue: <strong>₹{metrics.goldRevenue.toLocaleString()}</strong></span>
              <span>Credits Left: <strong>{metrics.goldCreditsRemaining}</strong></span>
            </div>
          </div>
          <div className="p-3 bg-amber-900 rounded-xl border border-amber-700 text-amber-300">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" /> Revenue Trend (Live Orders)
              </h3>
              <p className="text-xs text-slate-500">Daily revenue calculated from actual database transactions.</p>
            </div>
            <Link
              href="/sales"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Sales Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64 w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                No revenue records for this period.
              </div>
            )}
          </div>
        </div>

        {/* Today's Operational Status Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-emerald-600" /> Today's Operational Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown of scheduled daily dispatches.</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs font-medium">
                No dispatch logs for today.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4 pt-3 border-t border-slate-100">
            <div>
              <span className="block font-bold text-emerald-600 text-sm">{metrics.todayDeliveries}</span>
              <span className="text-slate-500">Delivered</span>
            </div>
            <div>
              <span className="block font-bold text-amber-600 text-sm">{metrics.todayPending}</span>
              <span className="text-slate-500">Pending</span>
            </div>
            <div>
              <span className="block font-bold text-rose-600 text-sm">{metrics.todaySkipped}</span>
              <span className="text-slate-500">Skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Required Grids: Inactive Customers & Low Credits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Customers Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Inactive Customers (5+ Days)
            </h3>
            <Link
              href="/inactive-customers"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Full Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Days Inactive</th>
                  <th className="py-2.5 px-3 text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inactiveReport.slice(0, 5).map((row) => (
                  <tr key={row.uid} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <Link href={`/customer-360?q=${row.uid}`} className="hover:text-sky-600">
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{row.mobile}</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-600">{row.daysInactiveDisplay}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">{row.creditsRemaining}</td>
                  </tr>
                ))}
                {inactiveReport.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs font-medium">
                      No inactive customers matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Credit Warning Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-rose-500" /> Low Credit Alerts (≤5 Credits)
            </h3>
            <Link
              href="/credit-analytics"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Credit Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowCreditUsers.slice(0, 5).map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <Link href={`/customer-360?q=${u.uid}`} className="hover:text-sky-600">
                        {u.name || u.displayName || 'User'}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{u.mobile || 'N/A'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        Number(u.walletBalance || 0) === 0 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {Number(u.walletBalance || 0) === 0 ? 'Zero Credits' : 'Low Credits'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-600">
                      {u.walletBalance || 0}
                    </td>
                  </tr>
                ))}
                {lowCreditUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs font-medium">
                      All customer wallets have sufficient credits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
