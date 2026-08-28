'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { RawOrder } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { ShoppingBag, Milk, CheckCircle2, Clock, XCircle, Package, IndianRupee } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function OrdersAnalyticsPage() {
  const { data, loading } = useAnalytics();

  const productBreakdown = useMemo(() => {
    if (!data) return { milkCount: 0, curdCount: 0, paneerCount: 0, otherCount: 0, productStats: [] };

    let milkCount = 0;
    let curdCount = 0;
    let paneerCount = 0;
    let otherCount = 0;

    const prodStatsMap: Record<string, { title: string; count: number; revenue: number; consumesCredit: boolean }> = {};

    data.orders.forEach((o) => {
      const items = o.items || [];
      if (items.length === 0) {
        milkCount++;
      }
      items.forEach((it) => {
        const title = (it.productTitle || '').toLowerCase();
        const cat = (it.category || '').toLowerCase();
        const qty = it.quantity || 1;
        const rev = (it.price || 0) * qty;

        if (title.includes('milk') || cat.includes('milk')) {
          milkCount += qty;
        } else if (title.includes('curd') || cat.includes('curd')) {
          curdCount += qty;
        } else if (title.includes('paneer') || cat.includes('paneer')) {
          paneerCount += qty;
        } else {
          otherCount += qty;
        }

        const pName = it.productTitle || 'Milk';
        const isMilk = title.includes('milk') || cat.includes('milk') || pName === 'Milk';
        if (!prodStatsMap[pName]) {
          prodStatsMap[pName] = { title: pName, count: 0, revenue: 0, consumesCredit: isMilk };
        }
        prodStatsMap[pName].count += qty;
        prodStatsMap[pName].revenue += rev;
      });
    });

    const productStats = Object.values(prodStatsMap).sort((a, b) => b.count - a.count);

    return { milkCount, curdCount, paneerCount, otherCount, productStats };
  }, [data]);

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
          <ShoppingBag className="w-6 h-6 text-indigo-600" /> Order & Product Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Product sales breakdown. Strict credit rule: ONLY milk subscription deliveries consume wallet credits. Curd, Paneer, and non-milk items do NOT consume wallet credits.
        </p>
      </div>

      {/* Product Category KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Orders"
          value={data.orders.length.toLocaleString()}
          subtitle="Total order volume"
          icon={ShoppingBag}
          colorScheme="indigo"
        />
        <KpiCard
          title="Milk Subscriptions"
          value={productBreakdown.milkCount.toLocaleString()}
          subtitle="Consumes milk wallet credits"
          icon={Milk}
          colorScheme="blue"
        />
        <KpiCard
          title="Curd Orders"
          value={productBreakdown.curdCount.toLocaleString()}
          subtitle="0 Wallet credits consumed"
          icon={Package}
          colorScheme="emerald"
        />
        <KpiCard
          title="Paneer & Others"
          value={(productBreakdown.paneerCount + productBreakdown.otherCount).toLocaleString()}
          subtitle="0 Wallet credits consumed"
          icon={Package}
          colorScheme="amber"
        />
      </div>

      {/* Top Products Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" /> Product Breakdown & Credit Consumption Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-center">Credit Consumption Status</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productBreakdown.productStats.map((p) => (
                <tr key={p.title} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{p.count}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                      p.consumesCredit ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.consumesCredit ? 'Consumes 1 Credit (Milk)' : '0 Credits Consumed (Non-Milk)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{p.revenue.toLocaleString()}</td>
                </tr>
              ))}
              {productBreakdown.productStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 text-xs font-medium">
                    No product breakdown logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Directory Table */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">All Database Orders Log</h3>
        <PaginationTable<RawOrder>
          data={data.orders}
          defaultPageSize={25}
          emptyMessage="No order records found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          )}
          renderRow={(o, i) => (
            <tr key={o._id || o.id || i} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{o.id || o._id}</td>
              <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{o.userId}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{o.createdAt || 'N/A'}</td>
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
