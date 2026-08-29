'use client';

import React, { useState, useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { RawSlotRequest, isDateInRange, getBoundsForRange } from '@/services/analyticsService';
import { KpiCard } from '@/components/analytics/KpiCard';
import { 
  Clock, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function SlotRequestsPage() {
  const { data, loading, error, dateFilter, refreshData } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'PENDING' | 'COMPLETED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Map users map for quick email lookup if email is not directly on slot request
  const userMap = useMemo(() => {
    if (!data?.users) return new Map<string, any>();
    const map = new Map<string, any>();
    data.users.forEach((u) => {
      if (u.uid) map.set(u.uid, u);
      if (u.mobile) map.set(u.mobile, u);
    });
    return map;
  }, [data]);

  // Compute metrics
  const metrics = useMemo(() => {
    const rawList = data?.slotRequests || [];
    let newCount = 0;
    let pendingCount = 0;
    let completedCount = 0;

    rawList.forEach((req) => {
      const st = (req.status || 'NEW').toUpperCase().trim();
      if (st === 'NEW') newCount++;
      else if (st === 'PENDING') pendingCount++;
      else if (st === 'COMPLETED' || st === 'APPROVED' || st === 'FULFILLED') completedCount++;
    });

    return {
      total: rawList.length,
      newCount,
      pendingCount,
      completedCount
    };
  }, [data]);

  // Filter slot requests based on search query, status tab, and date range
  const filteredRequests = useMemo(() => {
    if (!data?.slotRequests) return [];
    const bounds = getBoundsForRange(dateFilter);

    return data.slotRequests.filter((req) => {
      // 1. Status Filter
      const reqStatus = (req.status || 'NEW').toUpperCase().trim();
      if (statusFilter === 'NEW' && reqStatus !== 'NEW') return false;
      if (statusFilter === 'PENDING' && reqStatus !== 'PENDING') return false;
      if (statusFilter === 'COMPLETED' && !['COMPLETED', 'APPROVED', 'FULFILLED'].includes(reqStatus)) return false;

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const linkedUser = req.customerId ? userMap.get(req.customerId) : null;
        const nameMatch = (req.name || linkedUser?.name || '').toLowerCase().includes(q);
        const phoneMatch = (req.phone || linkedUser?.mobile || '').toLowerCase().includes(q);
        const emailMatch = (req.email || linkedUser?.email || '').toLowerCase().includes(q);
        const addressMatch = (req.address || linkedUser?.address || '').toLowerCase().includes(q);
        const statusMatch = reqStatus.toLowerCase().includes(q);
        const dateMatch = (req.preferredDate || '').toLowerCase().includes(q);
        const timeMatch = (req.preferredTime || '').toLowerCase().includes(q);

        if (!nameMatch && !phoneMatch && !emailMatch && !addressMatch && !statusMatch && !dateMatch && !timeMatch) {
          return false;
        }
      }

      // 3. Date Range Filter
      if (dateFilter.preset !== '30days' && req.createdAt) {
        return isDateInRange(req.createdAt, bounds);
      }

      return true;
    });
  }, [data, searchQuery, statusFilter, dateFilter, userMap]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Failed to Load Slot Requests</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
        <button
          onClick={() => refreshData(true)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 mx-auto hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-7 h-7 text-sky-600" /> Slot Requests
            </h1>
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-500" />
              New Requests: {metrics.newCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Read-only analytical view of customer slot booking requests submitted via the website backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Read-Only Portal</span>
          </div>
          <button
            onClick={() => refreshData(true)}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            title="Refresh Slot Requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Requests"
          value={metrics.total.toLocaleString()}
          subtitle="All historical website slot bookings"
          icon={Calendar}
          colorScheme="blue"
        />
        <KpiCard
          title="New Requests"
          value={metrics.newCount.toLocaleString()}
          subtitle="Awaiting initial processing"
          icon={Clock}
          colorScheme="amber"
        />
        <KpiCard
          title="Pending Review"
          value={metrics.pendingCount.toLocaleString()}
          subtitle="Currently pending fulfillment"
          icon={Filter}
          colorScheme="indigo"
        />
        <KpiCard
          title="Completed / Approved"
          value={metrics.completedCount.toLocaleString()}
          subtitle="Successfully processed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search customer, phone, email, address, slot date..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          {(['ALL', 'NEW', 'PENDING', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 font-extrabold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
              {tab === 'NEW' && metrics.newCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                  {metrics.newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredRequests.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Slot Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No requests match your search criteria. Try adjusting filters or clearing the search query.'
              : 'There are currently no customer slot requests stored in the database.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-5">Contact Details</th>
                    <th className="py-3.5 px-5">Preferred Slot</th>
                    <th className="py-3.5 px-5">Address</th>
                    <th className="py-3.5 px-5">Requested At</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedRequests.map((req) => {
                    const linkedUser = req.customerId ? userMap.get(req.customerId) : null;
                    const name = req.name || linkedUser?.name || '—';
                    const phone = req.phone || linkedUser?.mobile || '—';
                    const email = req.email || linkedUser?.email || '—';
                    const address = req.address || linkedUser?.address || '—';
                    const status = (req.status || 'NEW').toUpperCase().trim();
                    const preferredDate = req.preferredDate || '—';
                    const preferredTime = req.preferredTime || '—';

                    let createdAtStr = '—';
                    if (req.createdAt) {
                      try {
                        const d = new Date(req.createdAt);
                        if (!isNaN(d.getTime())) {
                          createdAtStr = d.toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          });
                        }
                      } catch (e) {}
                    }

                    return (
                      <tr key={req._id || req.id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                        {/* Customer */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{name}</div>
                              {req.customerId && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  ID: {req.customerId.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-5 space-y-0.5">
                          {phone !== '—' ? (
                            <a
                              href={`tel:${phone}`}
                              className="flex items-center gap-1.5 text-slate-800 hover:text-sky-600 font-bold"
                            >
                              <Phone className="w-3 h-3 text-slate-400" /> {phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {email !== '—' && (
                            <a
                              href={`mailto:${email}`}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-[11px]"
                            >
                              <Mail className="w-3 h-3 text-slate-400" /> {email}
                            </a>
                          )}
                        </td>

                        {/* Preferred Slot */}
                        <td className="py-4 px-5">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                            {preferredDate}
                          </div>
                          {preferredTime !== '—' && (
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {preferredTime}
                            </div>
                          )}
                        </td>

                        {/* Address */}
                        <td className="py-4 px-5 max-w-xs">
                          {address !== '—' ? (
                            <div className="flex items-start gap-1.5 text-slate-600 line-clamp-2" title={address}>
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span>{address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Requested At */}
                        <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                          {createdAtStr}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                              status === 'NEW'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : status === 'PENDING'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : ['COMPLETED', 'APPROVED', 'FULFILLED'].includes(status)
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                status === 'NEW'
                                  ? 'bg-amber-500 animate-pulse'
                                  : status === 'PENDING'
                                  ? 'bg-sky-500'
                                  : 'bg-emerald-500'
                              }`}
                            ></span>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden space-y-4">
            {paginatedRequests.map((req) => {
              const linkedUser = req.customerId ? userMap.get(req.customerId) : null;
              const name = req.name || linkedUser?.name || '—';
              const phone = req.phone || linkedUser?.mobile || '—';
              const email = req.email || linkedUser?.email || '—';
              const address = req.address || linkedUser?.address || '—';
              const status = (req.status || 'NEW').toUpperCase().trim();
              const preferredDate = req.preferredDate || '—';
              const preferredTime = req.preferredTime || '—';

              let createdAtStr = '—';
              if (req.createdAt) {
                try {
                  const d = new Date(req.createdAt);
                  if (!isNaN(d.getTime())) {
                    createdAtStr = d.toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    });
                  }
                } catch (e) {}
              }

              return (
                <div
                  key={req._id || req.id || Math.random()}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{name}</h4>
                        {req.customerId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: {req.customerId.substring(0, 10)}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        status === 'NEW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : status === 'PENDING'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : ['COMPLETED', 'APPROVED', 'FULFILLED'].includes(status)
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === 'NEW'
                            ? 'bg-amber-500 animate-pulse'
                            : status === 'PENDING'
                            ? 'bg-sky-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      {status}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-2 text-xs">
                    {/* Preferred Slot */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Preferred Slot</span>
                      <div className="text-right">
                        <div className="font-black text-slate-900 flex items-center gap-1 justify-end">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          {preferredDate}
                        </div>
                        {preferredTime !== '—' && (
                          <div className="text-[10px] text-slate-500">{preferredTime}</div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {phone !== '—' && (
                        <a href={`tel:${phone}`} className="flex items-center gap-2 text-slate-800 font-bold hover:text-sky-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{phone}</span>
                        </a>
                      )}
                      {email !== '—' && (
                        <a href={`mailto:${email}`} className="flex items-center gap-2 text-slate-600 hover:text-sky-600 text-[11px] break-all">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{email}</span>
                        </a>
                      )}
                    </div>

                    {/* Address */}
                    {address !== '—' && (
                      <div className="flex items-start gap-2 text-slate-600 pt-1 border-t border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px]">{address}</span>
                      </div>
                    )}

                    {/* Submission Time */}
                    <div className="text-[10px] text-slate-400 pt-1 text-right border-t border-slate-100">
                      Submitted: {createdAtStr}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <div>
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                <strong>{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</strong> of{' '}
                <strong>{filteredRequests.length}</strong> requests
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="font-extrabold text-slate-900">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
