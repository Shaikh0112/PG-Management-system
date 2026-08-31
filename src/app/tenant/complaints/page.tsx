'use client';

import { useState, useEffect } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { useTenantContext } from '@/components/tenant/TenantContext';
import { MessageSquareWarning, Plus } from 'lucide-react';
import Link from 'next/link';

export default function TenantComplaintsPage() {
  const { profile } = useTenantContext();
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setComplaints(tenantOperationsApi.getComplaints(profile.id));
    }
  }, [profile]);

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">My Complaints</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track your reported issues.</p>
        </div>
        <Link href="/tenant/complaints/new" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-bold shadow-sm flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-colors">
          <Plus className="w-4 h-4"/> New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complaints.map(c => (
          <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${
              c.status === 'Resolved' ? 'bg-[var(--success)]' :
              c.status === 'In Progress' ? 'bg-[var(--primary)]' :
              'bg-[var(--danger)]'
            }`}></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <h3 className="font-bold text-[var(--text-primary)] text-lg capitalize">{c.title || c.category}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${
                c.status === 'Resolved' ? 'bg-[var(--success-bg)] border border-[var(--success)]/20 text-[var(--success)]' :
                c.status === 'In Progress' ? 'bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)]' :
                'bg-[var(--danger-bg)] border border-[var(--danger)]/20 text-[var(--danger)]'
              }`}>
                {c.status}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5 relative z-10 line-clamp-2">{c.description}</p>
            <div className="flex gap-2 relative z-10">
              <span className="text-xs bg-[var(--bg-page)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] font-bold flex items-center gap-1 shadow-sm">
                Priority: {c.priority || 'Medium'}
              </span>
              <span className="text-xs bg-[var(--bg-page)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] font-bold shadow-sm">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)]">
            <MessageSquareWarning className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-20" />
            <div className="text-[var(--text-primary)] font-bold">No complaints raised</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">Everything seems fine!</div>
          </div>
        )}
      </div>
    </div>
  );
}
