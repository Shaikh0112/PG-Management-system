'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, Shield, Sparkles, Wrench, ListTodo, LogOut } from 'lucide-react';
import { clearSession } from '@/lib/auth/session';

const links = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/cook', label: 'Kitchen', icon: Utensils, role: 'cook' },
  { href: '/staff/guard', label: 'Gate Security', icon: Shield, role: 'guard' },
  { href: '/staff/housekeeping', label: 'Housekeeping', icon: Sparkles, role: 'cleaner' },
  { href: '/staff/maintenance', label: 'Maintenance', icon: Wrench, role: 'maintenance' },
  { href: '/staff/tasks', label: 'General Tasks', icon: ListTodo }
];

export function StaffSidebar({ staffRole }: { staffRole: string | null }) {
  const pathname = usePathname();

  // Filter links: show general ones + the one matching their specific role
  const visibleLinks = links.filter(l => !l.role || l.role === staffRole || staffRole === 'admin');

  return (
    <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border)] h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-[var(--border)]">
        <h2 className="text-xl font-black text-[var(--primary)] tracking-tight">Staff Portal</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wider">{staffRole || 'Staff'}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md,8px)] transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-[var(--primary)] text-white shadow-md' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => { clearSession(); window.location.href = '/staff/login'; }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-[var(--radius-md,8px)] transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
