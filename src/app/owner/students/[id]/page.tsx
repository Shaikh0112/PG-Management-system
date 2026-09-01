'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { ArrowLeft, User, Phone, Mail, Building, CreditCard, Activity, CheckCircle, ShieldAlert, LogOut, Clock } from 'lucide-react';
import Link from 'next/link';
import { studentOperationsApi } from '@/app/student/lib/api/studentOperations';
import { BillUploadModal } from '@/components/shared/BillUploadModal';
import { financeApi } from '@/app/owner/lib/api/finance';

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties } = useOwnerPropertyContext();

  const [student, setStudent] = useState<StudentMember | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill upload state
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedInvoiceForBill, setSelectedInvoiceForBill] = useState<any>(null);

  const loadData = () => {
    if (!user || !id) return;
    setLoading(true);
    const data = api.students.getById(id);
    if (!data) {
      router.replace('/owner/students');
      return;
    }
    
    // Safety check: is owner of this property?
    const prop = api.properties.getById(data.profile.propertyId);
    if (prop?.ownerId !== user.id) {
      router.replace('/owner/students');
      return;
    }

    setStudent(data);
    setInvoices(studentOperationsApi.getInvoices(data.user.id));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id, router]);

  const handleMarkNotice = () => {
    if (!user || !student) return;
    if (confirm(`Mark ${student.user.name} on notice?`)) {
      api.students.markNotice(student.profile.id, user.id);
      loadData();
    }
  };

  const handleCheckout = () => {
    if (!user || !student) return;
    if (confirm(`Are you sure you want to completely checkout ${student.user.name}? This will free their bed.`)) {
      api.students.checkout(student.profile.id, user.id);
      loadData();
    }
  };

  const handleSaveElectricityBill = (amount: number, imageUrl: string) => {
    if (selectedInvoiceForBill && user) {
      financeApi.updateElectricityBill(selectedInvoiceForBill.id, amount, imageUrl, user.id);
      loadData(); // Reload invoices
    }
  };

  if (loading || !student) return <div className="p-6 animate-pulse">Loading profile...</div>;

  const propertyName = properties.find(p => p.id === student.profile.propertyId)?.name || 'Unknown Property';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <BillUploadModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setSelectedInvoiceForBill(null);
        }}
        onSubmit={handleSaveElectricityBill}
        invoiceTitle={selectedInvoiceForBill?.month || 'Invoice'}
      />
      <div className="flex items-center gap-4 mb-2">
        <Link href="/owner/students" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-3">
            {student.user.name}
            {student.profile.status === 'on_notice' && (
              <span className="text-[10px] uppercase bg-[var(--warning-bg)] text-[var(--warning)] px-2 py-1 rounded-md tracking-wider border border-[var(--warning)]">
                On Notice
              </span>
            )}
            {student.profile.status === 'checked_out' && (
              <span className="text-[10px] uppercase bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1 rounded-md tracking-wider border border-[var(--danger)]">
                Checked Out
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Student Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-3xl mb-4">
                {student.user.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{student.user.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{propertyName}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>{student.user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="truncate">{student.user.email}</span>
              </div>
              <div className="flex flex-col gap-1 pt-3">
                <span className="text-xs text-[var(--text-secondary)]">Parent / Guardian</span>
                <div className="text-sm font-medium">{student.profile.parentName || 'Not provided'}</div>
                <div className="text-sm text-[var(--text-secondary)]">{student.profile.parentPhone}</div>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] pt-3 border-t border-[var(--border)]">
                <span className="text-[var(--text-secondary)] font-medium">Stay Duration:</span>
                <span className="font-bold">
                  {student.profile.stayStartDate && student.profile.stayEndDate ? 
                    `${Math.round((new Date(student.profile.stayEndDate).getTime() - new Date(student.profile.stayStartDate).getTime()) / (1000 * 3600 * 24 * 30))} Months` 
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Owner Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              {student.profile.status === 'active' && (
                <button onClick={handleMarkNotice} className="w-full py-2.5 bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-orange-900 transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Mark on Notice
                </button>
              )}
              
              {student.profile.status !== 'checked_out' && (
                <button onClick={handleCheckout} className="w-full py-2.5 bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Complete Checkout
                </button>
              )}

              {student.profile.status === 'checked_out' && (
                <div className="text-sm text-[var(--text-secondary)] text-center py-2">
                  This student has completely checked out.
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
              <div className={`text-2xl font-bold ${student.profile.duesAmount > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                ₹{student.profile.duesAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Monthly Rent</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ₹{student.profile.rentAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 relative overflow-hidden">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1 relative z-10">PG Score</div>
              <div className="text-2xl font-bold text-[var(--primary)] relative z-10">
                {student.profile.pgScore} / 100
              </div>
              <Activity className="absolute -bottom-4 -right-4 w-20 h-20 text-[var(--primary)] opacity-10" />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 overflow-hidden">
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
                      <div className={`bg-[var(--bg-input)] p-4 rounded-lg border ${showAsDue ? 'border-[var(--danger)]/50 shadow-sm' : 'border-[var(--border)]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className={`font-bold ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>{invoice.title || invoice.description || 'Monthly Rent'}</h4>
                            <p className={`text-xs ${showAsDue ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-secondary)]'}`}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div className={`text-xs font-bold px-2 py-1 rounded ${invoice.status === 'Paid' ? 'bg-[var(--success-bg)] text-[var(--success)]' : (showAsDue ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]')}`}>
                            {displayStatus}
                          </div>
                        </div>
                      
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)] font-medium">Rent</span>
                          <span className={`font-black ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>₹{invoice.amount.toLocaleString()}</span>
                        </div>
                        {invoice.electricityBillAmount !== undefined ? (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text-secondary)] font-medium">Electricity Bill</span>
                            <span className="font-bold text-[var(--text-primary)]">₹{invoice.electricityBillAmount.toLocaleString()}</span>
                          </div>
                        ) : null}
                        {invoice.electricityBillAmount !== undefined && (
                          <div className="flex justify-between items-center mt-2 border-t border-[var(--border)] pt-2">
                            <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
                            <span className={`font-black ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>₹{(invoice.amount + invoice.electricityBillAmount).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        {!invoice.electricityBillAmount && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForBill(invoice);
                              setIsBillModalOpen(true);
                            }}
                            className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-subtle)] hover:bg-[var(--primary)] hover:text-white transition-colors px-3 py-1.5 rounded"
                          >
                            Add Electricity Bill
                          </button>
                        )}
                        {invoice.electricityBillImage && (
                          <a
                            href={invoice.electricityBillImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded inline-flex items-center gap-1"
                          >
                            View Bill Receipt
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
                No invoices found for this student.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
