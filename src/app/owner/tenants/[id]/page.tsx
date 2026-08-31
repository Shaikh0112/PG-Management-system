'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { ArrowLeft, User, Phone, Mail, Building, CreditCard, Activity, CheckCircle, ShieldAlert, LogOut } from 'lucide-react';
import Link from 'next/link';
import { TenantMember } from '@/lib/api/tenants';

export default function TenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties } = useOwnerPropertyContext();

  const [tenant, setTenant] = useState<TenantMember | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!user || !id) return;
    setLoading(true);
    const data = api.tenants.getById(id);
    if (!data) {
      router.replace('/owner/tenants');
      return;
    }
    
    // Safety check: is owner of this property?
    const prop = api.properties.getById(data.profile.propertyId);
    if (prop?.ownerId !== user.id) {
      router.replace('/owner/tenants');
      return;
    }

    setTenant(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id, router]);

  const handleMarkNotice = () => {
    if (!user || !tenant) return;
    if (confirm(`Mark ${tenant.user.name} on notice?`)) {
      api.tenants.markNotice(tenant.profile.id, user.id);
      loadData();
    }
  };

  const handleCheckout = () => {
    if (!user || !tenant) return;
    if (confirm(`Are you sure you want to completely checkout ${tenant.user.name}? This will free their bed.`)) {
      api.tenants.checkout(tenant.profile.id, user.id);
      loadData();
    }
  };

  if (loading || !tenant) return <div className="p-6 animate-pulse">Loading profile...</div>;

  const propertyName = properties.find(p => p.id === tenant.profile.propertyId)?.name || 'Unknown Property';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/owner/tenants" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-3">
            {tenant.user.name}
            {tenant.profile.status === 'on_notice' && (
              <span className="text-[10px] uppercase bg-[var(--warning-bg)] text-[var(--warning)] px-2 py-1 rounded-md tracking-wider border border-[var(--warning)]">
                On Notice
              </span>
            )}
            {tenant.profile.status === 'checked_out' && (
              <span className="text-[10px] uppercase bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1 rounded-md tracking-wider border border-[var(--danger)]">
                Checked Out
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Tenant Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-3xl mb-4">
                {tenant.user.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{tenant.user.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{propertyName}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>{tenant.user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="truncate">{tenant.user.email}</span>
              </div>
              <div className="flex flex-col gap-1 pt-3">
                <span className="text-xs text-[var(--text-secondary)]">Parent / Guardian</span>
                <div className="text-sm font-medium">{tenant.profile.parentName || 'Not provided'}</div>
                <div className="text-sm text-[var(--text-secondary)]">{tenant.profile.parentPhone}</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Owner Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              {tenant.profile.status === 'active' && (
                <button onClick={handleMarkNotice} className="w-full py-2.5 bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-orange-900 transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Mark on Notice
                </button>
              )}
              
              {tenant.profile.status !== 'checked_out' && (
                <button onClick={handleCheckout} className="w-full py-2.5 bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Complete Checkout
                </button>
              )}

              {tenant.profile.status === 'checked_out' && (
                <div className="text-sm text-[var(--text-secondary)] text-center py-2">
                  This tenant has completely checked out.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Pending Dues</div>
              <div className={`text-2xl font-bold ${tenant.profile.duesAmount > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                ₹{tenant.profile.duesAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Monthly Rent</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ₹{tenant.profile.rentAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 relative overflow-hidden">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1 relative z-10">PG Score</div>
              <div className="text-2xl font-bold text-[var(--primary)] relative z-10">
                {tenant.profile.pgScore} / 100
              </div>
              <Activity className="absolute -bottom-4 -right-4 w-20 h-20 text-[var(--primary)] opacity-10" />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Invoices (Mock)</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs uppercase border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Month</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {/* Mock rows since we don't have real invoice generation pipeline yet */}
                  <tr>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Aug 2026</td>
                    <td className="px-6 py-4">₹8,500</td>
                    <td className="px-6 py-4">
                      {tenant.profile.duesAmount > 0 
                        ? <span className="text-[var(--danger)] bg-[var(--danger-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--danger)]">Unpaid</span>
                        : <span className="text-[var(--success)] bg-[var(--success-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--success)]">Paid</span>
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Jul 2026</td>
                    <td className="px-6 py-4">₹8,500</td>
                    <td className="px-6 py-4">
                      <span className="text-[var(--success)] bg-[var(--success-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--success)]">Paid</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
