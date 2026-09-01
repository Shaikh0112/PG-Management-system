'use client';

import { useState, useEffect } from 'react';
import { studentOperationsApi } from '@/app/student/lib/api/studentOperations';
import { useStudentContext } from '@/app/student/components/StudentContext';
import { getSession } from '@/lib/auth/session';
import { IndianRupee, CheckCircle, Download, FileText, Printer, Clock } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils/formatters';
import { useToast } from '@/lib/ui/ToastContext';
import { Pagination } from '@/components/shared/Pagination';

export default function StudentRentPage() {
  const { profile } = useStudentContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { showToast } = useToast();

  const loadData = () => {
    if (profile) {
      setInvoices(studentOperationsApi.getInvoices(profile.userId || profile.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handlePay = () => {
    if (!session || !profile || !showPayModal) return;
    studentOperationsApi.payInvoice(showPayModal.id, profile.id, showPayModal.amount, session.id);
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
  
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <div className="text-4xl font-black text-[var(--danger)]">{formatINR(pending.reduce((a,b) => a + (b.amount + (b.electricityBillAmount || 0)), 0))}</div>
          <div className="text-sm font-medium text-[var(--text-secondary)] mt-2">Across {pending.length} invoices</div>
        </div>
        <div className="bg-gradient-to-br from-[var(--success-bg)] to-[var(--bg-card)] border border-[var(--success)]/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-24 h-24 text-[var(--success)]" />
          </div>
          <div className="text-[var(--success)] font-bold text-sm uppercase tracking-wider mb-2">Total Paid</div>
          <div className="text-4xl font-black text-[var(--success)]">{formatINR(history.reduce((a,b) => a + (b.amount + (b.electricityBillAmount || 0)), 0))}</div>
          <div className="text-sm font-medium text-[var(--text-secondary)] mt-2">Across {history.length} invoices</div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm overflow-hidden print:hidden">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--primary)]" />
          Rent Schedule & Payment History
        </h3>
        {invoices.length > 0 ? (
          <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-6">
            {invoices.filter(i => i.type === 'Rent' || !i.type).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map((invoice: any) => {
              const dueTime = new Date(invoice.dueDate).getTime();
              const nowTime = new Date().getTime();
              const diffDays = (dueTime - nowTime) / (1000 * 3600 * 24);
              const isDueSoon = diffDays <= 3;
              const showAsDue = invoice.status === 'Pending' && isDueSoon;
              const displayStatus = invoice.status === 'Paid' ? 'Paid' : (showAsDue ? 'DUE' : 'PENDING');

              return (
                <div key={invoice.id} className="relative pl-6">
                  <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ${invoice.status === 'Paid' ? 'bg-[var(--success)]' : (showAsDue ? 'bg-[var(--danger)]' : 'bg-[var(--warning)] border-2 border-[var(--bg-card)]')}`}></div>
                  <div className={`bg-[var(--bg-input)] p-4 rounded-lg border ${showAsDue ? 'border-[var(--danger)]/50 shadow-sm' : 'border-[var(--border)]'} hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-bold ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>{invoice.title || invoice.description || 'Monthly Rent'}</h4>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${invoice.status === 'Paid' ? 'bg-[var(--success-bg)] text-[var(--success)]' : (showAsDue ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]')}`}>
                          {displayStatus}
                        </div>
                      </div>
                      <p className={`text-xs ${showAsDue ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-secondary)]'}`}>Due: {new Date(invoice.dueDate).toLocaleDateString()} | Updated: {new Date(invoice.updatedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1 md:items-end">
                      <div className={`font-black text-xl ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                        ₹{(invoice.amount + (invoice.electricityBillAmount || 0)).toLocaleString()}
                      </div>
                      {invoice.electricityBillAmount !== undefined && (
                        <div className="text-xs text-[var(--text-secondary)] font-medium">
                          Rent: ₹{invoice.amount.toLocaleString()} + EB: ₹{invoice.electricityBillAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      {invoice.status === 'Pending' && (
                        <button onClick={() => setShowPayModal(invoice)} className="px-4 py-2 bg-[var(--primary)] text-white rounded font-bold shadow-md shadow-[var(--primary-subtle)] hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap">
                          Pay Now &rarr;
                        </button>
                      )}
                      {invoice.status === 'Paid' && (
                        <button onClick={() => window.print()} className="px-3 py-2 bg-[var(--bg-card)] text-[var(--primary)] border border-[var(--border)] rounded font-medium hover:bg-[var(--bg-page)] transition-colors text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Download className="w-4 h-4"/> Receipt
                        </button>
                      )}
                      {invoice.electricityBillImage && (
                        <a
                          href={invoice.electricityBillImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border)] rounded font-medium hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-1"
                        >
                          View Bill
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-input)] p-4 rounded-lg">
            No invoices found for your stay.
          </div>
        )}
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
                <span className="font-bold text-2xl text-[var(--text-primary)]">{formatINR(showPayModal.amount + (showPayModal.electricityBillAmount || 0))}</span>
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
