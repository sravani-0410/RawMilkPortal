import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export type DateRangePreset = 
  | 'today' 
  | 'yesterday' 
  | '7days' 
  | '30days' 
  | '90days'
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisYear' 
  | 'custom';

export interface DateFilter {
  preset: DateRangePreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

// Interfaces matching database structure
export interface RawUser {
  uid: string;
  userId?: string; // RM100001
  name?: string;
  displayName?: string;
  email?: string;
  mobile?: string;
  role?: string;
  walletBalance?: number;
  creditsUsed?: number;
  subscriptionStatus?: string; // Active, Paused, Expired, Low Credits, Out of Credits
  createdAt?: string;
  address?: string;
  landmark?: string;
  city?: string;
  area?: string;
  preferredDeliveryTime?: string;
  fcmToken?: string;
  preferredLanguage?: string;
}

export interface RawProduct {
  _id: string;
  title: string;
  description?: string;
  price: number;
  price500ml?: number;
  price1L?: number;
  imageUrl?: string;
  unitSize?: string;
  category?: string;
  rating?: number;
  stock?: number;
}

export interface RawSubscription {
  _id?: string;
  id?: string;
  userId: string;
  productId?: string;
  productTitle?: string;
  unitSize?: string; // 500ml or 1L
  subscriptionTier?: 'silver' | 'gold';
  planValue?: number; // 1500 or 2700
  creditsAllocated?: number;
  status?: string; // Active, No Plan, Expired
  startDate?: string;
  endDate?: string;
  dailyQuantity?: number;
  skippedDates?: string[];
  createdAt?: string;
}

export interface RawOrder {
  _id?: string;
  id?: string;
  userId: string;
  userName?: string;
  items?: Array<{
    productId?: string;
    productTitle?: string;
    quantity?: number;
    unitSize?: string;
    price?: number;
    category?: string;
  }>;
  totalAmount?: number;
  status?: string; // Delivered, Pending, Skipped, Cancelled
  createdAt?: string;
  deliveryDate?: string;
  isCreditDeducted?: boolean;
  tier?: 'silver' | 'gold';
}

export interface RawWalletTransaction {
  _id?: string;
  transactionId?: string;
  userId: string;
  userDisplayId?: string;
  amount: number;
  type: string; // 'Admin Add' | 'Admin Adjustment' | 'Milk Delivered'
  reason?: string;
  adminId?: string;
  createdAt?: string;
  orderId?: string;
  deliveryId?: string;
}

export interface RawSkippedDelivery {
  _id?: string;
  id?: string;
  userId: string;
  date: string;
  quantity?: number;
  status?: string;
  subscriptionId?: string;
  createdAt?: string;
}

export interface RawReview {
  name: string;
  rating: number;
  comment: string;
  timestamp?: string;
}

// Safe Date Range Evaluator
export function getBoundsForRange(filter: DateFilter): { start: Date; end: Date; label: string } {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  let label = 'Today';

  switch (filter.preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = "Today's Operations";
      break;

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      label = 'Yesterday';
      break;

    case '7days':
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Last 7 Days';
      break;

    case '30days':
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Last 30 Days';
      break;

    case '90days':
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Last 90 Days';
      break;

    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      label = 'This Month';
      break;

    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      label = 'Last Month';
      break;

    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      label = 'This Year';
      break;

    case 'custom':
      if (filter.startDate) {
        start = new Date(filter.startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (filter.endDate) {
        end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
      }
      label = `Custom (${filter.startDate || 'Start'} to ${filter.endDate || 'End'})`;
      break;

    default:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end, label };
}

export function isDateInRange(dateStr?: string, bounds?: { start: Date; end: Date }): boolean {
  if (!dateStr || !bounds) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= bounds.start && d <= bounds.end;
}

export function getTier(item: any): 'silver' | 'gold' {
  if (!item) return 'silver';
  if (item.subscriptionTier === 'gold' || item.tier === 'gold') return 'gold';
  if (item.subscriptionTier === 'silver' || item.tier === 'silver') return 'silver';
  const unitSize = (item.unitSize || item.size || '').toString().toLowerCase();
  const title = (item.productTitle || item.title || '').toString().toLowerCase();
  if (unitSize.includes('1l') || unitSize.includes('1 liter') || title.includes('1l') || title.includes('gold')) {
    return 'gold';
  }
  return 'silver';
}

/* ==================== CORE FIREBASE DATA AGGREGATOR ==================== */

export interface AnalyticsDataStore {
  users: RawUser[];
  products: RawProduct[];
  subscriptions: RawSubscription[];
  orders: RawOrder[];
  walletTransactions: RawWalletTransaction[];
  skippedDeliveries: RawSkippedDelivery[];
  reviews: RawReview[];
  fetchedAt: Date;
}

export interface DiagnosticsState {
  dbConnected: boolean;
  authenticated: boolean;
  queries: {
    users: { status: 'OK' | 'FAILED'; count: number; error?: string };
    products: { status: 'OK' | 'FAILED'; count: number; error?: string };
    subscriptions: { status: 'OK' | 'FAILED'; count: number; error?: string };
    orders: { status: 'OK' | 'FAILED'; count: number; error?: string };
    walletTransactions: { status: 'OK' | 'FAILED'; count: number; error?: string };
    skippedDeliveries: { status: 'OK' | 'FAILED'; count: number; error?: string };
    reviews: { status: 'OK' | 'FAILED'; count: number; error?: string };
  };
}

let memoryCache: AnalyticsDataStore | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 60 seconds cache to prevent repeated scans

export async function fetchAllAnalyticsRawData(forceRefresh = false): Promise<AnalyticsDataStore> {
  const now = Date.now();
  if (memoryCache && !forceRefresh && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  const fetchCol = async <T>(colName: string): Promise<T[]> => {
    try {
      const snap = await getDocs(collection(db, colName));
      const list: T[] = [];
      snap.forEach((docSnap) => {
        list.push({ _id: docSnap.id, uid: docSnap.id, ...(docSnap.data() as any) });
      });
      return list;
    } catch (err: any) {
      console.warn(`[Firestore Read Error] Collection "${colName}" query failed:`, err.message || err);
      throw err;
    }
  };

  try {
    const [users, products, subscriptions, orders, walletTransactions, skippedDeliveries, reviews] = await Promise.all([
      fetchCol<RawUser>('users'),
      fetchCol<RawProduct>('products'),
      fetchCol<RawSubscription>('subscriptions'),
      fetchCol<RawOrder>('orders'),
      fetchCol<RawWalletTransaction>('walletTransactions'),
      fetchCol<RawSkippedDelivery>('skippedDeliveries'),
      fetchCol<RawReview>('reviews')
    ]);

    // Format display IDs locally without running Firestore write transactions during reads
    users.forEach((u, idx) => {
      if (!u.userId) {
        u.userId = `RM${100001 + idx}`;
      }
    });

    memoryCache = {
      users,
      products,
      subscriptions,
      orders,
      walletTransactions,
      skippedDeliveries,
      reviews,
      fetchedAt: new Date()
    };
    lastFetchTime = now;
    return memoryCache;
  } catch (err: any) {
    console.error('[Analytics Fetch Fatal Error]', err);
    throw new Error(err.message || 'Failed to query database collections.');
  }
}

export async function runDatabaseDiagnostics(): Promise<DiagnosticsState> {
  const diag: DiagnosticsState = {
    dbConnected: true,
    authenticated: true,
    queries: {
      users: { status: 'OK', count: 0 },
      products: { status: 'OK', count: 0 },
      subscriptions: { status: 'OK', count: 0 },
      orders: { status: 'OK', count: 0 },
      walletTransactions: { status: 'OK', count: 0 },
      skippedDeliveries: { status: 'OK', count: 0 },
      reviews: { status: 'OK', count: 0 }
    }
  };

  const testCol = async (colName: keyof DiagnosticsState['queries']) => {
    try {
      const snap = await getDocs(collection(db, colName as string));
      diag.queries[colName] = { status: 'OK', count: snap.docs.length };
    } catch (err: any) {
      diag.queries[colName] = { status: 'FAILED', count: 0, error: err.message };
    }
  };

  await Promise.all([
    testCol('users'),
    testCol('products'),
    testCol('subscriptions'),
    testCol('orders'),
    testCol('walletTransactions'),
    testCol('skippedDeliveries'),
    testCol('reviews')
  ]);

  return diag;
}

/* ==================== CALCULATED METRICS ENGINES ==================== */

export interface OverviewMetrics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  activeSubscriptions: number;
  totalDeliveries: number;
  todayDeliveries: number;
  todayPending: number;
  todaySkipped: number;
  todayRevenue: number;
  todayMilkVolumeL: number;
  totalMilkVolumeL: number;
  totalRevenue: number;
  totalCreditsGiven: number;
  totalCreditsUsed: number;
  totalCreditsRemoved: number;
  totalCreditsRemaining: number;
  silverCustomers: number;
  goldCustomers: number;
  silverDeliveries: number;
  goldDeliveries: number;
  silverRevenue: number;
  goldRevenue: number;
  silverCreditsRemaining: number;
  goldCreditsRemaining: number;
}

export function computeOverviewMetrics(store: AnalyticsDataStore, dateFilter: DateFilter): OverviewMetrics {
  const bounds = getBoundsForRange(dateFilter);
  const todayBounds = getBoundsForRange({ preset: 'today' });

  const totalCustomers = store.users.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let activeCustomers = 0;
  let inactiveCustomers = 0;

  store.users.forEach((u) => {
    const activity = getCustomerActivity(u, store);
    if (activity.daysInactive !== null && activity.daysInactive <= 30) {
      activeCustomers++;
    } else {
      inactiveCustomers++;
    }
  });

  const activeSubscriptions = store.subscriptions.filter((s) => s.status === 'Active' || s.status === 'ACTIVE PLAN' || !s.status).length;

  const rangeOrders = store.orders.filter((o) => isDateInRange(o.createdAt || o.deliveryDate, bounds));
  const todayOrders = store.orders.filter((o) => isDateInRange(o.createdAt || o.deliveryDate, todayBounds));
  const todaySkips = store.skippedDeliveries.filter((s) => isDateInRange(s.createdAt || s.date, todayBounds));

  const totalDeliveries = rangeOrders.filter((o) => o.status === 'Delivered').length;
  const todayDeliveries = todayOrders.filter((o) => o.status === 'Delivered').length;
  const todayPending = todayOrders.filter((o) => o.status === 'Pending' || !o.status).length;
  const todaySkipped = todaySkips.length + todayOrders.filter((o) => o.status === 'Skipped').length;

  let todayRevenue = 0;
  todayOrders.forEach((o) => {
    todayRevenue += Number(o.totalAmount || 0);
  });

  let todayMilkVolumeL = 0;
  todayOrders.filter((o) => o.status === 'Delivered').forEach((o) => {
    const tier = getTier(o);
    todayMilkVolumeL += tier === 'gold' ? 1.0 : 0.5;
  });

  let totalMilkVolumeL = 0;
  rangeOrders.filter((o) => o.status === 'Delivered').forEach((o) => {
    const tier = getTier(o);
    totalMilkVolumeL += tier === 'gold' ? 1.0 : 0.5;
  });

  let totalRevenue = 0;
  rangeOrders.forEach((o) => {
    totalRevenue += Number(o.totalAmount || 0);
  });

  let totalCreditsGiven = 0;
  let totalCreditsUsed = 0;
  let totalCreditsRemoved = 0;
  let totalCreditsRemaining = 0;

  store.walletTransactions.filter((t) => isDateInRange(t.createdAt, bounds)).forEach((t) => {
    const amt = Number(t.amount || 0);
    if (t.type === 'Admin Add' || amt > 0) {
      totalCreditsGiven += amt;
    } else if (t.type === 'Milk Delivered' || (amt < 0 && t.type !== 'Admin Adjustment')) {
      totalCreditsUsed += Math.abs(amt);
    } else if (t.type === 'Admin Adjustment' || amt < 0) {
      totalCreditsRemoved += Math.abs(amt);
    }
  });

  store.users.forEach((u) => {
    totalCreditsRemaining += Number(u.walletBalance || 0);
  });

  let silverCustomers = 0;
  let goldCustomers = 0;
  let silverDeliveries = 0;
  let goldDeliveries = 0;
  let silverRevenue = 0;
  let goldRevenue = 0;
  let silverCreditsRemaining = 0;
  let goldCreditsRemaining = 0;

  store.users.forEach((u) => {
    const userSub = store.subscriptions.find((s) => s.userId === u.uid);
    const tier = getTier(userSub);
    if (tier === 'gold') {
      goldCustomers++;
      goldCreditsRemaining += Number(u.walletBalance || 0);
    } else {
      silverCustomers++;
      silverCreditsRemaining += Number(u.walletBalance || 0);
    }
  });

  rangeOrders.forEach((o) => {
    const tier = getTier(o);
    const rev = Number(o.totalAmount || 0);
    if (tier === 'gold') {
      goldRevenue += rev;
      if (o.status === 'Delivered') goldDeliveries++;
    } else {
      silverRevenue += rev;
      if (o.status === 'Delivered') silverDeliveries++;
    }
  });

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    activeSubscriptions,
    totalDeliveries,
    todayDeliveries,
    todayPending,
    todaySkipped,
    todayRevenue,
    todayMilkVolumeL,
    totalMilkVolumeL,
    totalRevenue,
    totalCreditsGiven,
    totalCreditsUsed,
    totalCreditsRemoved,
    totalCreditsRemaining,
    silverCustomers,
    goldCustomers,
    silverDeliveries,
    goldDeliveries,
    silverRevenue,
    goldRevenue,
    silverCreditsRemaining,
    goldCreditsRemaining
  };
}

/* ==================== TIMESTAMP & DATE NORMALIZATION ==================== */

export function parseTimestamp(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
  if (typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'object') {
    const seconds = ts.seconds ?? ts._seconds;
    if (typeof seconds === 'number') {
      const d = new Date(seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof ts.toDate === 'function') {
      try {
        const d = ts.toDate();
        return d && !isNaN(d.getTime()) ? d : null;
      } catch {
        return null;
      }
    }
  }
  if (typeof ts === 'string') {
    const str = ts.trim();
    if (!str) return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    const parts = str.split(/[-/ T]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const parsedDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
    }
  }
  return null;
}

export function formatAsiaKolkataDate(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function calculateDaysInactive(lastActivityAt: Date | null, now: Date = new Date()): number | null {
  if (!lastActivityAt) return null;
  const diffMs = now.getTime() - lastActivityAt.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export interface CustomerActivitySummary {
  uid: string;
  userDisplayId: string;
  name: string;
  mobile: string;
  email: string;
  tier: 'silver' | 'gold';
  lastDeliveryAt: Date | null;
  lastOrderAt: Date | null;
  lastActivityAt: Date | null;
  daysInactive: number | null;
  daysInactiveDisplay: string;
  lastDeliveryDateStr: string;
  lastOrderDateStr: string;
  subscriptionStatus: string;
  creditsGiven: number;
  creditsUsed: number;
  creditsRemaining: number;
  historicalSpending: number;
}

export function getCustomerActivity(u: RawUser, store: AnalyticsDataStore): CustomerActivitySummary {
  const now = new Date();

  // Match strictly by persistent UID / document ID
  const userOrders = store.orders.filter((o) => o.userId === u.uid);
  const userTxs = store.walletTransactions.filter((t) => t.userId === u.uid);
  const userSub = store.subscriptions.find((s) => s.userId === u.uid);

  let lastDeliveryAt: Date | null = null;
  let lastOrderAt: Date | null = null;
  let historicalSpending = 0;

  // Evaluate ALL historical orders for this user
  userOrders.forEach((o) => {
    historicalSpending += Number(o.totalAmount || 0);

    const orderTime = parseTimestamp(o.createdAt || o.deliveryDate);
    if (orderTime) {
      if (!lastOrderAt || orderTime > lastOrderAt) {
        lastOrderAt = orderTime;
      }
    }

    // Only confirmed DELIVERED milk deliveries update lastDeliveryAt (PENDING and SKIPPED do not)
    if (o.status === 'Delivered') {
      const delTime = parseTimestamp(o.deliveryDate || o.createdAt);
      if (delTime) {
        if (!lastDeliveryAt || delTime > lastDeliveryAt) {
          lastDeliveryAt = delTime;
        }
      }
    }
  });

  // Check wallet transactions for confirmed Milk Delivered entries
  userTxs.forEach((t) => {
    if (t.type === 'Milk Delivered') {
      const txTime = parseTimestamp(t.createdAt);
      if (txTime) {
        if (!lastDeliveryAt || txTime > lastDeliveryAt) {
          lastDeliveryAt = txTime;
        }
      }
    }
  });

  // Prefer latest confirmed MILK DELIVERY. If none, fallback to latest order.
  const lastActivityAt = lastDeliveryAt || lastOrderAt;
  const daysInactive = calculateDaysInactive(lastActivityAt, now);

  let daysInactiveDisplay = 'No Activity';
  if (daysInactive !== null) {
    if (daysInactive === 0) daysInactiveDisplay = 'Active Today (0 days)';
    else if (daysInactive === 1) daysInactiveDisplay = '1 day';
    else daysInactiveDisplay = `${daysInactive} days`;
  }

  let creditsGiven = 0;
  let creditsUsed = 0;
  userTxs.forEach((t) => {
    const amt = Number(t.amount || 0);
    if (amt > 0) creditsGiven += amt;
    if (t.type === 'Milk Delivered' || amt < 0) creditsUsed += Math.abs(amt);
  });

  return {
    uid: u.uid,
    userDisplayId: u.userId || 'N/A',
    name: u.name || u.displayName || 'Customer',
    mobile: u.mobile || 'N/A',
    email: u.email || 'N/A',
    tier: getTier(userSub),
    lastDeliveryAt,
    lastOrderAt,
    lastActivityAt,
    daysInactive,
    daysInactiveDisplay,
    lastDeliveryDateStr: formatAsiaKolkataDate(lastDeliveryAt),
    lastOrderDateStr: formatAsiaKolkataDate(lastOrderAt),
    subscriptionStatus: u.subscriptionStatus || userSub?.status || 'No Plan',
    creditsGiven,
    creditsUsed,
    creditsRemaining: Number(u.walletBalance || 0),
    historicalSpending
  };
}

export function debugCustomerActivity(u: RawUser, store: AnalyticsDataStore): CustomerActivitySummary {
  const summary = getCustomerActivity(u, store);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Customer Activity Diagnostics]`, {
      customerId: summary.userDisplayId,
      uid: summary.uid,
      name: summary.name,
      lastDeliveryRaw: summary.lastDeliveryAt,
      lastDeliveryFormatted: summary.lastDeliveryDateStr,
      lastOrderRaw: summary.lastOrderAt,
      lastOrderFormatted: summary.lastOrderDateStr,
      lastActivityAt: summary.lastActivityAt,
      currentTimeIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      calculatedDaysInactive: summary.daysInactive,
      display: summary.daysInactiveDisplay
    });
  }
  return summary;
}

/* ==================== CUSTOMER INACTIVITY REPORT ==================== */

export interface InactiveCustomerRow {
  uid: string;
  userDisplayId: string;
  name: string;
  mobile: string;
  email: string;
  tier: 'silver' | 'gold';
  lastOrderDate: string;
  lastDeliveryDate: string;
  daysInactive: number | null;
  daysInactiveDisplay: string;
  subscriptionStatus: string;
  creditsGiven: number;
  creditsUsed: number;
  creditsRemaining: number;
  historicalSpending: number;
}

export function computeInactiveCustomers(store: AnalyticsDataStore, minDaysInactive: number): InactiveCustomerRow[] {
  return store.users
    .map((u) => {
      const summary = getCustomerActivity(u, store);
      return {
        uid: summary.uid,
        userDisplayId: summary.userDisplayId,
        name: summary.name,
        mobile: summary.mobile,
        email: summary.email,
        tier: summary.tier,
        lastOrderDate: summary.lastOrderDateStr,
        lastDeliveryDate: summary.lastDeliveryDateStr,
        daysInactive: summary.daysInactive,
        daysInactiveDisplay: summary.daysInactiveDisplay,
        subscriptionStatus: summary.subscriptionStatus,
        creditsGiven: summary.creditsGiven,
        creditsUsed: summary.creditsUsed,
        creditsRemaining: summary.creditsRemaining,
        historicalSpending: summary.historicalSpending
      };
    })
    .filter((row) => row.daysInactive !== null && row.daysInactive >= minDaysInactive)
    .sort((a, b) => (b.daysInactive ?? -1) - (a.daysInactive ?? -1));
}

/* ==================== CUSTOMER 360 DETAILED LOOKUP ==================== */

export interface ActivityTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'delivery' | 'skip' | 'credit' | 'subscription' | 'order';
  badgeColor: 'emerald' | 'rose' | 'sky' | 'amber' | 'purple';
}

export interface Customer360Details {
  user: RawUser;
  subscription: RawSubscription | null;
  orders: RawOrder[];
  walletTransactions: RawWalletTransaction[];
  skippedDeliveries: RawSkippedDelivery[];
  reviews: RawReview[];
  totalDeliveries: number;
  deliveredCount: number;
  skippedCount: number;
  pendingCount: number;
  daysInactive: number | null;
  daysInactiveDisplay: string;
  lastDeliveryDateStr: string;
  lastOrderDateStr: string;
  totalRevenue: number;
  avgOrderValue: number;
  creditsGiven: number;
  creditsUsed: number;
  timeline: ActivityTimelineEvent[];
}

export function getCustomer360Data(store: AnalyticsDataStore, userIdOrQuery: string): Customer360Details | null {
  if (!userIdOrQuery) return null;
  const q = userIdOrQuery.toLowerCase().trim();

  const user = store.users.find((u) => 
    u.uid.toLowerCase() === q ||
    (u.userId && u.userId.toLowerCase() === q) ||
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.mobile && u.mobile.includes(q)) ||
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.displayName && u.displayName.toLowerCase().includes(q))
  );

  if (!user) return null;

  const activitySummary = getCustomerActivity(user, store);
  const subscription = store.subscriptions.find((s) => s.userId === user.uid) || null;
  const orders = store.orders.filter((o) => o.userId === user.uid).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const walletTransactions = store.walletTransactions.filter((t) => t.userId === user.uid).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const skippedDeliveries = store.skippedDeliveries.filter((s) => s.userId === user.uid).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const reviews = store.reviews.filter((r) => r.name && user.name && r.name.toLowerCase() === user.name.toLowerCase());

  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const skippedCount = skippedDeliveries.length + orders.filter((o) => o.status === 'Skipped').length;
  const pendingCount = orders.filter((o) => o.status === 'Pending' || !o.status).length;
  const totalDeliveries = deliveredCount + skippedCount + pendingCount;

  let totalRevenue = 0;
  orders.forEach((o) => {
    totalRevenue += Number(o.totalAmount || 0);
  });
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  let creditsGiven = 0;
  let creditsUsed = 0;
  walletTransactions.forEach((t) => {
    const amt = Number(t.amount || 0);
    if (amt > 0) creditsGiven += amt;
    if (t.type === 'Milk Delivered' || amt < 0) creditsUsed += Math.abs(amt);
  });

  // Build Chronological Timeline
  const timeline: ActivityTimelineEvent[] = [];

  orders.forEach((o) => {
    const d = o.deliveryDate || o.createdAt || new Date().toISOString();
    if (o.status === 'Delivered') {
      timeline.push({
        id: `ord-del-${o._id || o.id}`,
        date: d,
        title: '✓ Milk Delivered',
        description: `-1 Credit consumed (${getTier(o).toUpperCase()} Tier)`,
        type: 'delivery',
        badgeColor: 'emerald'
      });
    } else if (o.status === 'Skipped') {
      timeline.push({
        id: `ord-skip-${o._id || o.id}`,
        date: d,
        title: 'Delivery Skipped',
        description: '0 Credits consumed (Skipped requested by user)',
        type: 'skip',
        badgeColor: 'amber'
      });
    }
  });

  skippedDeliveries.forEach((s) => {
    timeline.push({
      id: `skip-${s._id || s.id}`,
      date: s.date || s.createdAt || new Date().toISOString(),
      title: 'Delivery Skipped',
      description: '0 Credits consumed (Delivery Calendar Skip)',
      type: 'skip',
      badgeColor: 'amber'
    });
  });

  walletTransactions.forEach((t) => {
    const d = t.createdAt || new Date().toISOString();
    const amt = Number(t.amount || 0);
    if (t.type === 'Admin Add' || amt > 0) {
      timeline.push({
        id: `tx-add-${t._id || t.transactionId}`,
        date: d,
        title: `+${amt} Credits Added`,
        description: t.reason || 'Admin Credit Allocation',
        type: 'credit',
        badgeColor: 'sky'
      });
    }
  });

  if (subscription?.createdAt || subscription?.startDate) {
    timeline.push({
      id: `sub-start-${subscription._id || subscription.id}`,
      date: subscription.createdAt || subscription.startDate || new Date().toISOString(),
      title: `Subscription Started (${getTier(subscription).toUpperCase()})`,
      description: `Plan value: ₹${subscription.planValue || (getTier(subscription) === 'gold' ? 2700 : 1500)}`,
      type: 'subscription',
      badgeColor: 'purple'
    });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    user,
    subscription,
    orders,
    walletTransactions,
    skippedDeliveries,
    reviews,
    totalDeliveries,
    deliveredCount,
    skippedCount,
    pendingCount,
    daysInactive: activitySummary.daysInactive,
    daysInactiveDisplay: activitySummary.daysInactiveDisplay,
    lastDeliveryDateStr: activitySummary.lastDeliveryDateStr,
    lastOrderDateStr: activitySummary.lastOrderDateStr,
    totalRevenue,
    avgOrderValue,
    creditsGiven,
    creditsUsed,
    timeline
  };
}

