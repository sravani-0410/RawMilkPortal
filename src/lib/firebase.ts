import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getAuthDomain = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'raw-milk-1e36d.firebaseapp.com';
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname.startsWith('127.')) {
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'raw-milk-1e36d.firebaseapp.com';
  }
  return hostname;
};

// Safe API key string for static build / SSR when build environment does not supply environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyRawMilkBuildPlaceholderApiKeyKey00';

const firebaseConfig = {
  apiKey,
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'raw-milk-1e36d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'raw-milk-1e36d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log safe diagnostic configuration status without printing secret key values
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  console.log('Firebase project configured:', !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'raw-milk-1e36d'));
  console.log('Firebase API key configured:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('Firebase auth domain configured:', !!getAuthDomain());
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error('Firebase persistence initialization error:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;

