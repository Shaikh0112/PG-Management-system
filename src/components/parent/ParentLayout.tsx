'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShieldCheck, IndianRupee, MessageSquareWarning, Bell, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth/session';
import { ParentProvider, useParentContext } from './ParentContext';
import { useParentI18n, DictKey } from '@/app/parent/i18n';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/parent/dashboard', icon: Home },
  { key: 'logs', href: '/parent/logs', icon: ShieldCheck },
  { key: 'finance', href: '/parent/finance', icon: IndianRupee },
  { key: 'complaints', href: '/parent/complaints', icon: MessageSquareWarning },
  { key: 'alerts', href: '/parent/alerts', icon: Bell },
  { key: 'profile', href: '/parent/profile', icon: User },
];

function ParentLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { loading, child } = useParentContext();
  const { lang, setLang, t } = useParentI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'parent') {
      router.replace('/parent/login');
    }
  }, [router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clearSession();
    router.push('/');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <ShieldAlert className="text-[var(--primary)] w-6 h-6" />
          <span>Parent Portal</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)]">
          <Menu />
        </button>
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
            <ShieldAlert className="text-[var(--primary)] w-7 h-7" />
            <span>Parent Portal</span>
          </div>
          <button className="md:hidden text-[var(--text-secondary)]" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] text-sm font-medium transition-colors ${isActive ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-l-4 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'}`}
              >
                <item.icon className="w-5 h-5" />
                {t(item.key as DictKey)}
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

            {child && (
              <div className="flex items-center gap-3 bg-[var(--primary-subtle)] px-4 py-1.5 rounded-full border border-[var(--primary)]/20 shadow-sm text-xs">
                <User className="w-4 h-4 text-[var(--primary)]" />
                <div className="hidden md:block">
                  <div className="font-bold text-[var(--primary)] leading-tight">{child.name}</div>
                  <div className="font-medium text-[var(--primary)]/80 leading-tight">Room {child.roomNumber}</div>
                </div>
              </div>
            )}

            <div className="text-sm text-[var(--text-secondary)]">
              Parent: <strong className="text-[var(--text-primary)]">{user?.name}</strong>
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

export function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentProvider>
      <ParentLayoutInner>{children}</ParentLayoutInner>
    </ParentProvider>
  );
}
