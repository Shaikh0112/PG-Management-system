'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { studentOperationsApi } from '@/lib/api/studentOperations';
import { ArrowLeft, User, MapPin, Calendar, IndianRupee, LogOut, Utensils, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ManagerStudentDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const [student, setStudent] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const t = api.students.getById ? api.students.getById(id) : api.students.listByProperty('all').find((t: any) => t.profile.id === id || t.user.id === id);
      setStudent(t);
      if (t) {
        setInvoices(studentOperationsApi.getInvoices(t.user.id));
      }
    }
  }, [id]);

  const handleCheckout = () => {
    if (confirm('Are you sure you want to checkout this student? This will revoke their access and free their bed.')) {
      api.students.checkoutStudent(student.profile.id, user?.id || '');
      router.push('/manager/students');
    }
  };

  if (!student) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
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
              </div>
              <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-6">
                {invoices.filter(i => i.type === 'Rent').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((invoice: any, idx: number) => {
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
                          <h4 className={`font-bold ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>{invoice.description}</h4>
                          <p className={`text-xs ${showAsDue ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-secondary)]'}`}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${invoice.status === 'Paid' ? 'bg-[var(--success-bg)] text-[var(--success)]' : (showAsDue ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]')}`}>
                          {displayStatus}
                        </div>
                      </div>
                      <div className={`font-black ${showAsDue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>₹{invoice.amount}</div>
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
