'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, LogIn, Milk, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPassLoading(true);
    try {
      await loginWithPassword(email, password);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Password authentication failed.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-slate-900 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-blue-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Milk className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Admin Authentication Required</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log in with an authorized RAW MILK admin account to access real business analytics.
          </p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* OPTION 1 — Google Sign-In (Primary Recommended) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-sky-500 hover:bg-slate-50 text-slate-800 font-extrabold rounded-2xl shadow-xs flex items-center justify-center gap-3 text-sm transition-all duration-200 disabled:opacity-50"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Opening Google Auth...' : 'Continue with Google'}</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium">
            Primary recommended sign-in for RAW MILK admins
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold uppercase text-slate-400 absolute">OR</span>
        </div>

        {/* OPTION 2 — Admin Password Login (Fallback) */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rawmilk.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || passLoading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-sky-400" />
            {passLoading ? 'Verifying Admin Secret...' : 'Sign In to Analytics'}
          </button>
        </form>
      </div>
    </div>
  );
};
