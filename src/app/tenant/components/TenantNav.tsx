'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, IndianRupee, Utensils, MessageSquareWarning, FileText, Bell, LogOut, User } from 'lucide-react';
import { clearSession } from '@/lib/auth/session';

const links = [
  { href: '/tenant/dashboard', label: 'Home', icon: Home },
  { href: '/tenant/rent', label: 'Rent', icon: IndianRupee },
  { href: '/tenant/mess', label: 'Mess', icon: Utensils },
  { href: '/tenant/complaints', label: 'Support', icon: MessageSquareWarning },
  { href: '/tenant/profile', label: 'Profile', icon: User },
];

export function TenantNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[var(--bg-card)] border-r border-[var(--border)] h-screen flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-black text-[var(--primary)] tracking-tight">ApnaPG</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 tracking-wider">Tenant Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] transition-all font-medium text-sm ${isActive ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'}`}>
                <Icon className="w-5 h-5" /> {link.label}
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-2">
            <Link href="/tenant/notices" className="flex items-center gap-3 px-4 py-3 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] text-sm font-medium"><Bell className="w-5 h-5"/> Notices</Link>
            <Link href="/tenant/documents" className="flex items-center gap-3 px-4 py-3 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] text-sm font-medium"><FileText className="w-5 h-5"/> Documents</Link>
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <Link href="/tenant/sos" className="block text-center w-full px-4 py-3 bg-[var(--danger)] text-white rounded font-bold shadow hover:bg-red-600 transition-colors">
            EMERGENCY SOS
          </Link>
          <button onClick={() => { clearSession(); window.location.href = '/tenant/login'; }} className="flex items-center gap-3 px-4 py-3 w-full text-left text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-[var(--radius-md,8px)] transition-colors font-medium text-sm">
            <LogOut className="w-5 h-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] z-50 flex justify-around pb-safe">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center p-3 flex-1 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
