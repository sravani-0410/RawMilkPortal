'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DataVerificationPanel } from '@/components/diagnostics/DataVerificationPanel';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <AnalyticsProvider>
        <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
              {children}
            </main>
          </div>
        </div>
        <DataVerificationPanel />
      </AnalyticsProvider>
    </AuthProvider>
  );
};
