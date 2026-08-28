'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AnalyticsDataStore, 
  DateFilter, 
  DateRangePreset, 
  fetchAllAnalyticsRawData 
} from '@/services/analyticsService';
import { useAuth } from '@/context/AuthContext';
import { AdminLoginModal } from '@/components/auth/AdminLoginModal';

interface AnalyticsContextType {
  data: AnalyticsDataStore | null;
  loading: boolean;
  error: string | null;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (start: string, end: string) => void;
  refreshData: (force?: boolean) => Promise<void>;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsDataStore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: '30days'
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const refreshData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const store = await fetchAllAnalyticsRawData(force);
      setData(store);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Error refreshing analytics data:', err);
      const msg = err.message || '';
      if (msg.includes('permissions') || msg.includes('permission-denied') || msg.includes('insufficient')) {
        setError('Missing or insufficient permissions. Please log in as an authorized admin account.');
        setShowAuthModal(true);
      } else {
        setError(msg || 'Failed to load database records.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      refreshData(false);
    }
  }, [firebaseUser, authLoading, refreshData]);

  const setPreset = (preset: DateRangePreset) => {
    setDateFilter({ preset });
  };

  const setCustomRange = (startDate: string, endDate: string) => {
    setDateFilter({
      preset: 'custom',
      startDate,
      endDate
    });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        loading,
        error,
        dateFilter,
        setDateFilter,
        setPreset,
        setCustomRange,
        refreshData,
        globalSearchQuery,
        setGlobalSearchQuery
      }}
    >
      {children}
      <AdminLoginModal isOpen={showAuthModal && !firebaseUser} onClose={() => setShowAuthModal(false)} />
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return ctx;
};
