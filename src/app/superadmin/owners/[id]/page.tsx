'use client';
import { useState, useEffect } from 'react';
import { ownersApi } from '@/app/owner/lib/api/owners';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Key, Power, AlertTriangle, Building2, Ticket, Users, FileText, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function Owner360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [resetModal, setResetModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      setData(ownersApi.getOwner360(id));
    } catch (e) {
      router.push('/superadmin/owners');
    }
    setLoading(false);
  }, [id, router]);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPass) return;
    ownersApi.resetPassword(id, newPass);
    setResetModal(false);
    setNewPass('');
    alert('Password reset successfully and audit log created.');
  };

  const handleToggleStatus = () => {
    if (!data || !data.user) return;
    const newStatus = data.user.status === 'Active' ? 'Suspended' : 'Active';
    if(confirm(`Are you sure you want to ${newStatus === 'Suspended' ? 'suspend' : 'activate'} this owner?`)) {
      ownersApi.updateStatus(id, newStatus);
      setData(ownersApi.getOwner360(id)); // refresh
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if(!note) return;
    ownersApi.addInternalNote(id, note);
    setNote('');
    alert('Internal note added to audit logs.');
  };

  if (loading || !data) return <div className="animate-pulse p-6">Loading 360 view...</div>;

  const { owner, user, subscription, properties, recentPayments, tickets } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
        <Link href="/superadmin/owners" className="p-2 hover:bg-[var(--bg-card)] rounded-[var(--radius-md,8px)] transition-colors border border-transparent hover:border-[var(--border)]">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">{owner.businessName}</h1>
          <p className="text-[var(--text-secondary)] text-sm">{owner.name} • {owner.city} • Joined {new Date(owner.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <span className={`px-3 py-1 rounded-[var(--radius-full,999px)] text-[11px] font-semibold border ${
            user?.status === 'Active' ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]'
          }`}>
            {(user?.status || 'UNKNOWN').toUpperCase()}
          </span>
          <span className="px-3 py-1 bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)] rounded-[var(--radius-full,999px)] text-[11px] font-semibold capitalize">
            {subscription?.planId || 'No Plan'} Plan
          </span>
        </div>
      </div>

      <div className="bg-[var(--warning-bg)] border border-[var(--warning)] p-4 rounded-[var(--radius-lg,12px)] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">CRITICAL: SuperAdmin does NOT create properties here.</div>
          <div className="text-[var(--text-secondary)] text-xs mt-1">PGs owner khud create karega apni dashboard se. You can only monitor their usage and manage their account.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Actions & Contact */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Contact Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-secondary)]">Email</span>
                <span className="text-[var(--text-primary)] font-medium">{owner.email}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[var(--text-secondary)]">Phone</span>
                <span className="text-[var(--text-primary)] font-medium">{owner.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Address</span>
                <span className="text-[var(--text-primary)] font-medium text-right max-w-[150px] truncate">{owner.address || '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Administrative Actions</h2>
            <div className="space-y-3">
              <button onClick={() => setResetModal(true)} className="w-full flex items-center gap-2 p-3 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-page)] hover:bg-[var(--border)] border border-[var(--border)] rounded-[var(--radius-md,8px)] transition-colors">
                <Key className="w-4 h-4 text-[var(--info)]" /> Reset Password
              </button>
              <button onClick={handleToggleStatus} className={`w-full flex items-center gap-2 p-3 text-sm font-medium border rounded-[var(--radius-md,8px)] transition-colors ${
                user?.status === 'Active' ? 'text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)] hover:opacity-80' : 'text-[var(--success)] bg-[var(--success-bg)] border-[var(--success)] hover:opacity-80'
              }`}>
                <Power className="w-4 h-4" /> {user?.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Internal Notes</h2>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea 
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                rows={3} placeholder="Add a note (saved to audit logs)..."
                value={note} onChange={e=>setNote(e.target.value)} required
              />
              <button type="submit" className="w-full py-2 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-[var(--radius-md,8px)] text-sm hover:bg-[var(--border)] transition-colors">Save Note</button>
            </form>
          </div>
        </div>

        {/* Right Col: Usage & Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Plan Usage */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm text-center">
              <div className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Properties</div>
              <div className="text-[28px] font-bold text-[var(--text-primary)]">{properties.length} <span className="text-lg text-[var(--text-disabled)]">/ {subscription?.maxProperties}</span></div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm text-center">
              <div className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Students</div>
              <div className="text-[28px] font-bold text-[var(--text-primary)]">{data.studentsCount} <span className="text-lg text-[var(--text-disabled)]">/ {subscription?.maxBeds}</span></div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm text-center">
              <div className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Staff/Managers</div>
              <div className="text-[28px] font-bold text-[var(--text-primary)]">{data.managersCount} <span className="text-lg text-[var(--text-disabled)]">/ {subscription?.maxStaff}</span></div>
            </div>
          </div>

          {/* Properties List */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm overflow-hidden">
            <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="font-semibold text-[var(--text-primary)] text-[14px]">Owner's PGs</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {properties.map((p: any) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[rgba(99,102,241,0.03)] transition-colors">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{p.name}</div>
                    <div className="text-[12px] text-[var(--text-secondary)]">{p.city} • {p.managers} Staff</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--text-primary)]">{p.occupied} / {p.capacity}</div>
                    <div className="text-[11px] text-[var(--success)]">Occupied</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm overflow-hidden">
              <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--success)]" />
                <h2 className="font-semibold text-[var(--text-primary)] text-[14px]">Platform Payments</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {recentPayments.map((p: any) => (
                  <div key={p.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] text-[var(--text-secondary)]">{new Date(p.date).toLocaleDateString()}</div>
                      <div className="text-[11px] font-medium text-[var(--text-primary)]">{p.mode}</div>
                    </div>
                    <div className="font-medium text-[var(--success)]">₹{p.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm overflow-hidden">
              <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[var(--danger)]" />
                <h2 className="font-semibold text-[var(--text-primary)] text-[14px]">Support Tickets</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {tickets.map((t: any) => (
                  <div key={t.id} className="p-4 flex flex-col gap-1">
                    <div className="font-medium text-[var(--text-primary)] text-sm line-clamp-1">{t.issue}</div>
                    <div>
                      {t.status === 'Resolved' ? <span className="text-[10px] bg-[var(--success-bg)] text-[var(--success)] px-2 py-0.5 rounded-full font-bold">RESOLVED</span> : <span className="text-[10px] bg-[var(--warning-bg)] text-[var(--warning)] px-2 py-0.5 rounded-full font-bold">OPEN</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] p-7 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Reset Password</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Set a temporary password. The owner will be forced to change it on their next login.</p>
            <form onSubmit={handleResetPassword}>
              <input 
                type="text" 
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-3 text-[var(--text-primary)] text-sm mb-4 focus:outline-none focus:border-[var(--primary)] font-mono"
                placeholder="New Temporary Password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                required
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setResetModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-md">Confirm Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}