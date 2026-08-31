'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, IndianRupee, MessageSquareWarning, Bell, User, LogOut } from 'lucide-react';
import { clearSession } from '@/lib/auth/session';

const links = [
  { href: '/parent/dashboard', label: 'Home', hindi: 'मुख्य पृष्ठ', icon: Home },
  { href: '/parent/logs', label: 'Safety', hindi: 'सुरक्षा', icon: ShieldCheck },
  { href: '/parent/finance', label: 'Finance', hindi: 'पैसे', icon: IndianRupee },
  { href: '/parent/complaints', label: 'Tickets', hindi: 'शिकायतें', icon: MessageSquareWarning },
  { href: '/parent/alerts', label: 'Alerts', hindi: 'अलर्ट', icon: Bell },
  { href: '/parent/profile', label: 'Profile', hindi: 'प्रोफ़ाइल', icon: User },
];

export function ParentNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[var(--bg-card)] border-r border-[var(--border)] h-screen flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--primary)] text-white">
          <h2 className="text-2xl font-black tracking-tight">ApnaPG</h2>
          <p className="text-sm mt-1 tracking-wider opacity-90 font-medium">Parent Portal | अभिभावक पोर्टल</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-4 px-4 py-3 rounded-[var(--radius-md,8px)] transition-all font-bold text-lg ${isActive ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'}`}>
                <Icon className="w-6 h-6 shrink-0" />
                <div>
                  <div className="leading-tight">{link.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-[var(--text-secondary)]'} font-medium mt-0.5`}>{link.hindi}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <button onClick={() => { clearSession(); window.location.href = '/parent/login'; }} className="flex items-center gap-3 px-4 py-4 w-full text-left text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-[var(--radius-md,8px)] transition-colors font-bold text-lg">
            <LogOut className="w-6 h-6" /> 
            <div>
              <div className="leading-tight">Sign out</div>
              <div className="text-xs font-medium mt-0.5">लॉग आउट</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] z-50 flex justify-around pb-safe">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link key={link.href} href={link.href} className={`flex flex-col items-center p-2 flex-1 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold leading-tight">{link.label}</span>
              <span className="text-[9px] font-medium leading-tight">{link.hindi}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
