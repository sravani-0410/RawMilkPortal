'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/context/AnalyticsContext';
import { getCustomer360Data, Customer360Details } from '@/services/analyticsService';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  Wallet, 
  Truck, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  History,
  FileText,
  Activity,
  Globe
} from 'lucide-react';
import { PaginationTable } from '@/components/analytics/PaginationTable';

function Customer360Content() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { data, loading, globalSearchQuery } = useAnalytics();

  const [searchQuery, setSearchQuery] = useState(initialQuery || globalSearchQuery);
  const [activeTab, setActiveTab] = useState<'timeline' | 'transactions' | 'deliveries' | 'orders'>('timeline');

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    else if (globalSearchQuery) setSearchQuery(globalSearchQuery);
  }, [initialQuery, globalSearchQuery]);

  const customerDetails: Customer360Details | null = useMemo(() => {
    if (!data || !searchQuery) return null;
    return getCustomer360Data(data, searchQuery);
  }, [data, searchQuery]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Customer Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-sky-600" /> Customer 360 Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete 360-degree profile, order history, credit transactions & event timeline.
          </p>
        </div>

        {/* Local Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer by Name, Mobile, RM100001, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium shadow-xs"
          />
        </div>
      </div>

      {!customerDetails ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Select or Search a Customer</h3>
          <p className="text-xs text-slate-500">
            Enter a Customer Name, User ID (e.g. RM100001), Phone number, or Email in the search bar above to generate their complete 360-degree profile.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Customer Overview Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-sky-600/20">
                  {(customerDetails.user.name || customerDetails.user.displayName || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                      {customerDetails.user.userId || 'N/A'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                      (customerDetails.subscription?.subscriptionTier || customerDetails.user.subscriptionStatus) === 'gold'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {customerDetails.subscription?.subscriptionTier || 'Silver'} Tier
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    {customerDetails.user.name || customerDetails.user.displayName || 'Customer'}
                  </h2>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Wallet Balance</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {customerDetails.user.walletBalance || 0} Credits
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Contact Information</span>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {customerDetails.user.mobile || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {customerDetails.user.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Preferred Language: {customerDetails.user.preferredLanguage || 'Telugu / English'}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Delivery Address</span>
                <div className="flex items-start gap-2 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{customerDetails.user.address || customerDetails.user.landmark || 'Address not registered'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Subscription Details</span>
                <div className="font-bold text-slate-900">
                  Plan: {customerDetails.subscription?.productTitle || 'Milk Subscription'} ({customerDetails.subscription?.unitSize || '500ml'})
                </div>
                <div className="text-slate-500">
                  Status: <strong className="text-emerald-600">{customerDetails.subscription?.status || 'ACTIVE PLAN'}</strong>
                </div>
                <div className="text-slate-500">
                  Plan Value: ₹{customerDetails.subscription?.planValue || (customerDetails.subscription?.subscriptionTier === 'gold' ? 2700 : 1500)}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Historical Metrics</span>
                <div className="text-slate-700">
                  Last Delivery: <strong className="text-slate-900">{customerDetails.lastDeliveryDateStr}</strong>
                </div>
                <div className="text-slate-700">
                  Last Order: <strong className="text-slate-900">{customerDetails.lastOrderDateStr}</strong>
                </div>
                <div className="text-slate-700">
                  Inactivity: <strong className="text-amber-600">{customerDetails.daysInactiveDisplay}</strong>
                </div>
                <div className="text-slate-700">
                  Total Orders: <strong className="text-slate-900">{customerDetails.orders.length}</strong>
                </div>
                <div className="text-slate-700">
                  Total Revenue: <strong className="text-emerald-700">₹{customerDetails.totalRevenue.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Deliveries</span>
              <span className="text-xl font-black text-emerald-600">{customerDetails.deliveredCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Skips</span>
              <span className="text-xl font-black text-rose-600">{customerDetails.skippedCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Credits Given</span>
              <span className="text-xl font-black text-sky-600">{customerDetails.creditsGiven}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Credits Used</span>
              <span className="text-xl font-black text-purple-600">{customerDetails.creditsUsed}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            {[
              { id: 'timeline', label: 'Activity Timeline', icon: Activity },
              { id: 'transactions', label: 'Wallet Transactions', icon: Wallet },
              { id: 'deliveries', label: 'Delivery History', icon: Truck },
              { id: 'orders', label: 'Order History', icon: ShoppingBag }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
                    isActive
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Chronological Activity Event Timeline */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" /> Chronological Event Timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {customerDetails.timeline.map((ev) => (
                  <div key={ev.id} className="relative flex items-start gap-4">
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-[10px] font-bold ${
                      ev.badgeColor === 'emerald' ? 'bg-emerald-500 text-white' :
                      ev.badgeColor === 'amber' ? 'bg-amber-500 text-white' :
                      ev.badgeColor === 'sky' ? 'bg-sky-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      •
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(ev.date).toLocaleDateString()} • {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{ev.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {customerDetails.timeline.length === 0 && (
                  <p className="text-slate-400 text-xs py-4 font-medium">No recorded database activity events.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Wallet Transactions */}
          {activeTab === 'transactions' && (
            <PaginationTable
              data={customerDetails.walletTransactions}
              defaultPageSize={10}
              emptyMessage="No wallet transaction records found."
              renderHeader={() => (
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Reason / Details</th>
                  <th className="py-3 px-4 text-right">Amount / Credits</th>
                </tr>
              )}
              renderRow={(t) => (
                <tr key={t._id || t.transactionId} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                      t.type === 'Admin Add' || t.amount > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{t.reason || 'N/A'}</td>
                  <td className={`py-3.5 px-4 text-right font-black ${
                    t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </td>
                </tr>
              )}
              keyExtractor={(t, i) => t._id || t.transactionId || String(i)}
            />
          )}

          {/* Tab 3: Deliveries */}
          {activeTab === 'deliveries' && (
            <PaginationTable
              data={customerDetails.orders.filter((o) => o.status === 'Delivered' || o.status === 'Skipped')}
              defaultPageSize={10}
              emptyMessage="No delivery records found."
              renderHeader={() => (
                <tr>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Credits Deducted</th>
                </tr>
              )}
              renderRow={(d) => (
                <tr key={d._id || d.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {d.deliveryDate || d.createdAt || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 uppercase">{d.tier || 'Silver'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                      d.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    {d.status === 'Delivered' ? '-1 Credit' : '0 Credits'}
                  </td>
                </tr>
              )}
              keyExtractor={(d, i) => d._id || d.id || String(i)}
            />
          )}

          {/* Tab 4: Orders */}
          {activeTab === 'orders' && (
            <PaginationTable
              data={customerDetails.orders}
              defaultPageSize={10}
              emptyMessage="No order records found."
              renderHeader={() => (
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              )}
              renderRow={(o) => (
                <tr key={o._id || o.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{o.id || o._id}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{o.createdAt || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{o.status}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{o.totalAmount || 0}</td>
                </tr>
              )}
              keyExtractor={(o, i) => o._id || o.id || String(i)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function Customer360Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Customer360Content />
    </Suspense>
  );
}
