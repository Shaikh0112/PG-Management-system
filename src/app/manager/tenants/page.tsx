'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/components/manager/ManagerPropertyContext';
import { Users, Lock, ChevronRight, IndianRupee, Plus } from 'lucide-react';
import Link from 'next/link';
import { AddTenantModal } from '@/components/manager/AddTenantModal';

export default function ManagerTenantsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [tenants, setTenants] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTenants = () => {
    if (!ctxLoading && selectedPropertyId) {
      const data = api.tenants.listByProperty(selectedPropertyId);
      setTenants(data);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [selectedPropertyId, ctxLoading]);

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Tenants</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage active tenants.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md,8px)] hover:bg-[var(--primary-hover)] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)] text-[var(--text-secondary)]">
            <tr>
              <th className="p-4 font-medium">Tenant</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Payment Status</th>
              <th className="p-4 font-medium">Score</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {tenants.map(t => (
              <tr key={t.profile.id} className="hover:bg-[var(--bg-input)] transition-colors">
                <td className="p-4">
                  <div className="font-medium text-[var(--text-primary)]">{t.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-[var(--text-secondary)]">ID: {t.profile.id.slice(-6)}</div>
                </td>
                <td className="p-4">
                  <div className="text-[var(--text-primary)]">{t.user?.phone || '-'}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate max-w-[150px]">{t.user?.email || '-'}</div>
                </td>
                <td className="p-4">
                  {t.profile.duesAmount > 0 ? (
                    <div className="inline-flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[rgba(239,68,68,0.1)] text-[var(--danger)] border border-[rgba(239,68,68,0.2)] uppercase tracking-wider">
                        Pending
                      </span>
                      <span className="text-[var(--danger)] font-bold flex items-center text-sm">
                        <IndianRupee className="w-3.5 h-3.5"/> {t.profile.duesAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1.5 rounded-full text-xs font-black bg-[rgba(16,185,129,0.1)] text-[var(--success)] border border-[rgba(16,185,129,0.2)] uppercase tracking-wider flex items-center gap-1 w-fit">
                      Paid
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${t.profile.pgScore >= 80 ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>
                    {t.profile.pgScore}/100
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/manager/tenants/${t.profile.id}`} className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs font-medium">
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">No tenants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && selectedPropertyId && (
        <AddTenantModal
          propertyId={selectedPropertyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTenants();
          }}
        />
      )}
    </div>
  );
}
