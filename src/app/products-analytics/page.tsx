'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, RawProduct } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { PaginationTable } from '@/components/analytics/PaginationTable';
import { Package, Milk, Award, IndianRupee, CheckCircle2 } from 'lucide-react';

export default function ProductsAnalyticsPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const metrics = useMemo(() => {
    if (!data) return null;
    return computeOverviewMetrics(data, dateFilter);
  }, [data, dateFilter]);

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
          <Package className="w-6 h-6 text-sky-600" /> Milk Volume & Product Catalog Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Litres of milk delivered by tier (500 ML Silver vs 1 L Gold) and product catalog details.
        </p>
      </div>

      {/* Volume KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Milk Sold (L)"
          value={`${metrics.totalMilkVolumeL} Litres`}
          subtitle="Cumulative milk volume delivered"
          icon={Milk}
          colorScheme="blue"
        />
        <KpiCard
          title="Today's Milk Volume"
          value={`${metrics.todayMilkVolumeL} Litres`}
          subtitle="Dispatched today"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="500 ML (Silver Deliveries)"
          value={metrics.silverDeliveries.toLocaleString()}
          subtitle={`${metrics.silverDeliveries * 0.5} Litres total volume`}
          icon={Award}
          colorScheme="purple"
        />
        <KpiCard
          title="1 Litre (Gold Deliveries)"
          value={metrics.goldDeliveries.toLocaleString()}
          subtitle={`${metrics.goldDeliveries * 1.0} Litres total volume`}
          icon={Award}
          colorScheme="amber"
        />
      </div>

      {/* Product Catalog Directory */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Database Product Catalog</h3>
        <PaginationTable<RawProduct>
          data={data.products}
          defaultPageSize={10}
          emptyMessage="No product catalog items found."
          renderHeader={() => (
            <tr>
              <th className="py-3 px-4">Product ID</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Unit Size</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Price (₹)</th>
            </tr>
          )}
          renderRow={(p) => (
            <tr key={p._id} className="hover:bg-slate-50 transition">
              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{p._id}</td>
              <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
              <td className="py-3.5 px-4 text-slate-600 font-medium">{p.unitSize || 'Standard'}</td>
              <td className="py-3.5 px-4 text-slate-600 uppercase font-bold text-[11px]">{p.category || 'Dairy'}</td>
              <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{p.price || 0}</td>
            </tr>
          )}
          keyExtractor={(p) => p._id}
        />
      </div>
    </div>
  );
}
