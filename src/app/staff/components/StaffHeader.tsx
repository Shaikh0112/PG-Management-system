'use client';

import { Bell } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { useStaffContext } from './StaffContext';
import { useStaffI18n } from '@/app/staff/i18n';

export function StaffHeader() {
  const session = typeof window !== 'undefined' ? getSession() : null;
  const { staffRole } = useStaffContext();
  const { lang, setLang, t } = useStaffI18n();

  return (
    <header className="h-16 bg-[var(--bg-page)]/80 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-20 flex items-center justify-between px-8">
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('welcome')}, {session?.name || 'Staff'}</h1>
        <p className="text-xs text-[var(--text-secondary)] capitalize">Role: {staffRole || 'Loading...'}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="hidden md:flex items-center bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] overflow-hidden text-xs font-bold">
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

        <button className="relative p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-input)] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--danger)] rounded-full border border-[var(--bg-page)]"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-[var(--text-primary)]">{session?.name}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold shadow-sm">
            {session?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}
