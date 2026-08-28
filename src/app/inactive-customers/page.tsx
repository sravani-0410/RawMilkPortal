'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeInactiveCustomers, InactiveCustomerRow } from '@/services/analyticsService';
import { exportToCSV, exportToExcel } from '@/lib/exportUtils';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { KpiCard } from '@/components/analytics/KpiCard';
import { TableSkeleton } from '@/components/analytics/SkeletonLoader';
import { UserX, Download, FileSpreadsheet, ExternalLink, AlertTriangle, Wallet, IndianRupee, RotateCcw } from 'lucide-react';

export default function InactiveCustomersPage() {
  const { data, loading } = useAnalytics();
  const [minDaysFilter, setMinDaysFilter] = useState<number>(5);
  const [sortOption, setSortOption] = useState<'mostInactive' | 'recentlyInactive' | 'creditsHigh' | 'spendingHigh' | 'name'>('mostInactive');

  const rawRows = useMemo(() => {
    if (!data) return [];
    return computeInactiveCustomers(data, minDaysFilter);
  }, [data, minDaysFilter]);

  const sortedRows = useMemo(() => {
    return [...rawRows].sort((a, b) => {
      if (sortOption === 'mostInactive') return (b.daysInactive ?? -1) - (a.daysInactive ?? -1);
      if (sortOption === 'recentlyInactive') return (a.daysInactive ?? 9999) - (b.daysInactive ?? 9999);
      if (sortOption === 'creditsHigh') return b.creditsRemaining - a.creditsRemaining;
      if (sortOption === 'spendingHigh') return b.historicalSpending - a.historicalSpending;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [rawRows, sortOption]);

  const stats = useMemo(() => {
    const totalInactive = sortedRows.length;
    const totalUnusedCredits = sortedRows.reduce((acc, r) => acc + r.creditsRemaining, 0);
    // Estimated lost revenue based on daily price (~₹50 for Silver 500ml, ~₹90 for Gold 1L)
    const estimatedLostRevenue = sortedRows.reduce((acc, r) => {
      const dailyRate = r.tier === 'gold' ? 90 : 50;
      const days = r.daysInactive ?? 0;
      return acc + (days * dailyRate);
    }, 0);

    const potentialRecoveryValue = sortedRows.reduce((acc, r) => {
      const planVal = r.tier === 'gold' ? 2700 : 1500;
      return acc + planVal;
    }, 0);

    return { totalInactive, totalUnusedCredits, estimatedLostRevenue, potentialRecoveryValue };
  }, [sortedRows]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-md w-64 animate-pulse"></div>
        <TableSkeleton />
      </div>
    );
  }

  const getExportData = () => {
    return sortedRows.map((r) => ({
      'User ID': r.userDisplayId,
      'Customer Name': r.name,
      Mobile: r.mobile,
      Email: r.email,
      Tier: r.tier.toUpperCase(),
      'Days Inactive': r.daysInactiveDisplay,
      'Last Order Date': r.lastOrderDate,
      'Last Delivery Date': r.lastDeliveryDate,
      'Credits Given': r.creditsGiven,
      'Credits Used': r.creditsUsed,
      'Credits Remaining': r.creditsRemaining,
      'Historical Spending': `₹${r.historicalSpending}`,
      Subscription: r.subscriptionStatus
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserX className="w-6 h-6 text-amber-600" /> Inactive Customer Intelligence Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated intelligence & retention targeting for inactive accounts based on database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(getExportData(), `Inactive_Customers_${minDaysFilter}d`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" /> CSV Export
          </button>
          <button
            onClick={() => exportToExcel(getExportData(), `Inactive_Customers_${minDaysFilter}d`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel Export
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Inactive Customers"
          value={stats.totalInactive.toLocaleString()}
          subtitle={`No delivery for ${minDaysFilter}+ days`}
          icon={UserX}
          colorScheme="amber"
        />
        <KpiCard
          title="Total Unused Credits"
          value={stats.totalUnusedCredits.toLocaleString()}
          subtitle="Remaining in inactive wallets"
          icon={Wallet}
          colorScheme="purple"
        />
        <KpiCard
          title="Est. Lost Revenue"
          value={`₹${stats.estimatedLostRevenue.toLocaleString()}`}
          subtitle="Calculated during inactivity period"
          icon={IndianRupee}
          colorScheme="rose"
        />
        <KpiCard
          title="Recovery Potential"
          value={`₹${stats.potentialRecoveryValue.toLocaleString()}`}
          subtitle="Full plan renewal value"
          icon={RotateCcw}
          colorScheme="emerald"
        />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-500 uppercase mr-1">Inactivity Filter:</span>
          {[3, 5, 7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setMinDaysFilter(days)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                minDaysFilter === days
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {days}+ Days
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase">Sort By:</span>
          <select
            value={sortOption}
            onChange={(e: any) => setSortOption(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="mostInactive">Most Inactive ↓</option>
            <option value="recentlyInactive">Recently Inactive ↑</option>
            <option value="creditsHigh">Highest Unused Credits ↓</option>
            <option value="spendingHigh">Highest Historical Spending ↓</option>
            <option value="name">Customer Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Paginated Intelligence Table */}
      <PaginationTable<InactiveCustomerRow>
        data={sortedRows}
        defaultPageSize={25}
        emptyMessage={`No customers found with ${minDaysFilter}+ days of inactivity.`}
        renderHeader={() => (
          <tr>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Contact</th>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4">Last Order</th>
            <th className="py-3 px-4">Last Delivery</th>
            <th className="py-3 px-4 text-center">Days Inactive</th>
            <th className="py-3 px-4 text-right">Given</th>
            <th className="py-3 px-4 text-right">Used</th>
            <th className="py-3 px-4 text-right">Remaining</th>
            <th className="py-3 px-4 text-center">360 View</th>
          </tr>
        )}
        renderRow={(r) => (
          <tr key={r.uid} className="hover:bg-amber-50/40 transition">
            <td className="py-3.5 px-4 font-bold text-slate-900">
              <span className="block text-sky-700 font-mono text-[10px]">{r.userDisplayId}</span>
              {r.name}
            </td>
            <td className="py-3.5 px-4 text-slate-500">
              <span className="block text-slate-900 font-semibold">{r.mobile}</span>
              <span className="text-[10px]">{r.email}</span>
            </td>
            <td className="py-3.5 px-4">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                r.tier === 'gold' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {r.tier}
              </span>
            </td>
            <td className="py-3.5 px-4 text-slate-600 font-medium">{r.lastOrderDate}</td>
            <td className="py-3.5 px-4 text-slate-600 font-medium">{r.lastDeliveryDate}</td>
            <td className="py-3.5 px-4 text-center">
              <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                r.daysInactive === null ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-900'
              }`}>
                {r.daysInactiveDisplay}
              </span>
            </td>
            <td className="py-3.5 px-4 text-right text-slate-500 font-medium">{r.creditsGiven}</td>
            <td className="py-3.5 px-4 text-right text-slate-500 font-medium">{r.creditsUsed}</td>
            <td className="py-3.5 px-4 text-right font-black text-slate-900">{r.creditsRemaining}</td>
            <td className="py-3.5 px-4 text-center">
              <Link
                href={`/customer-360?q=${r.uid}`}
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold hover:underline"
              >
                360 Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </td>
          </tr>
        )}
        keyExtractor={(item) => item.uid}
      />
    </div>
  );
}
