'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { IndianRupee, CheckCircle, Receipt, Bell, User as UserIcon, Calendar, PieChart } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { Invoice } from '@/app/owner/lib/api/finance';
import { Pagination } from '@/components/shared/Pagination';

export default function ManagerFinancePage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [invoices, setInvoices] = useState<(Invoice & { studentName?: string; roomBed?: string })[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const user = typeof window !== 'undefined' ? getSession() : null;

  const loadData = () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    
    // Auto seed invoices for current month
    api.finance.seedMonthlyInvoices(selectedPropertyId);
    
    const allInvoices = api.finance.listInvoices(selectedPropertyId);
    const students = api.students.listByProperty(selectedPropertyId) || []; // Assume we have listStudents or get from db
    
    // Map student names
    const enrichedInvoices = allInvoices.map(inv => {
      const studentData = students.find(t => t.profile.id === inv.studentId);
      return {
        ...inv,
        studentName: studentData?.user?.name || 'Unknown',
        roomBed: 'Unknown'
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setInvoices(enrichedInvoices);
    
    // Also load stats from dashboard api for summary cards
    const dashStats = api.managerDashboard.getStats(selectedPropertyId);
    setStats(dashStats?.rentStats);
    setLoading(false);
  };

  useEffect(() => {
    if (!ctxLoading) loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleMarkPaid = (invId: string) => {
    if (!user) return;
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return;
    api.finance.recordCashPayment({ propertyId: inv.propertyId, studentId: inv.studentId, amount: inv.amount, method: 'cash' }, user.id, inv.id);
    loadData();
  };

  const handleSendReminder = (studentName: string) => {
    alert(`Rent reminder sent to ${studentName}!`);
  };

  if (ctxLoading || loading) return <div className="p-6 text-[var(--text-secondary)] animate-pulse">Loading Rent Management...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inv.status.toLowerCase() === 'paid';
    return inv.status.toLowerCase() !== 'paid'; // pending or overdue
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedPropertyId]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedData = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Rent Management</h1>
        <p className="text-sm text-[var(--text-secondary)]">Track expected rent, collect payments, and manage dues for all students.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><PieChart className="w-20 h-20" /></div>
            <div className="text-sm font-bold text-[var(--text-secondary)] mb-2">Total Expected (This Month)</div>
            <div className="text-3xl font-black text-[var(--text-primary)] flex items-center"><IndianRupee className="w-6 h-6"/> {stats.totalExpectedRent.toLocaleString('en-IN')}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-2">{stats.totalStudents} Active Students</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(16,185,129,0.05)] to-transparent border border-[rgba(16,185,129,0.2)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
            <div className="text-sm font-bold text-[var(--success)] mb-2">Rent Collected</div>
            <div className="text-3xl font-black text-[var(--success)] flex items-center"><IndianRupee className="w-6 h-6"/> {stats.totalCollectedRent.toLocaleString('en-IN')}</div>
            <div className="text-xs text-[var(--success)] opacity-80 mt-2 font-medium">{stats.studentsPaidCount} students paid</div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(239,68,68,0.05)] to-transparent border border-[rgba(239,68,68,0.2)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
            <div className="text-sm font-bold text-[var(--danger)] mb-2">Pending Rent</div>
            <div className="text-3xl font-black text-[var(--danger)] flex items-center"><IndianRupee className="w-6 h-6"/> {stats.pendingRentAmount.toLocaleString('en-IN')}</div>
            <div className="text-xs text-[var(--danger)] opacity-80 mt-2 font-medium">{stats.studentsPendingCount} students pending</div>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex gap-2 overflow-x-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            All Invoices
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-[var(--warning)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Pending ({invoices.filter(i => i.status.toLowerCase() !== 'paid').length})
          </button>
          <button 
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'paid' ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Paid ({invoices.filter(i => i.status.toLowerCase() === 'paid').length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] sticky top-0 z-10 shadow-sm shadow-black/5">
              <tr>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Student</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Month</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Due Date</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Amount</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedData.map(inv => (
                <tr key={inv.id} className="hover:bg-[var(--bg-page)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{inv.studentName}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{inv.roomBed}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {inv.month}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-black text-[var(--text-primary)] flex items-center">
                      <IndianRupee className="w-3.5 h-3.5"/> {inv.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status.toLowerCase() === 'paid' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]' : 'bg-[rgba(239,68,68,0.1)] text-[var(--danger)]'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {inv.status.toLowerCase() !== 'paid' ? (
                        <>
                          <button 
                            onClick={() => handleSendReminder(inv.studentName || 'Student')} 
                            className="p-2 text-[var(--warning)] hover:bg-[var(--warning-bg)] rounded-md transition-colors"
                            title="Send Reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleMarkPaid(inv.id)} 
                            className="px-3 py-1.5 bg-[var(--success)] text-white rounded font-bold hover:bg-[var(--success-hover)] transition-colors text-xs flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Collect Cash
                          </button>
                        </>
                      ) : (
                        <span className="text-[var(--success)] text-xs font-bold flex items-center gap-1 opacity-70">
                          <CheckCircle className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <Receipt className="w-10 h-10 text-[var(--text-secondary)] opacity-30 mx-auto mb-3" />
                    <div className="text-[var(--text-primary)] font-bold">No invoices found</div>
                    <div className="text-[var(--text-secondary)] text-sm">Try changing the filter or check back later.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}
