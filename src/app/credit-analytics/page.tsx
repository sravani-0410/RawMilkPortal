'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, isDateInRange, getBoundsForRange } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { Wallet, CheckCircle2, RotateCw, AlertTriangle, TrendingUp, UserCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function CreditAnalyticsPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const creditBreakdown = useMemo(() => {
    if (!data) return null;

    const todayBounds = getBoundsForRange({ preset: 'today' });
    const weekBounds = getBoundsForRange({ preset: '7days' });
    const monthBounds = getBoundsForRange({ preset: 'thisMonth' });

    let usedToday = 0;
    let usedWeek = 0;
    let usedMonth = 0;

    let givenToday = 0;
    let givenMonth = 0;

    data.walletTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      const isDeliveredMilk = t.type === 'Milk Delivered' || (amt < 0 && t.type !== 'Admin Adjustment');
      const isAdminAdd = t.type === 'Admin Add' || amt > 0;

      if (isDeliveredMilk) {
        if (isDateInRange(t.createdAt, todayBounds)) usedToday += Math.abs(amt);
        if (isDateInRange(t.createdAt, weekBounds)) usedWeek += Math.abs(amt);
        if (isDateInRange(t.createdAt, monthBounds)) usedMonth += Math.abs(amt);
      }

      if (isAdminAdd) {
        if (isDateInRange(t.createdAt, todayBounds)) givenToday += amt;
        if (isDateInRange(t.createdAt, monthBounds)) givenMonth += amt;
      }
    });

    return { usedToday, usedWeek, usedMonth, givenToday, givenMonth };
  }, [data]);

  const usageTrendData = useMemo(() => {
    if (!data) return [];
    const creditsByDate: Record<string, number> = {};
    data.walletTransactions.forEach((t) => {
      if (t.type === 'Milk Delivered' || (t.amount < 0 && t.type !== 'Admin Adjustment')) {
        const d = t.createdAt ? t.createdAt.split('T')[0] : 'Unknown';
        creditsByDate[d] = (creditsByDate[d] || 0) + Math.abs(t.amount);
      }
    });

    return Object.keys(creditsByDate)
      .sort()
      .slice(-14)
      .map((d) => ({
        date: d.split('-').slice(1).join('/'),
        creditsUsed: creditsByDate[d]
      }));
  }, [data]);

  if (loading || !data || !metrics || !creditBreakdown) {
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
          <Wallet className="w-6 h-6 text-amber-600" /> Credit & Wallet Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Strict credit tracking. Note: Only confirmed DELIVERED milk orders consume credits (-1 credit). Skipped & pending orders consume 0 credits.
        </p>
      </div>

      {/* Row 1 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Credits Remaining"
          value={metrics.totalCreditsRemaining.toLocaleString()}
          subtitle="Sum of all user wallet balances"
          icon={Wallet}
          colorScheme="amber"
        />
        <KpiCard
          title="Total Credits Used"
          value={metrics.totalCreditsUsed.toLocaleString()}
          subtitle="Confirmed milk deliveries fulfilled"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Total Credits Given"
          value={metrics.totalCreditsGiven.toLocaleString()}
          subtitle="Allocated by admin / subscriptions"
          icon={UserCheck}
          colorScheme="sky"
        />
        <KpiCard
          title="Admin Removed"
          value={metrics.totalCreditsRemoved.toLocaleString()}
          subtitle="Adjusted or removed by admin"
          icon={AlertTriangle}
          colorScheme="rose"
        />
      </div>

      {/* Row 2 Time-Based Credit Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Used Today</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{creditBreakdown.usedToday}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Used This Week</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{creditBreakdown.usedWeek}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Given Today</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">+{creditBreakdown.givenToday}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Given This Month</span>
          <span className="text-2xl font-black text-sky-700 mt-1 block">+{creditBreakdown.givenMonth}</span>
        </div>
      </div>

      {/* Credit Usage Trend Graph */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Daily Credit Consumption Trend
        </h3>
        <div className="h-64 w-full">
          {usageTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageTrendData}>
                <defs>
                  <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Credits`, 'Milk Delivered']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="creditsUsed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCredit)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No credit usage logs for this period.
            </div>
          )}
        </div>
      </div>

      {/* Wallet Transactions Log Table */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Wallet Transactions History</h3>
        <PaginationTable
          data={data.walletTransactions}
          defaultPageSize={25}
          emptyMessage="No wallet transaction records found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          )}
          renderRow={(t, i) => (
            <tr key={t._id || t.transactionId || i} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{t.transactionId || t._id || `TX${1000 + i}`}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}</td>
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{t.userDisplayId || t.userId}</td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                  t.type === 'Admin Add' || t.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {t.type}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-600">{t.reason || 'N/A'}</td>
              <td className={`py-3.5 px-4 text-right font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {t.amount > 0 ? `+${t.amount}` : t.amount}
              </td>
            </tr>
          )}
          keyExtractor={(t, i) => t._id || t.transactionId || String(i)}
        />
      </div>
    </div>
  );
}
