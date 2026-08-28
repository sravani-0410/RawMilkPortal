'use client';

import React, { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { computeOverviewMetrics, getBoundsForRange } from '@/services/analyticsService';
import { exportToCSV, exportToExcel } from '@/lib/exportUtils';
import { FileText, Download, FileSpreadsheet, Calendar, CheckCircle2, IndianRupee, Truck, Wallet, Users, Award } from 'lucide-react';

export default function DailyReportPage() {
  const { data, loading, dateFilter } = useAnalytics();

  const bounds = useMemo(() => getBoundsForRange(dateFilter), [dateFilter]);
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

  const getReportSummaryData = () => {
    return [
      { Metric: 'Report Date Range', Value: bounds.label },
      { Metric: 'Total Revenue Generated', Value: `₹${metrics.totalRevenue.toLocaleString()}` },
      { Metric: 'Total Fulfilled Deliveries', Value: metrics.totalDeliveries },
      { Metric: 'Total Milk Volume Delivered (L)', Value: `${metrics.totalMilkVolumeL} Litres` },
      { Metric: 'Active Subscriptions', Value: metrics.activeSubscriptions },
      { Metric: 'Silver Tier (500ml) Deliveries', Value: metrics.silverDeliveries },
      { Metric: 'Gold Tier (1L) Deliveries', Value: metrics.goldDeliveries },
      { Metric: 'Total Credits Used (Fulfilled)', Value: metrics.totalCreditsUsed },
      { Metric: 'Total Credits Remaining (Wallets)', Value: metrics.totalCreditsRemaining }
    ];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" /> Executive Business Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated operations, sales, delivery, and credit report for period: <strong className="text-slate-800">{bounds.label}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(getReportSummaryData(), `RawMilk_Business_Report_${dateFilter.preset}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" /> CSV Report
          </button>
          <button
            onClick={() => exportToExcel(getReportSummaryData(), `RawMilk_Business_Report_${dateFilter.preset}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel Report
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900">RAW MILK</h2>
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mt-0.5">Business Intelligence Report</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            <div>Period: <strong className="text-slate-900">{bounds.label}</strong></div>
            <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</span>
            <div className="text-2xl font-black text-emerald-700">₹{metrics.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Deliveries</span>
            <div className="text-2xl font-black text-slate-900">{metrics.totalDeliveries}</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Milk Volume</span>
            <div className="text-2xl font-black text-sky-700">{metrics.totalMilkVolumeL} Litres</div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Key Performance Summary Table</h3>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Performance Indicator</th>
                <th className="py-3 px-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 px-4 font-semibold">Total Customer Base</td>
                <td className="py-3 px-4 text-right font-black">{metrics.totalCustomers}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Active Subscriptions (Active Plan)</td>
                <td className="py-3 px-4 text-right font-black text-sky-700">{metrics.activeSubscriptions}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Silver Tier (500 ML) Deliveries</td>
                <td className="py-3 px-4 text-right font-black">{metrics.silverDeliveries}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Gold Tier (1 L) Deliveries</td>
                <td className="py-3 px-4 text-right font-black">{metrics.goldDeliveries}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Credits Consumed (Delivered Milk)</td>
                <td className="py-3 px-4 text-right font-black text-purple-700">{metrics.totalCreditsUsed}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Remaining Customer Wallet Credits</td>
                <td className="py-3 px-4 text-right font-black text-emerald-700">{metrics.totalCreditsRemaining}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
