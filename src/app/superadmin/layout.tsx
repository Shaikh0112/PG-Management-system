'use client';
import { RequireSuperAdmin } from '@/app/superadmin/components/RequireSuperAdmin';
import { ToastProvider } from '@/lib/ui/ToastContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, UserPlus, Users, Package, BarChart3, ToggleLeft, Ticket, History, Settings, Menu, X, ShieldAlert } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth/session';
import { SuperadminI18nProvider, useSuperadminI18n, DictKey } from './i18n';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

function SuperAdminLayoutInner({ children, adminName, isMobileMenuOpen, setIsMobileMenuOpen, navItems, handleLogout, pathname }: any) {
  const { lang, setLang, t } = useSuperadminI18n();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] font-sans">
      
      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-header)]/90 backdrop-blur-md border-b border-[var(--border)] z-50 flex items-center justify-between px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--text-primary)] hover:bg-[var(--bg-page)] p-2 rounded-full transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-7 h-7" />
            <span className="hidden sm:inline">SPG Platform</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Switcher */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] rounded-[var(--radius-md,8px)] transition-colors border border-transparent hover:border-[var(--primary-subtle)]"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <><Sun className="w-4 h-4" /> Light Mode</>
              ) : (
                <><Moon className="w-4 h-4" /> Dark Mode</>
              )}
            </button>
          )}


          <div className="text-sm text-[var(--text-secondary)] max-w-[80px] truncate">
            Admin: <strong className="text-[var(--text-primary)]">{adminName}</strong>
          </div>
          
          <button onClick={handleLogout} className="text-sm bg-[var(--bg-page)] border border-[var(--border)] px-4 py-2 rounded-[var(--radius-md,8px)] text-[var(--danger)] font-medium hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
            {t('logout')}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 custom-scrollbar
      `}>
        <nav className="p-4 space-y-1">
          {navItems.map((item: any) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] text-sm font-medium transition-all ${isActive ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-l-4 border-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] hover:translate-x-1'}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.key ? t(item.key as DictKey) : item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="md:ml-60 pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-6 text-[var(--text-primary)] overflow-x-hidden">
          {/* Breadcrumb / Title Bar (Optional, specific to pages usually, but we can put a generic one here or leave to pages) */}
          {children}
        </div>
      </main>
    </div>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const session = getSession();
    if(session) setAdminName(session.name);
  }, []);

  const navItems = [
    { key: 'dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
    { key: 'ownerRequests', href: '/superadmin/owner-requests', icon: FileText },
    { name: 'Create Owner', href: '/superadmin/create-owner', icon: UserPlus }, // missing in dict
    { key: 'owners', href: '/superadmin/owners', icon: Users },
    { name: 'Plans', href: '/superadmin/plans', icon: Package }, // missing in dict
    { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 }, // missing
    { name: 'Feature Flags', href: '/superadmin/feature-flags', icon: ToggleLeft }, // missing
    { key: 'tickets', href: '/superadmin/tickets', icon: Ticket },
    { name: 'Audit Logs', href: '/superadmin/audit-logs', icon: History }, // missing
    { key: 'settings', href: '/superadmin/settings', icon: Settings },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      clearSession();
      window.location.href = '/';
    }
  };

  return (
    <RequireSuperAdmin>
      <SuperadminI18nProvider>
        <ToastProvider>
          <SuperAdminLayoutInner 
            children={children} 
            adminName={adminName} 
            isMobileMenuOpen={isMobileMenuOpen} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            navItems={navItems} 
            handleLogout={handleLogout} 
            pathname={pathname} 
          />
        </ToastProvider>
      </SuperadminI18nProvider>
    </RequireSuperAdmin>
  );
}
