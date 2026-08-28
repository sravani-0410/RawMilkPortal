'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/context/AnalyticsContext';
import { getTier, RawUser } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { Repeat, Trophy, Award, IndianRupee, Truck, Wallet, ExternalLink, Users } from 'lucide-react';

interface TopCustomerRow {
  rank: number;
  uid: string;
  userDisplayId: string;
  name: string;
  mobile: string;
  email: string;
  tier: 'silver' | 'gold';
  orderCount: number;
  deliveryCount: number;
  revenue: number;
  creditsUsed: number;
  creditsRemaining: number;
  daysActive: number;
}

export default function RetentionPage() {
  const { data, loading } = useAnalytics();
  const [sortOption, setSortOption] = useState<'revenue' | 'orders' | 'deliveries' | 'creditsUsed' | 'duration'>('revenue');

  const customerRows: TopCustomerRow[] = useMemo(() => {
    if (!data) return [];
    const now = new Date();

    const rows = data.users.map((u, idx) => {
      const userOrders = data.orders.filter((o) => o.userId === u.uid);
      const userTxs = data.walletTransactions.filter((t) => t.userId === u.uid);
      const userSub = data.subscriptions.find((s) => s.userId === u.uid);

      const orderCount = userOrders.length;
      const deliveryCount = userOrders.filter((o) => o.status === 'Delivered').length;

      let revenue = 0;
      userOrders.forEach((o) => {
        revenue += Number(o.totalAmount || 0);
      });

      let creditsUsed = 0;
      userTxs.forEach((t) => {
        const amt = Number(t.amount || 0);
        if (t.type === 'Milk Delivered' || amt < 0) creditsUsed += Math.abs(amt);
      });

      const createdAt = u.createdAt ? new Date(u.createdAt) : new Date('2026-01-01');
      const daysActive = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        rank: 0,
        uid: u.uid,
        userDisplayId: u.userId || `RM${100001 + idx}`,
        name: u.name || u.displayName || 'Customer',
        mobile: u.mobile || 'N/A',
        email: u.email || 'N/A',
        tier: getTier(userSub),
        orderCount,
        deliveryCount,
        revenue,
        creditsUsed,
        creditsRemaining: Number(u.walletBalance || 0),
        daysActive
      };
    });

    rows.sort((a, b) => {
      if (sortOption === 'revenue') return b.revenue - a.revenue;
      if (sortOption === 'orders') return b.orderCount - a.orderCount;
      if (sortOption === 'deliveries') return b.deliveryCount - a.deliveryCount;
      if (sortOption === 'creditsUsed') return b.creditsUsed - a.creditsUsed;
      if (sortOption === 'duration') return b.daysActive - a.daysActive;
      return 0;
    });

    rows.forEach((r, i) => {
      r.rank = i + 1;
    });

    return rows;
  }, [data, sortOption]);

  const retentionMetrics = useMemo(() => {
    if (!data) return { retentionRate: 0, repeatRate: 0 };
    const totalUsers = data.users.length;
    if (totalUsers === 0) return { retentionRate: 0, repeatRate: 0 };

    const repeatUsers = customerRows.filter((r) => r.orderCount >= 2).length;
    const activeUsers = customerRows.filter((r) => r.orderCount > 0).length;

    const repeatRate = Math.round((repeatUsers / totalUsers) * 100);
    const retentionRate = Math.round((activeUsers / totalUsers) * 100);

    return { retentionRate, repeatRate };
  }, [data, customerRows]);

  if (loading || !data) {
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
          <Repeat className="w-6 h-6 text-emerald-600" /> Retention & Top Customers Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identify your highest value, most active, and longest subscriber accounts for customer loyalty & retention.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Retention Rate"
          value={`${retentionMetrics.retentionRate}%`}
          subtitle="Percentage of active accounts"
          icon={Repeat}
          colorScheme="emerald"
        />
        <KpiCard
          title="Repeat Customer Rate"
          value={`${retentionMetrics.repeatRate}%`}
          subtitle="Accounts with 2+ orders"
          icon={Users}
          colorScheme="blue"
        />
        <KpiCard
          title="Top Customer Revenue"
          value={`₹${(customerRows[0]?.revenue || 0).toLocaleString()}`}
          subtitle={`Highest spender: ${customerRows[0]?.name || 'N/A'}`}
          icon={Trophy}
          colorScheme="amber"
        />
        <KpiCard
          title="Most Deliveries"
          value={`${customerRows.reduce((max, r) => Math.max(max, r.deliveryCount), 0)}`}
          subtitle="Highest fulfilled delivery count"
          icon={Truck}
          colorScheme="purple"
        />
      </div>

      {/* Control & Sorting Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-slate-900">Top Customers Ranking Table</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold uppercase">Rank By:</span>
          <select
            value={sortOption}
            onChange={(e: any) => setSortOption(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="revenue">Highest Revenue (₹) ↓</option>
            <option value="orders">Total Orders ↓</option>
            <option value="deliveries">Successful Deliveries ↓</option>
            <option value="creditsUsed">Credits Used ↓</option>
            <option value="duration">Subscription Duration ↓</option>
          </select>
        </div>
      </div>

      {/* Ranking Table */}
      <PaginationTable<TopCustomerRow>
        data={customerRows}
        defaultPageSize={25}
        emptyMessage="No customer records available for ranking."
        renderHeader={() => (
          <tr>
            <th className="py-3 px-4 text-center">Rank</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Contact</th>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4 text-center">Orders</th>
            <th className="py-3 px-4 text-center">Deliveries</th>
            <th className="py-3 px-4 text-right">Revenue</th>
            <th className="py-3 px-4 text-right">Credits Used</th>
            <th className="py-3 px-4 text-center">360 Profile</th>
          </tr>
        )}
        renderRow={(r) => (
          <tr key={r.uid} className="hover:bg-slate-50 transition">
            <td className="py-3.5 px-4 text-center">
              <span className={`w-7 h-7 rounded-xl inline-flex items-center justify-center font-black text-xs ${
                r.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                r.rank === 2 ? 'bg-slate-200 text-slate-800' :
                r.rank === 3 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                #{r.rank}
              </span>
            </td>
            <td className="py-3.5 px-4 font-bold text-slate-900">
              <span className="block text-sky-700 font-mono text-[10px]">{r.userDisplayId}</span>
              {r.name}
            </td>
            <td className="py-3.5 px-4 text-slate-500">
              <span className="block font-semibold text-slate-800">{r.mobile}</span>
              <span className="text-[10px]">{r.email}</span>
            </td>
            <td className="py-3.5 px-4">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                r.tier === 'gold' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {r.tier}
              </span>
            </td>
            <td className="py-3.5 px-4 text-center font-bold text-slate-800">{r.orderCount}</td>
            <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{r.deliveryCount}</td>
            <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{r.revenue.toLocaleString()}</td>
            <td className="py-3.5 px-4 text-right font-black text-purple-700">{r.creditsUsed}</td>
            <td className="py-3.5 px-4 text-center">
              <Link
                href={`/customer-360?q=${r.uid}`}
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold hover:underline"
              >
                Inspect <ExternalLink className="w-3 h-3" />
              </Link>
            </td>
          </tr>
        )}
        keyExtractor={(r) => r.uid}
      />
    </div>
  );
}
