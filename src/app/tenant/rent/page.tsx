'use client';

import { useState, useEffect } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { useTenantContext } from '@/components/tenant/TenantContext';
import { getSession } from '@/lib/auth/session';
import { IndianRupee, CheckCircle, Download, FileText, Printer } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils/formatters';
import { useToast } from '@/lib/ui/ToastContext';

export default function TenantRentPage() {
  const { profile } = useTenantContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState<any>(null);
  const { showToast } = useToast();

  const loadData = () => {
    if (profile) {
      setInvoices(tenantOperationsApi.getInvoices(profile.userId || profile.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handlePay = () => {
    if (!session || !profile || !showPayModal) return;
    tenantOperationsApi.payInvoice(showPayModal.id, profile.id, showPayModal.amount, session.id);
    showToast('Payment successful! (Mock) +10 PG Score', 'success');
    setShowPayModal(null);
    loadData();
    window.location.reload(); // Refresh to update global profile context dues
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  // Sort pending so earliest due is first
  const pending = invoices.filter(i => i.status !== 'Paid').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  // Sort history so latest paid is first
  const history = invoices.filter(i => i.status === 'Paid').sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      <div className="print:hidden">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Rent & Dues Schedule</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your monthly rent payments for your stay.</p>
        
        {profile.stayStartDate && profile.stayEndDate && (
          <div className="mt-4 p-4 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-lg flex gap-4 text-sm font-medium text-[var(--primary)]">
            <div><span className="opacity-70">Stay Starts:</span> {new Date(profile.stayStartDate).toLocaleDateString()}</div>
            <div><span className="opacity-70">Stay Ends:</span> {new Date(profile.stayEndDate).toLocaleDateString()}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div className="bg-gradient-to-br from-[var(--danger-bg)] to-[var(--bg-card)] border border-[var(--danger)]/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee className="w-24 h-24 text-[var(--danger)]" />
          </div>
          <div className="text-[var(--danger)] font-bold text-sm uppercase tracking-wider mb-2">Total Pending</div>
          <div className="text-4xl font-black text-[var(--danger)]">{formatINR(pending.reduce((a,b) => a + b.amount, 0))}</div>
          <div className="text-sm font-medium text-[var(--text-secondary)] mt-2">Across {pending.length} invoices</div>
        </div>
        <div className="bg-gradient-to-br from-[var(--success-bg)] to-[var(--bg-card)] border border-[var(--success)]/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-24 h-24 text-[var(--success)]" />
          </div>
          <div className="text-[var(--success)] font-bold text-sm uppercase tracking-wider mb-2">Total Paid</div>
          <div className="text-4xl font-black text-[var(--success)]">{formatINR(history.reduce((a,b) => a + b.amount, 0))}</div>
          <div className="text-sm font-medium text-[var(--text-secondary)] mt-2">Across {history.length} invoices</div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 print:hidden shadow-sm">
        <h2 className="font-bold text-xl text-[var(--text-primary)] mb-6">Pending Invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map(i => {
            const dueTime = new Date(i.dueDate).getTime();
            const nowTime = new Date().getTime();
            const diffDays = (dueTime - nowTime) / (1000 * 3600 * 24);
            const isDueSoon = diffDays <= 3;

            return (
            <div key={i.id} className={`p-5 bg-[var(--bg-page)] border ${isDueSoon ? 'border-[var(--danger)]/20 hover:border-[var(--danger)]/50' : 'border-[var(--border)] hover:border-[var(--primary)]/50'} rounded-xl flex flex-col justify-between gap-4 hover:shadow-md transition-all group`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">{i.description || 'Monthly Rent'}</div>
                  <div className={`px-2 py-1 text-xs font-bold rounded ${isDueSoon ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>
                    {isDueSoon ? 'DUE' : 'PENDING'}
                  </div>
                </div>
                <div className="font-black text-[var(--text-primary)] text-3xl mb-1">{formatINR(i.amount)}</div>
                <div className={`text-xs font-medium ${isDueSoon ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}`}>
                  Due by: {formatDateOnly(i.dueDate)}
                </div>
              </div>
              <button onClick={() => setShowPayModal(i)} className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-bold shadow-md shadow-[var(--primary-subtle)] hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 transition-all">
                Pay Now &rarr;
              </button>
            </div>
          )})}
          {pending.length === 0 && (
            <div className="col-span-full p-8 text-center bg-[var(--success-bg)] border border-[var(--success)]/20 rounded-xl">
              <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-3" />
              <p className="text-lg text-[var(--success)] font-bold">All caught up!</p>
              <p className="text-sm text-[var(--success)]/80 mt-1">You have no pending dues.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 print:border-none print:shadow-none print:p-0 shadow-sm">
        <div className="hidden print:block text-center border-b border-[var(--border)] pb-4 mb-4">
          <h2 className="text-2xl font-bold mb-1 text-[var(--text-primary)]">PAYMENT RECEIPT</h2>
          <p className="text-[var(--text-secondary)]">Generated for {profile.tenantId}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="font-bold text-lg text-[var(--text-primary)]">Payment History</h2>
          {history.length > 0 && (
            <button onClick={() => window.print()} className="text-sm flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] px-3 py-1.5 rounded bg-[var(--bg-input)]">
              <Printer className="w-4 h-4"/> Print All
            </button>
          )}
        </div>
        <div className="space-y-3">
          {history.map(i => (
            <div key={i.id} className="p-4 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl flex justify-between items-center print:border-b print:rounded-none print:bg-transparent hover:border-[var(--success)]/50 hover:bg-[var(--success-bg)] transition-colors group">
              <div>
                <div className="font-bold text-[var(--text-primary)]">{i.description || 'Monthly Rent'}</div>
                <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">{formatDateOnly(i.updatedAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-lg text-[var(--success)]">{formatINR(i.amount)}</div>
                <button onClick={() => window.print()} className="text-xs font-bold text-[var(--primary)] hover:text-indigo-700 flex items-center gap-1 mt-1 justify-end print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4"/> Receipt
                </button>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-[var(--text-secondary)] opacity-50 mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No past payments found.</p>
            </div>
          )}
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[var(--radius-lg,12px)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Mock Payment Gateway</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-[var(--bg-input)] rounded flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Amount to Pay</span>
                <span className="font-bold text-2xl text-[var(--text-primary)]">{formatINR(showPayModal.amount)}</span>
              </div>
              <div className="p-4 border border-[var(--success)]/20 bg-[var(--success-bg)] rounded text-sm text-[var(--success)] flex gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                Paying this invoice on time will boost your PG Score by +10 points!
              </div>
            </div>
            <div className="p-6 border-t border-[var(--border)] flex gap-3">
              <button onClick={() => setShowPayModal(null)} className="flex-1 px-4 py-2 bg-[var(--bg-input)] text-[var(--text-primary)] rounded font-medium">Cancel</button>
              <button onClick={handlePay} className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded font-bold shadow-lg shadow-[var(--primary-subtle)]">Pay {formatINR(showPayModal.amount)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
