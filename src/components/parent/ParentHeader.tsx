'use client';

import { getSession } from '@/lib/auth/session';
import { useParentContext } from './ParentContext';
import { User, Shield } from 'lucide-react';
import { useParentI18n } from '@/app/parent/i18n';

export function ParentHeader() {
  const session = typeof window !== 'undefined' ? getSession() : null;
  const { child } = useParentContext();
  const { lang, setLang, t } = useParentI18n();

  return (
    <header className="h-20 bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      <div className="md:hidden">
        <h1 className="text-2xl font-black text-[var(--primary)] tracking-tight">ApnaPG</h1>
      </div>
      <div className="hidden md:flex flex-col">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('welcome')}, {session?.name}</h1>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Parent Portal</p>
      </div>

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
        <div className="flex items-center gap-3 bg-[var(--primary-subtle)] px-4 py-2 rounded-full border border-[var(--primary)]/20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-bold text-[var(--primary)]">{child.name}</div>
            <div className="text-xs font-medium text-[var(--primary)]/80">Room {child.roomNumber}</div>
          </div>
        </div>
        )}
      </div>
    </header>
  );
}
