'use client';
import { useState, useEffect } from 'react';
import { ownerRequestsApi, OwnerRequest } from '@/app/superadmin/lib/api/ownerRequests';
import { Search, MoreVertical, CheckCircle, XCircle, PauseCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/lib/ui/ConfirmDialog';
import { useToast } from '@/lib/ui/ToastContext';
import { StatusBadge } from '@/config/statusBadgeConfig';

export default function OwnerRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [holdModalOpen, setHoldModalOpen] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    setRequests(ownerRequestsApi.list());
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleHold = () => {
    ownerRequestsApi.updateStatus(selectedReqId, 'Hold');
    setHoldModalOpen(false);
    showToast('Request marked as Hold.', 'info');
    loadRequests();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!rejectReason.trim()) return;
    ownerRequestsApi.updateStatus(selectedReqId, 'Rejected', rejectReason);
    setRejectModalOpen(false);
    setRejectReason('');
    showToast('Request rejected successfully.', 'success');
    loadRequests();
  };

  const filtered = requests.filter(r => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || 
             r.businessName.toLowerCase().includes(q) || 
             r.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Owner Requests</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage incoming inquiries for new PGs.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--bg-card)] rounded-t-[var(--radius-lg,12px)]">
          <div className="flex gap-2">
            {['All', 'Pending', 'Hold', 'Approved', 'Rejected'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === f ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search by name, business, email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--primary-subtle)] text-[var(--text-secondary)] uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Scale</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">Loading requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No requests found</h3>
                    <p className="text-[var(--text-secondary)] text-sm">We couldn't find any owner requests matching your criteria.</p>
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="h-12 even:bg-black/5 dark:even:bg-white/[0.02] hover:bg-[var(--primary-subtle)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">{r.name}</div>
                    <div className="text-[11px] text-[var(--text-disabled)] mt-0.5 truncate max-w-[200px]">{r.email} • {r.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    <div className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">{r.businessName}</div>
                    <div className="text-xs truncate max-w-[150px]">{r.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{r.pgCount} PGs</div>
                    <div className="text-xs text-[var(--text-secondary)]">{r.bedCount} Beds expected</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[var(--text-secondary)] text-right">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="transition-opacity">
                      {r.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => router.push(`/superadmin/create-owner?requestId=${r.id}`)} className="p-1.5 text-[var(--success)] hover:bg-[var(--success-bg)] rounded-[var(--radius-md,8px)] transition-colors" title="Approve & Create Owner">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => {setSelectedReqId(r.id); setHoldModalOpen(true)}} className="p-1.5 text-[var(--warning)] hover:bg-[var(--warning-bg)] rounded-[var(--radius-md,8px)] transition-colors" title="Put on Hold">
                            <PauseCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => {setSelectedReqId(r.id); setRejectModalOpen(true)}} className="p-1.5 text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-[var(--radius-md,8px)] transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Reject Request</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Provide a reason for rejecting this owner request. This will be recorded.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea 
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-md p-3 text-[var(--text-primary)] text-sm mb-4 focus:outline-none focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)]"
                rows={3}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-[var(--danger)] text-white hover:opacity-90 transition-opacity rounded-md">Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={holdModalOpen}
        title="Hold Request"
        message="Are you sure you want to put this request on hold? You can process it later."
        confirmText="Yes, put on hold"
        onConfirm={handleHold}
        onCancel={() => setHoldModalOpen(false)}
      />
    </div>
  );
}
