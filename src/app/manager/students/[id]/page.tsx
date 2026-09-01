'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { studentOperationsApi } from '@/app/student/lib/api/studentOperations';
import { ArrowLeft, User, MapPin, Calendar, IndianRupee, LogOut, Utensils, Clock } from 'lucide-react';
import Link from 'next/link';
import { BillUploadModal } from '@/components/shared/BillUploadModal';
import { financeApi } from '@/app/owner/lib/api/finance';

export default function ManagerStudentDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const [student, setStudent] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  // Bill upload state
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedInvoiceForBill, setSelectedInvoiceForBill] = useState<any>(null);

  const loadData = () => {
    if (id) {
      const t = api.students.getById ? api.students.getById(id) : api.students.listByProperty('all').find((t: any) => t.profile.id === id || t.user.id === id);
      setStudent(t);
      if (t) {
        setInvoices(studentOperationsApi.getInvoices(t.user.id));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCheckout = () => {
    if (confirm('Are you sure you want to checkout this student? This will revoke their access and free their bed.')) {
      api.students.checkoutStudent(student.profile.id, user?.id || '');
      router.push('/manager/students');
    }
  };

  const handleSaveElectricityBill = (amount: number, imageUrl: string) => {
    if (selectedInvoiceForBill && user) {
      financeApi.updateElectricityBill(selectedInvoiceForBill.id, amount, imageUrl, user.id);
      loadData(); // Reload invoices
    }
  };

  if (!student) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <BillUploadModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setSelectedInvoiceForBill(null);
        }}
        onSubmit={handleSaveElectricityBill}
        invoiceTitle={selectedInvoiceForBill?.month || 'Invoice'}
      />
      <Link href="/manager/students" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] overflow-hidden shadow-sm">
        <div className="p-8 bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)] flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--primary-subtle)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] text-2xl font-bold">
            {student.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{student.user?.name || 'Unknown'}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><User className="w-4 h-4"/> ID: {student.profile.userId?.slice(0,6)}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Bed: {student.profile.bedId || '-'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Joined: {new Date(student.profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {student.profile.status !== 'checked_out' && (
            <button 
              onClick={handleCheckout}
              className="ml-auto flex items-center gap-2 bg-[var(--danger-bg)] text-[var(--danger)] px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors border border-[var(--danger)]/20"
            >
              <LogOut className="w-4 h-4" /> Checkout Student
            </button>
          )}
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Contact Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-[var(--text-secondary)]">Phone</div>
              <div className="font-medium text-[var(--text-primary)]">{student.user?.phone || '-'}</div>
              <div className="text-[var(--text-secondary)]">Email</div>
              <div className="font-medium text-[var(--text-primary)]">{student.user?.email || '-'}</div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Parent Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-[var(--text-secondary)]">Parent Name</div>
              <div className="font-medium text-[var(--text-primary)]">{student.profile.parentName || '-'}</div>
              <div className="text-[var(--text-secondary)]">Parent Phone</div>
              <div className="font-medium text-[var(--text-primary)]">{student.profile.parentPhone || '-'}</div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Financials</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-[var(--text-secondary)]">Monthly Rent</div>
              <div className="font-medium text-[var(--text-primary)] flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5"/> {student.profile.rentAmount || 0}</div>
              <div className="text-[var(--text-secondary)]">Current Dues</div>
              <div className={`font-medium flex items-center gap-1 ${student.profile.duesAmount > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                <IndianRupee className="w-3.5 h-3.5"/> {student.profile.duesAmount || 0}
              </div>
              <div className="text-[var(--text-secondary)]">Mess Facility</div>
              <div className="font-medium text-[var(--text-primary)] flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5"/> {student.profile.hasMessFacility ? 'Yes (Included)' : 'No'}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Behavior & Scoring</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-[var(--text-secondary)]">PG Score</div>
              <div className={`font-bold ${student.profile.pgScore >= 80 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{student.profile.pgScore}/100</div>
            </div>
          </div>
        </div>
        
        {/* Rent Schedule Section */}
        <div className="p-8 border-t border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            Stay Duration & Rent Schedule
          </h3>
          {student.profile.stayStartDate && student.profile.stayEndDate ? (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-6 bg-[var(--bg-input)] p-4 rounded-lg">
                <div><strong>Start Date:</strong> {new Date(student.profile.stayStartDate).toLocaleDateString()}</div>
                <div><strong>End Date:</strong> {new Date(student.profile.stayEndDate).toLocaleDateString()}</div>
                <div><strong>Duration:</strong> {Math.round((new Date(student.profile.stayEndDate).getTime() - new Date(student.profile.stayStartDate).getTime()) / (1000 * 3600 * 24 * 30))} Months</div>
              </div>
              <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-6">
                {invoices.filter(i => i.type === 'Rent' || !i.type).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((invoice: any, idx: number) => {
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
                          <span className={`font-black ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>₹{invoice.amount}</span>
                        </div>
                        {invoice.electricityBillAmount !== undefined ? (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--text-secondary)] font-medium">Electricity Bill</span>
                            <span className="font-bold text-[var(--text-primary)]">₹{invoice.electricityBillAmount}</span>
                          </div>
                        ) : null}
                        {invoice.electricityBillAmount !== undefined && (
                          <div className="flex justify-between items-center mt-2 border-t border-[var(--border)] pt-2">
                            <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
                            <span className={`font-black ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>₹{invoice.amount + invoice.electricityBillAmount}</span>
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
                )})}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-input)] p-4 rounded-lg">
              No stay duration was recorded during onboarding. Monthly rent is tracked manually.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
