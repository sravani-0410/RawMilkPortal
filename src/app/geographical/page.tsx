'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { KpiCard } from '@/components/analytics/KpiCard';
import { MapPin, Users, ShoppingBag, Truck, IndianRupee, Building } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface GeoLocationGroup {
  locationName: string;
  customerCount: number;
  orderCount: number;
  deliveryCount: number;
  totalRevenue: number;
}

export default function GeographicalAnalyticsPage() {
  const { data, loading } = useAnalytics();

  const locationGroups: GeoLocationGroup[] = useMemo(() => {
    if (!data) return [];
    const groups: Record<string, GeoLocationGroup> = {};

    data.users.forEach((u) => {
      const loc = (u.city || u.area || u.landmark || (u.address ? u.address.split(',')[0] : '') || 'Unmapped Location').trim();
      if (!groups[loc]) {
        groups[loc] = {
          locationName: loc,
          customerCount: 0,
          orderCount: 0,
          deliveryCount: 0,
          totalRevenue: 0
        };
      }
      groups[loc].customerCount++;

      const userOrders = data.orders.filter((o) => o.userId === u.uid);
      groups[loc].orderCount += userOrders.length;
      groups[loc].deliveryCount += userOrders.filter((o) => o.status === 'Delivered').length;

      userOrders.forEach((o) => {
        groups[loc].totalRevenue += Number(o.totalAmount || 0);
      });
    });

    return Object.values(groups).sort((a, b) => b.totalRevenue - a.totalRevenue);
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
          <MapPin className="w-6 h-6 text-sky-600" /> Geographical Location Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Area & city-level customer density, delivery volume, and revenue metrics grouped strictly from registered address records.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Active Delivery Zones"
          value={locationGroups.length.toString()}
          subtitle="Distinct customer locations"
          icon={Building}
          colorScheme="blue"
        />
        <KpiCard
          title="Top Revenue Zone"
          value={locationGroups[0]?.locationName || 'N/A'}
          subtitle={`₹${(locationGroups[0]?.totalRevenue || 0).toLocaleString()} Total Revenue`}
          icon={IndianRupee}
          colorScheme="emerald"
        />
        <KpiCard
          title="Highest Customer Density"
          value={`${locationGroups.reduce((max, g) => Math.max(max, g.customerCount), 0)} Users`}
          subtitle={`Location: ${locationGroups[0]?.locationName || 'N/A'}`}
          icon={Users}
          colorScheme="purple"
        />
        <KpiCard
          title="Highest Delivery Zone"
          value={`${locationGroups.reduce((max, g) => Math.max(max, g.deliveryCount), 0)} Deliveries`}
          subtitle="Fulfilled deliveries"
          icon={Truck}
          colorScheme="indigo"
        />
      </div>

      {/* Location Revenue Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-600" /> Revenue & Customer Volume by Area
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationGroups.slice(0, 10)}>
              <XAxis dataKey="locationName" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="totalRevenue" name="Total Revenue (₹)" fill="#0284c7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="customerCount" name="Customers" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Location / Area</th>
                <th className="py-3 px-4 text-center">Customers</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-center">Deliveries</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locationGroups.map((g) => (
                <tr key={g.locationName} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{g.locationName}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{g.customerCount}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{g.orderCount}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{g.deliveryCount}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{g.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
              {locationGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No registered delivery location records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
