'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAuth } from '@/context/AuthContext';
import { DateRangePreset } from '@/services/analyticsService';
import { AdminLoginModal } from '@/components/auth/AdminLoginModal';
import { 
  Calendar, 
  RotateCw, 
  Search, 
  Database,
  UserCheck,
  LogIn,
  LogOut,
  Menu,
  Download,
  Milk
} from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const router = useRouter();
  const { 
    data,
    dateFilter, 
    setPreset, 
    setCustomRange, 
    refreshData, 
    loading, 
    globalSearchQuery,
    setGlobalSearchQuery
  } = useAnalytics();

  const { user, firebaseUser, logout } = useAuth();

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchInput, setSearchInput] = useState(globalSearchQuery);
  const [lastUpdatedText, setLastUpdatedText] = useState('Updated just now');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setGlobalSearchQuery]);

  // Update last updated status text
  useEffect(() => {
    if (data?.fetchedAt) {
      setLastUpdatedText(`Updated ${new Date(data.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [data?.fetchedAt]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/customer-360?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as DateRangePreset;
    if (val === 'custom') {
      setShowCustomModal(true);
    } else {
      setPreset(val);
    }
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setCustomRange(customStart, customEnd);
      setShowCustomModal(false);
    } else {
      alert('Please select both start and end dates.');
    }
  };

  const handleQuickExport = () => {
    if (!data) return;
    const exportRows = data.users.map((u) => ({
      'User ID': u.userId || u.uid,
      Name: u.name || u.displayName || 'Customer',
      Mobile: u.mobile || '',
      Email: u.email || '',
      'Wallet Balance': u.walletBalance || 0,
      'Subscription Status': u.subscriptionStatus || 'No Plan'
    }));
    exportToCSV(exportRows, `RawMilk_Analytics_Export_${dateFilter.preset}`);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
      {/* Brand Title & Mobile Toggle */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold md:hidden">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              RAW MILK ANALYTICS
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">{lastUpdatedText}</span>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => refreshData(true)}
            disabled={loading}
            className="p-2 text-sky-600 bg-sky-50 rounded-xl"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search Name, Mobile, Email, RM100001, Tier..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-16 py-2 text-xs md:text-sm bg-slate-100/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
        />
        {searchInput && (
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] font-bold px-2.5 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Search
          </button>
        )}
      </form>

      {/* Global Filter Actions */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-xl flex-shrink-0">
          <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <select
            value={dateFilter.preset}
            onChange={handlePresetChange}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={() => refreshData(true)}
          disabled={loading}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex-shrink-0"
          title="Refresh analytics data without full browser reload"
        >
          <RotateCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>

        {/* Quick Export Button */}
        <button
          onClick={handleQuickExport}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition flex-shrink-0"
          title="Export current view to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export</span>
        </button>

        {/* Admin Login / Session Status */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex-shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="ml-1 text-slate-400 hover:text-rose-600"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex-shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" /> Admin Login
          </button>
        )}
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" /> Select Custom Date Range
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomRange}
                className="px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-sm"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
