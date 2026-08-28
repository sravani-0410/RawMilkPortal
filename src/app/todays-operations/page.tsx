'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, computeInactiveCustomers, getTier } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { Truck, Clock, CheckCircle2, XCircle, AlertTriangle, Wallet, ArrowRight, UserX, Phone, ExternalLink } from 'lucide-react';

export default function TodaysOperationsPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

  const lowCreditUsers = useMemo(() => {
    if (!data) return [];
    return data.users.filter((u) => Number(u.walletBalance || 0) <= 5);
  }, [data]);

  const inactiveUsers = useMemo(() => {
    if (!data) return [];
    return computeInactiveCustomers(data, 5);
  }, [data]);

  const todayDeliveriesList = useMemo(() => {
    if (!data) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return data.orders.filter((o) => (o.deliveryDate && o.deliveryDate.startsWith(todayStr)) || (o.createdAt && o.createdAt.startsWith(todayStr)));
  }, [data]);

  if (loading || !data || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalExpected = metrics.todayDeliveries + metrics.todayPending + metrics.todaySkipped;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" /> Today's Live Dispatch & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily dispatch tracking, pending deliveries, low-credit alerts, and priority action items.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OPERATIONAL PULSE: LIVE</span>
        </div>
      </div>

      {/* Priority Operational Issues Banner */}
      {(lowCreditUsers.length > 0 || metrics.todayPending > 0) && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 block">PRIORITY ACTION REQUIRED</span>
            <h3 className="text-lg font-black">
              {metrics.todayPending} Pending Deliveries & {lowCreditUsers.length} Low Credit Accounts
            </h3>
            <p className="text-xs text-amber-100">
              Ensure drivers complete pending dispatches and follow up with zero/low-credit customers to prevent delivery interruption.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/credit-analytics"
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              Review Credits
            </Link>
          </div>
        </div>
      )}

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Expected Deliveries"
          value={totalExpected.toString()}
          subtitle="Total scheduled for today"
          icon={Truck}
          colorScheme="blue"
        />
        <KpiCard
          title="Delivered Today"
          value={metrics.todayDeliveries.toString()}
          subtitle={`${metrics.todayMilkVolumeL} Litres fulfilled`}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Pending Dispatches"
          value={metrics.todayPending.toString()}
          subtitle="Awaiting delivery confirmation"
          icon={Clock}
          colorScheme="amber"
        />
        <KpiCard
          title="Skipped Today"
          value={metrics.todaySkipped.toString()}
          subtitle="Requested delivery skips"
          icon={XCircle}
          colorScheme="rose"
        />
      </div>

      {/* Low Credit Action List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-500" /> Customers Requiring Credit Top-Up (≤5 Credits)
          </h3>
          <Link href="/credit-analytics" className="text-xs font-bold text-sky-600 hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowCreditUsers.slice(0, 5).map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.name || u.displayName || 'Customer'}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">{u.mobile || 'N/A'}</td>
                  <td className="py-3.5 px-4 uppercase font-bold text-slate-700">{getTier(u)}</td>
                  <td className="py-3.5 px-4 text-right font-black text-rose-600">{u.walletBalance || 0} Credits</td>
                  <td className="py-3.5 px-4 text-center">
                    <Link href={`/customer-360?q=${u.uid}`} className="text-sky-600 font-bold hover:underline">
                      Top Up / Contact
                    </Link>
                  </td>
                </tr>
              ))}
              {lowCreditUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs font-medium">
                    No low credit warnings today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Orders Log */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Today's Delivery Dispatch Log</h3>
        <PaginationTable
          data={todayDeliveriesList}
          defaultPageSize={25}
          emptyMessage="No dispatch records for today."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">Order / Delivery ID</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          )}
          renderRow={(o, i) => (
            <tr key={o._id || o.id || i} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{o.id || o._id}</td>
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{o.userId}</td>
              <td className="py-3.5 px-4">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                  o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                  o.status === 'Skipped' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {o.status || 'Pending'}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{o.totalAmount || 0}</td>
            </tr>
          )}
          keyExtractor={(o, i) => o._id || o.id || String(i)}
        />
      </div>
    </div>
  );
}
