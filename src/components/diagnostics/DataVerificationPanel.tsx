'use client';

import React, { useEffect, useState } from 'react';
import { runDatabaseDiagnostics, DiagnosticsState } from '@/services/analyticsService';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Database, CheckCircle2, XCircle, RefreshCw, Activity, Clock, ShieldCheck } from 'lucide-react';

export const DataVerificationPanel: React.FC = () => {
  const { firebaseUser, user } = useAuth();
  const { data, dateFilter } = useAnalytics();
  const [diag, setDiag] = useState<DiagnosticsState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await runDatabaseDiagnostics();
      setDiag(res);
    } catch (e) {
      console.error('Diagnostics error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [firebaseUser, isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-900 text-slate-100 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 z-40 transition"
        title="Open Data Verification Diagnostics Panel"
      >
        <Activity className="w-4 h-4 text-emerald-400" />
        <span>Data Diagnostics</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-sm w-full z-50 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
          <Database className="w-4 h-4 text-sky-600" />
          <span>DATA DIAGNOSTIC PANEL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runCheck}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-sky-600"
            title="Re-run Diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-2 text-[11px]">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
          <span className="font-semibold text-slate-600">DATA SOURCE:</span>
          <span className="font-bold text-sky-700">Firestore (raw-milk-1e36d)</span>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
          <span className="font-semibold text-slate-600">ACTIVE DATE FILTER:</span>
          <span className="font-bold text-slate-900 uppercase">{dateFilter.preset}</span>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
          <span className="font-semibold text-slate-600">LAST DATA SYNC:</span>
          <span className="font-bold text-slate-800">
            {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString() : 'Just now'}
          </span>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
          <span className="font-semibold text-slate-600">AUTH STATUS:</span>
          <span className={`font-bold flex items-center gap-1 ${firebaseUser ? 'text-emerald-600' : 'text-amber-600'}`}>
            {firebaseUser ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> ADMIN LOGGED IN
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> READ-ONLY ANONYMOUS
              </>
            )}
          </span>
        </div>
      </div>

      {diag && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-400 uppercase text-[10px] block">Live Collection Document Counts:</span>
          {Object.entries(diag.queries).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center py-1 border-b border-slate-100 text-[11px]">
              <span className="font-medium text-slate-700 uppercase">{key}:</span>
              <span className={`font-bold ${val.status === 'OK' ? 'text-slate-900' : 'text-rose-600'}`}>
                {val.status === 'OK' ? `${val.count} docs` : `FAILED (${val.error || 'Denied'})`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
