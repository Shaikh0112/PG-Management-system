'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Building2, Bed, Users, UserSquare2, 
  Wallet, UtensilsCrossed, FileBarChart, Settings, CreditCard,
  LogOut, Bell, Building, Menu, X, ShieldAlert, Banknote, Wrench
} from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from './OwnerPropertyContext';
import { useOwnerI18n, DictKey } from '@/app/owner/i18n';
import { ForcePasswordChangeModal } from '@/components/shared/ForcePasswordChangeModal';
import { ThemeToggle } from '@/components/public/ThemeToggle';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { key: 'properties', href: '/owner/properties', icon: Building2 },
  { key: 'rooms', href: '/owner/rooms', icon: Bed },
  { key: 'team', href: '/owner/team', icon: Users },
  { key: 'payroll', href: '/owner/payroll', icon: Banknote },
  { key: 'tenants', href: '/owner/tenants', icon: UserSquare2 },
  { key: 'finance', href: '/owner/finance', icon: Wallet },
  { key: 'maintenance', href: '/owner/maintenance', icon: Wrench, label: 'Maintenance Log' },
  { key: 'food', href: '/owner/food', icon: UtensilsCrossed, label: 'Food Menu' },
  { key: 'reports', href: '/owner/reports', icon: FileBarChart },
  { key: 'settings', href: '/owner/settings', icon: Settings },
  { key: 'subscription', href: '/owner/subscription', icon: CreditCard },
];

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId, setSelectedPropertyId } = useOwnerPropertyContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useOwnerI18n();
  const [forcePasswordChange, setForcePasswordChange] = useState(user?.mustChangePassword || false);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearSession();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col md:flex-row">
      <ForcePasswordChangeModal 
        user={user} 
        onSuccess={() => setForcePasswordChange(false)} 
      />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Building className="text-[var(--primary)] w-6 h-6" />
          <span>SmartPG Owner</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] ml-2">
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-y-auto shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen
      `}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--text-primary)]">
            <Building className="text-[var(--primary)] w-7 h-7" />
            <span>SmartPG Owner</span>
          </div>
          <button className="md:hidden text-[var(--text-secondary)]" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const label = item.label || t(item.key as DictKey);
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] text-sm font-medium transition-colors ${isActive ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-l-4 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'}`}
              >
                <item.icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 bg-[var(--bg-header)] border-b border-[var(--border)] items-center px-6 justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] capitalize">
            {pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Language Switcher */}
            <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] overflow-hidden text-xs font-bold">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 transition-colors ${lang === 'hi' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                हिं
              </button>
            </div>

            {/* Property Switcher */}
            <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-1.5">
              <Building2 className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <select 
                className="bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none cursor-pointer w-full max-w-[150px] truncate"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
              >
                <option value="all">All Properties</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-[var(--text-secondary)]">
              Owner: <strong className="text-[var(--text-primary)]">{user?.name}</strong>
            </div>
            <button onClick={handleLogout} className="text-sm bg-[var(--bg-page)] border border-[var(--border)] px-4 py-2 rounded-[var(--radius-md,8px)] text-[var(--danger)] font-medium hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
              {t('logout')}
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-6 text-[var(--text-primary)] overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
