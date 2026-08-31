'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { UserPlus, Check, X, LogIn, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export default function ManagerVisitorsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [visitors, setVisitors] = useState<any[]>([]);
  const user = typeof window !== 'undefined' ? getSession() : null;

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setVisitors(api.managerOperations.listVisitors(selectedPropertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleStatus = (id: string, status: any) => {
    if (!user) return;
    api.managerOperations.updateVisitorStatus(id, status, user.id);
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Visitors</h1>
          <p className="text-sm text-[var(--text-secondary)]">Approve and log visitor entries.</p>
        </div>
      </div>

      <div className="space-y-4">
        {visitors.map(v => (
          <div key={v.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-[var(--radius-lg,12px)] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">{v.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">Visiting: {v.tenantName || 'Tenant'} (Room {v.roomNumber || '-'})</p>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Phone: {v.phone} • Relation: {v.relation}</div>
              <div className="mt-2 text-xs font-medium px-2 py-1 bg-[var(--bg-input)] inline-block rounded text-[var(--text-primary)]">
                Status: {v.status}
              </div>
            </div>
            <div className="flex gap-2">
              {v.status === 'pending' && (
                <>
                  <button onClick={() => handleStatus(v.id, 'approved')} className="px-3 py-1.5 bg-[var(--success-bg)] text-[var(--success)] rounded flex items-center gap-1 hover:bg-green-900 border border-[var(--success)]"><Check className="w-4 h-4"/> Approve</button>
                  <button onClick={() => handleStatus(v.id, 'rejected')} className="px-3 py-1.5 bg-[var(--danger-bg)] text-[var(--danger)] rounded flex items-center gap-1 hover:bg-red-900 border border-[var(--danger)]"><X className="w-4 h-4"/> Reject</button>
                </>
              )}
              {v.status === 'approved' && (
                <button onClick={() => handleStatus(v.id, 'checked_in')} className="px-3 py-1.5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded flex items-center gap-1 border border-[var(--primary)]"><LogIn className="w-4 h-4"/> Check-in</button>
              )}
              {v.status === 'checked_in' && (
                <button onClick={() => handleStatus(v.id, 'checked_out')} className="px-3 py-1.5 bg-[var(--bg-input)] text-[var(--text-primary)] rounded flex items-center gap-1 border border-[var(--border)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"><LogOut className="w-4 h-4"/> Check-out</button>
              )}
            </div>
          </div>
        ))}
        {visitors.length === 0 && (
          <div className="text-center p-8 text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-[var(--radius-lg,12px)] border border-[var(--border)]">
            No visitors found.
          </div>
        )}
      </div>
    </div>
  );
}
