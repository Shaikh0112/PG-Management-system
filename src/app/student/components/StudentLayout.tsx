'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, IndianRupee, Utensils, MessageSquareWarning, FileText, Bell, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth/session';
import { StudentProvider, useStudentContext } from './StudentContext';
import { useStudentI18n, DictKey } from '@/app/student/i18n';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/student/dashboard', icon: Home },
  { key: 'payRent', href: '/student/rent', icon: IndianRupee },
  { key: 'mess', href: '/student/mess', icon: Utensils },
  { key: 'complaints', href: '/student/complaints', icon: MessageSquareWarning },
  { key: 'profile', href: '/student/profile', icon: User },
];

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { profile, loading } = useStudentContext();
  const { lang, setLang, t } = useStudentI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'student') {
      router.replace('/student/login');
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
      <div className="md:hidden flex items-center justify-between bg-[var(--bg-header)]/90 backdrop-blur-md p-3 border-b border-[var(--border)] shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-5 h-5 hidden sm:block" />
            <span className="hidden sm:block">Student Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
            {user?.name || 'Student'}
          </div>
          <button onClick={handleLogout} className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1.5 rounded-md font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
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
      <aside className={`hidden md:flex w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col sticky top-0 h-screen shrink-0 ${isMobileMenuOpen ? 'flex absolute z-50 w-64 h-screen left-0' : 'hidden'}`}>
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-card)]">
          <div className="flex items-center gap-2 font-black text-xl text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-7 h-7" />
            <span>Student App</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-[var(--text-primary)]">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="mb-4 px-3">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Menu</p>
          </div>
          
          {NAV_ITEMS.map((item) => {
            if (item.key === 'mess' && !profile?.hasMessFacility) return null;
            return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md,8px)] font-bold transition-all ${
                pathname === item.href 
                  ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-subtle)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {t(item.key as DictKey)}
            </Link>
          )})}
          
          <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-2">
            <Link href="/student/notices" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] text-sm font-medium">
              <Bell className="w-5 h-5"/> Notices
            </Link>
            <Link href="/student/documents" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] text-sm font-medium">
              <FileText className="w-5 h-5"/> {t('documents' as DictKey)}
            </Link>
            <Link href="/student/sos" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center w-full px-4 py-3 mt-2 bg-[#7f1d1d] text-white rounded-[var(--radius-md,8px)] font-bold shadow hover:bg-[#991b1b] border border-red-900/50 transition-colors">
              EMERGENCY SOS
            </Link>
          </div>
        </div>
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

            <div className="text-sm text-[var(--text-secondary)]">
              Student: <strong className="text-[var(--text-primary)]">{user?.name}</strong>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/90 backdrop-blur-xl border-t border-[var(--border)] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 transition-all duration-300">
        <div className="flex items-center justify-around p-2">
          {NAV_ITEMS.filter(item => !(item.key === 'mess' && !profile?.hasMessFacility)).slice(0, 5).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors rounded-xl ${
                pathname === item.href ? 'text-[var(--primary)] bg-[var(--primary-subtle)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
              }`}
            >
              <item.icon className={`w-6 h-6 ${pathname === item.href ? 'drop-shadow-sm' : ''}`} />
              <span className="text-[10px] font-bold">{t(item.key as DictKey)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentProvider>
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </StudentProvider>
  );
}
