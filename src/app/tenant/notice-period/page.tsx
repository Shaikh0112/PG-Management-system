'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantContext } from '@/app/tenant/components/TenantContext';
import { getSession } from '@/lib/auth/session';
import { CalendarClock } from 'lucide-react';
import { api } from '@/lib/api';
import { createId } from '@/lib/utils/id';
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export default function TenantNoticePeriodPage() {
  const router = useRouter();
  const { profile } = useTenantContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [formData, setFormData] = useState({ date: '', reason: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session) return;
    
    // Create notice record manually since it's a small standalone feature
    db.insert('spg_notices', {
      id: createId('not'),
      propertyId: profile.propertyId,
      tenantId: profile.id,
      moveOutDate: formData.date,
      reason: formData.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.id,
      updatedBy: session.id,
      isDeleted: false
    });
    
    alert('Move-out notice submitted successfully. Manager has been notified.');
    router.push('/tenant/dashboard');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Notice Period</h1>
        <p className="text-sm text-[var(--text-secondary)]">Submit your 30-day move-out notice.</p>
      </div>

      <div className="bg-[var(--warning-bg)] border border-[var(--warning)] rounded-[var(--radius-lg,12px)] p-4 flex gap-3 text-[var(--warning)] text-sm">
        <CalendarClock className="w-5 h-5 shrink-0" />
        <p>As per your agreement, you must serve a minimum of 30 days notice period before vacating to get your security deposit back.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expected Move-out Date</label>
          <input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-4 py-2 rounded text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason for leaving</label>
          <textarea required rows={4} value={formData.reason} onChange={e=>setFormData({...formData, reason: e.target.value})} placeholder="Please tell us why you are leaving..." className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-4 py-2 rounded text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] resize-none" />
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-[var(--bg-input)] text-[var(--text-primary)] rounded font-medium text-sm">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-[var(--primary)] text-white rounded font-bold text-sm shadow-sm hover:bg-[var(--primary-hover)]">Submit Notice</button>
        </div>
      </form>
    </div>
  );
}
