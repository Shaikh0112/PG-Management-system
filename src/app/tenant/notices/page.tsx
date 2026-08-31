'use client';

import { useState, useEffect } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { useTenantContext } from '@/app/tenant/components/TenantContext';
import { Bell } from 'lucide-react';

export default function TenantNoticesPage() {
  const { profile } = useTenantContext();
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setNotices(tenantOperationsApi.getNotices(profile.propertyId));
    }
  }, [profile]);

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Notices & Broadcasts</h1>
        <p className="text-sm text-[var(--text-secondary)]">Important updates from PG Management.</p>
      </div>

      <div className="space-y-4">
        {notices.map(n => (
          <div key={n.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg">{n.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{n.message}</p>
              <div className="text-xs font-medium text-[var(--text-secondary)] mt-3">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center p-8 text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)]">
            No notices from management yet.
          </div>
        )}
      </div>
    </div>
  );
}
