'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { Search, Users, AlertCircle, Building, Filter } from 'lucide-react';
import Link from 'next/link';
import { TenantMember } from '@/lib/api/tenants';
import { formatINR } from '@/lib/utils/formatters';
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export default function OwnerTenantsPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId } = useOwnerPropertyContext();

  const [tenants, setTenants] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_notice' | 'checked_out'>('all');
  const [duesFilter, setDuesFilter] = useState<'all' | 'has_dues'>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Auto seed mocks if empty for demo purposes
    api.tenants.seedMocksIfEmpty(user.id);
    
    const data = api.tenants.listByOwner(user.id);
    setTenants(data);
    setLoading(false);
  }, [user?.id]);

  const filteredTenants = tenants.filter(t => {
    // Property match
    if (selectedPropertyId !== 'all' && t.profile.propertyId !== selectedPropertyId) return false;
    
    // Status match
    if (statusFilter !== 'all' && t.profile.status !== statusFilter) return false;

    // Dues match
    if (duesFilter === 'has_dues' && t.profile.duesAmount <= 0) return false;

    // Search
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      return t.user.name.toLowerCase().includes(sq) || t.user.phone?.includes(sq);
    }
    
    return true;
  });

  const handleGrantDiscount = (tenantProfileId: string) => {
    if (confirm('Grant 5% special discount to this tenant for next month due to high PG Score?')) {
      const profile = tenants.find(t => t.profile.id === tenantProfileId)?.profile;
      if(profile) {
        db.update(STORAGE_KEYS.TENANT_PROFILES as any, profile.id, { discountApplied: true });
        // update local state
        setTenants(tenants.map(t => t.profile.id === tenantProfileId ? { ...t, profile: { ...t.profile, discountApplied: true } } : t));
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Tenants Directory</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your tenants across all properties.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Tenants</option>
          <option value="on_notice">On Notice</option>
          <option value="checked_out">Checked Out</option>
        </select>

        <select 
          value={duesFilter}
          onChange={(e) => setDuesFilter(e.target.value as any)}
          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="all">All Balances</option>
          <option value="has_dues">Pending Dues Only</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] animate-pulse"></div>)}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <Users className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Tenants Found</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
            We couldn't find any tenants matching your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map(t => {
            const property = properties.find(p => p.id === t.profile.propertyId);
            const propName = property?.name || 'Unknown Property';

            return (
              <div key={t.user.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 hover:border-[var(--primary-subtle)] transition-colors shadow-sm flex flex-col group relative overflow-hidden">
                {t.profile.status === 'on_notice' && (
                  <div className="absolute top-0 right-0 bg-[var(--warning-bg)] text-[var(--warning)] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg border-b border-l border-[var(--warning)]">
                    On Notice
                  </div>
                )}
                {t.profile.status === 'checked_out' && (
                  <div className="absolute top-0 right-0 bg-[var(--danger-bg)] text-[var(--danger)] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg border-b border-l border-[var(--danger)]">
                    Checked Out
                  </div>
                )}

                <div className="flex items-center gap-4 mb-5 mt-2">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-lg">
                    {t.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-base truncate pr-2" title={t.user.name}>
                      {t.user.name}
                    </h3>
                    <div className="text-sm text-[var(--text-secondary)]">{t.user.phone}</div>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Building className="w-4 h-4" />
                    <span>{propName}</span>
                  </div>
                  
                  {t.profile.duesAmount > 0 ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--danger)]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Pending: {formatINR(t.profile.duesAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[var(--success)] font-medium">
                      <span>No Pending Dues</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">PG SCORE:</span>
                      <span className={`text-sm font-bold ${t.profile.pgScore > 80 ? 'text-[var(--success)]' : t.profile.pgScore < 50 ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
                        {t.profile.pgScore}/100
                      </span>
                    </div>
                    {t.profile.pgScore > 90 && !t.profile.discountApplied && (
                      <button onClick={() => handleGrantDiscount(t.profile.id)} className="text-[10px] bg-[var(--primary-subtle)] text-[var(--primary)] px-2 py-1 rounded font-bold hover:bg-[var(--primary)] hover:text-white transition-colors">
                        Give Discount
                      </button>
                    )}
                    {t.profile.discountApplied && (
                      <span className="text-[10px] bg-[var(--success-bg)] text-[var(--success)] px-2 py-1 rounded font-bold">Discounted</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] mt-5">
                  <Link 
                    href={`/owner/tenants/${t.profile.id}`} 
                    className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit"
                  >
                    View Full Profile &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
