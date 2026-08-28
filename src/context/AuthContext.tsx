'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export const AUTHORIZED_ADMINS = ['rawmilkfarm01@gmail.com', 'vivekrao9505@gmail.com'];

export interface AdminUser {
  uid?: string;
  email: string;
  role: 'admin';
  authMethod: 'google' | 'password';
}

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'rawmilk_analytics_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore saved session or Firebase auth state
  useEffect(() => {
    // 1. Check local session
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email && AUTHORIZED_ADMINS.includes(parsed.email.toLowerCase().trim())) {
            setUser(parsed);
          }
        } catch (e) {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      }
    }

    // 2. Listen to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const userEmail = fbUser.email.toLowerCase().trim();
        let isAuthorized = AUTHORIZED_ADMINS.includes(userEmail);

        if (!isAuthorized) {
          try {
            const adminsSnap = await getDocs(collection(db, 'admins'));
            adminsSnap.forEach((d) => {
              const data = d.data();
              const email = (data.email || d.id || '').toLowerCase().trim();
              if (email === userEmail) isAuthorized = true;
            });
          } catch (e) {
            // ignore error
          }
        }

        if (isAuthorized) {
          const adminSession: AdminUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            role: 'admin',
            authMethod: 'google'
          };
          setUser(adminSession);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
          }
        } else {
          // Non-admin account signed in via Google: sign out immediately
          await signOut(auth);
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCAL_SESSION_KEY);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase().trim() || '';

      let isAuthorized = AUTHORIZED_ADMINS.includes(email);
      if (!isAuthorized) {
        try {
          const adminsSnap = await getDocs(collection(db, 'admins'));
          adminsSnap.forEach((d) => {
            const data = d.data();
            const e = (data.email || d.id || '').toLowerCase().trim();
            if (e === email) isAuthorized = true;
          });
        } catch (e) {
          // ignore
        }
      }

      if (!isAuthorized) {
        await signOut(auth);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
        throw new Error(`Access denied. "${email}" is not authorized for RAW MILK Analytics.`);
      }

      const adminSession: AdminUser = {
        uid: result.user.uid,
        email: result.user.email || email,
        role: 'admin',
        authMethod: 'google'
      };
      setUser(adminSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      let errorMsg = err.message || 'Google Sign-in failed.';
      if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Firebase Auth network request failed. You can use the Admin Password login option below as a fallback.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Google Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'Google Sign-in popup was blocked by your browser. Please allow popups and try again.';
      }
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server authentication failed.');
      }

      const adminSession: AdminUser = {
        email: data.email,
        role: 'admin',
        authMethod: 'password'
      };
      setUser(adminSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
      }
    } catch (err: any) {
      console.error('Password authentication error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithGoogle,
        loginWithPassword,
        logout,
        isAdmin: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
