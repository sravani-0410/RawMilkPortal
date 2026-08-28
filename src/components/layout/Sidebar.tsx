'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserX,
  Truck,
  TrendingUp,
  Package,
  Award,
  CalendarCheck,
  Wallet,
  Search,
  ShoppingBag,
  CheckCircle2,
  Repeat,
  MapPin,
  FileText,
  Milk,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/', label: 'Overview Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'CUSTOMERS',
    items: [
      { href: '/customer-activity', label: 'Customer Activity', icon: Users },
      { href: '/inactive-customers', label: 'Inactive Customers', icon: UserX },
      { href: '/customer-360', label: 'Customer 360', icon: Search }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { href: '/todays-operations', label: "Today's Operations", icon: Truck },
      { href: '/orders-analytics', label: 'Order Analytics', icon: ShoppingBag },
      { href: '/delivery-analytics', label: 'Delivery Analytics', icon: CheckCircle2 }
    ]
  },
  {
    title: 'SALES',
    items: [
      { href: '/sales', label: 'Sales Analytics', icon: TrendingUp },
      { href: '/products-analytics', label: 'Product Analytics', icon: Package },
      { href: '/daily-report', label: 'Daily Business Report', icon: FileText }
    ]
  },
  {
    title: 'SUBSCRIPTIONS',
    items: [
      { href: '/subscriptions-analytics', label: 'Subscription Analytics', icon: CalendarCheck },
      { href: '/silver-vs-gold', label: 'Silver vs Gold', icon: Award }
    ]
  },
  {
    title: 'WALLET',
    items: [
      { href: '/credit-analytics', label: 'Credit Analytics', icon: Wallet }
    ]
  },
  {
    title: 'RETENTION',
    items: [
      { href: '/retention', label: 'Retention & Top Users', icon: Repeat }
    ]
  },
  {
    title: 'GEOGRAPHY',
    items: [
      { href: '/geographical', label: 'Geographical Analytics', icon: MapPin }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Milk className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              RAW MILK
            </h1>
            <p className="text-[10px] text-sky-400 font-bold tracking-wider uppercase">
              Business Intelligence
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-600/20 text-sky-400 border-l-4 border-sky-500 font-bold pl-2 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 flex items-center justify-between">
        <span className="font-semibold text-[11px] text-slate-400">Raw Milk BI v2.0</span>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE DB</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 z-30 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          ></div>
          <div className="relative w-64 max-w-full h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
