'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useToast } from '@/lib/ui/ToastContext';
import { 
  Banknote, Calendar, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, X, Loader2, Play
} from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { db } from '@/lib/storage/db';
import { createId } from '@/lib/utils/id';
import { useOwnerPropertyContext } from '@/components/owner/OwnerPropertyContext';

export default function PayrollPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { showToast } = useToast();
  const { selectedPropertyId, setSelectedPropertyId, properties } = useOwnerPropertyContext();

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffData, setStaffData] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    mode: 'UPI',
    transactionId: ''
  });

  const loadPayrollData = () => {
    if (!user) return;
    setLoading(true);
    
    // Get month and year
    const month = currentDate.getMonth() + 1; // 1-12
    const year = currentDate.getFullYear();

    const data = api.payroll.getPayrollStatus(user.id, month, year);
    setStaffData(data);
    setLoading(false);
  };

  useEffect(() => {
    // One-time cleanup of all dummy data (including old corrupted ones without emails)
    const cleanupDummies = () => {
      const dummyNames = ['Ramesh Kumar', 'Suresh Das', 'Sunita Devi', 'Bahadur Singh', 'Raju Bhai', 'Anita Sharma'];
      const users = db.getAll('spg_users').filter((u: any) => dummyNames.includes(u.name));
      const staff = db.getAll('spg_staff');
      users.forEach(u => {
        db.remove('spg_users', u.id);
        const sProfile = staff.find((s: any) => s.userId === u.id);
        if (sProfile) db.remove('spg_staff', sProfile.id);
      });
      const props = db.getAll('spg_properties').filter((p: any) => p.name === 'Royal Residency PG' || p.name === 'Sunshine Girls Hostel');
      props.forEach(p => db.remove('spg_properties', p.id));
    };
    try { cleanupDummies(); } catch (e) {}
    
    loadPayrollData();
  }, [user?.id, currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleOpenPaymentModal = (staffRecord: any) => {
    setSelectedStaff(staffRecord);
    setPaymentForm({ mode: 'UPI', transactionId: '' });
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedStaff) return;
    
    setProcessingPayment(true);
    
    setTimeout(() => {
      try {
        api.payroll.processPayment({
          ownerId: user.id,
          staffId: selectedStaff.staff.id,
          staffName: selectedStaff.staff.name,
          role: selectedStaff.staff.staffType,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          amount: selectedStaff.staff.salary,
          paymentMode: paymentForm.mode as any,
          transactionId: paymentForm.transactionId
        });
        showToast('success', `Payment recorded for ${selectedStaff.staff.name}`);
        setPaymentModalOpen(false);
        loadPayrollData();
      } catch (err: any) {
        showToast('error', err.message || 'Failed to record payment.');
      } finally {
        setProcessingPayment(false);
      }
    }, 1500);
  };

  const handleSetupDreamHappy = async () => {
    if (!user?.id) return;
    setLoading(true);
    showToast('success', 'Setting up Dream and Happy PGs...');
    
    setTimeout(() => {
      // 0. Clean up previous Dream/Happy PGs and Staff to avoid duplicates
      try {
        const props = db.getAll('spg_properties').filter((p: any) => p.name === 'Dream PG' || p.name === 'Happy PG');
        props.forEach(p => db.remove('spg_properties', p.id));
        
        const dummyNames = ['Ashfaq Ahmed', 'Simran Kaur', 'Sameer Khan', 'Ravi Prakash', 'Bhola Ram'];
        const users = db.getAll('spg_users').filter((u: any) => dummyNames.includes(u.name));
        const staff = db.getAll('spg_staff');
        users.forEach(u => {
          db.remove('spg_users', u.id);
          const sProfile = staff.find((s: any) => s.userId === u.id);
          if (sProfile) db.remove('spg_staff', sProfile.id);
        });
      } catch (e) {}

      // 1. Create Dream and Happy PGs
      const dreamId = createId('prop');
      const happyId = createId('prop');
      
      db.insert('spg_properties' as any, {
        id: dreamId, ownerId: user.id, name: 'Dream PG', slug: 'dream-pg',
        type: 'coed', address: 'Plot 10, Scheme 54', city: 'Indore', pincode: '452010',
        bedsPlanned: 100, createdAt: new Date().toISOString(), isDeleted: false
      } as any);

      db.insert('spg_properties' as any, {
        id: happyId, ownerId: user.id, name: 'Happy PG', slug: 'happy-pg',
        type: 'boys', address: 'Vijay Nagar', city: 'Indore', pincode: '452010',
        bedsPlanned: 150, createdAt: new Date().toISOString(), isDeleted: false
      } as any);

      // 2. Create Teams
      const newStaff = [
        // Dream PG Staff
        { name: 'Ashfaq Ahmed', role: 'manager', salary: 30000, phone: '9876543001', propId: dreamId },
        { name: 'Simran Kaur', role: 'cleaner', salary: 12000, phone: '9876543002', propId: dreamId },
        { name: 'Sameer Khan', role: 'cook', salary: 18000, phone: '9876543003', propId: dreamId },
        // Happy PG Staff
        { name: 'Ravi Prakash', role: 'manager', salary: 28000, phone: '9876543004', propId: happyId },
        { name: 'Bhola Ram', role: 'guard', salary: 14000, phone: '9876543005', propId: happyId }
      ];

      newStaff.forEach((d, i) => {
        const randomStr = Math.random().toString(36).substring(2, 7);
        const email = d.name.split(' ')[0].toLowerCase() + `_${randomStr}@smartpg.test`;
        
        try {
          const { profile } = api.team.createTeamMember({
            name: d.name,
            email: email,
            phone: d.phone,
            password: 'Password@123',
            roleType: d.role as any,
            assignedPropertyIds: [d.propId],
            salary: d.salary,
            joinDate: new Date().toISOString(),
            shift: 'Morning',
            permissions: { canEditRent: false, canAddExpense: true, canOnboardTenant: d.role === 'manager', canBroadcast: d.role === 'manager', canCollectCash: true }
          }, user.id);
          
          if (d.role === 'manager') {
            api.payroll.processPayment({
              ownerId: user.id, staffId: profile.id, staffName: d.name, role: d.role,
              month: currentDate.getMonth() + 1, year: currentDate.getFullYear(),
              amount: d.salary, paymentMode: 'Bank Transfer', transactionId: 'TXN1122334455'
            });
          }
        } catch (e: any) {
          console.error('Failed to create staff:', d.name, e);
          showToast('error', `Failed to create ${d.name}: ${e.message}`);
        }
      });
      
      showToast('success', 'Dream & Happy PGs setup complete!');
      
      // Force change filter to "All Properties" so they can instantly see them
      setSelectedPropertyId('all');
      setRoleFilter('all');
      
      setTimeout(() => { window.location.reload(); }, 800);
    }, 1000);
  };

  if (loading && staffData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Apply Filters (Property + Role)
  const filteredStaffData = staffData.filter(item => {
    // Role filter
    const matchRole = roleFilter === 'all' || item.staff.staffType === roleFilter;
    
    // Property filter (checking if the user's assigned property includes selectedPropertyId)
    // NOTE: item.staff is just a simplified object in the payroll API return, it does not include assignedPropertyIds!
    // Wait, since payroll API only returns id, name, phone, staffType, salary... we need to fetch the full user profile to filter by property!
    // Fortunately teamApi.listByOwner can be accessed directly or we just accept that we don't have assignedPropertyIds mapped in staffData.
    // Let's get the raw users from db to filter them.
    const allUsers = db.getAll('spg_users') as any[];
    const staffUser = allUsers.find(u => u.name === item.staff.name && u.phone === item.staff.phone);
    const matchProperty = selectedPropertyId === 'all' || (staffUser?.assignedPropertyIds || []).includes(selectedPropertyId);
    
    return matchRole && matchProperty;
  });

  // Calculate stats on filtered data
  const totalStaff = filteredStaffData.length;
  const paidCount = filteredStaffData.filter(s => s.isPaid).length;
  const pendingCount = totalStaff - paidCount;
  const totalPayout = filteredStaffData.reduce((acc, s) => acc + (s.staff.salary || 0), 0);
  const paidPayout = filteredStaffData.filter(s => s.isPaid).reduce((acc, s) => acc + (s.staff.salary || 0), 0);
  const pendingPayout = totalPayout - paidPayout;

  return (
    <div className="pb-20 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Staff Payroll</h1>
          <p className="text-[12px] font-medium text-[var(--text-secondary)] mt-1">Manage monthly salaries and payouts</p>
        </div>
        <button 
          onClick={handleSetupDreamHappy}
          className="flex items-center gap-2 bg-[var(--primary)] text-white text-[12px] font-bold px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Play className="w-3.5 h-3.5" /> Setup Dream & Happy PG
        </button>
      </div>

      {/* Month Selector & Stats */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-[var(--border)] gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[var(--bg-page)] rounded-full text-[var(--text-secondary)] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 px-4">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            
            <button onClick={handleNextMonth} className="p-2 hover:bg-[var(--bg-page)] rounded-full text-[var(--text-secondary)] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-medium"
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-medium"
            >
              <option value="all">All Roles</option>
              <option value="manager">Managers</option>
              <option value="cook">Cooks</option>
              <option value="guard">Guards</option>
              <option value="cleaner">Cleaners</option>
              <option value="maintenance">Maintenance</option>
              <option value="accountant">Accountants</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
            <p className="text-[12px] text-[var(--text-secondary)] mb-1">Total Payroll</p>
            <p className="text-[20px] font-bold text-[var(--text-primary)]">₹{totalPayout.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
            <p className="text-[12px] text-[var(--text-secondary)] mb-1">Cleared</p>
            <p className="text-[20px] font-bold text-[var(--success)]">₹{paidPayout.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
            <p className="text-[12px] text-[var(--text-secondary)] mb-1">Pending</p>
            <p className="text-[20px] font-bold text-[var(--danger)]">₹{pendingPayout.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
            <p className="text-[12px] text-[var(--text-secondary)] mb-1">Staff Paid</p>
            <p className="text-[20px] font-bold text-[var(--text-primary)]">{paidCount} / {totalStaff}</p>
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-page)] border-b border-[var(--border)]">
                <th className="px-5 py-3 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Staff Details</th>
                <th className="px-5 py-3 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Salary</th>
                <th className="px-5 py-3 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredStaffData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--text-secondary)] text-sm">
                    No staff members found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaffData.map((item, idx) => (
                  <tr key={item.staff?.id || `staff-${idx}`} className="hover:bg-[var(--bg-page)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[14px] text-[var(--text-primary)]">{item.staff.name}</div>
                      <div className="text-[12px] text-[var(--text-secondary)]">{item.staff.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-[13px] font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                        {item.staff.staffType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[14px] text-[var(--text-primary)]">
                        ₹{(item.staff.salary || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {item.isPaid ? (
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--success)]">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--danger)]">
                          <AlertCircle className="w-4 h-4" /> Pending
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.isPaid ? (
                        <span className="text-[12px] text-[var(--text-secondary)] font-medium bg-[var(--bg-page)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-md)]">
                          {format(new Date(item.paymentDetails.paymentDate), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPaymentModal(item)}
                          className="bg-[var(--primary)] text-white text-[12px] font-bold px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-md border border-[var(--border)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-page)]">
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Record Salary Payment</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">Paying <strong className="text-[var(--text-primary)]">{selectedStaff.staff.name}</strong> for {format(currentDate, 'MMMM yyyy')}</p>
              </div>
              <button 
                onClick={() => !processingPayment && setPaymentModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
                disabled={processingPayment}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
              
              <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] flex justify-between items-center mb-6">
                <span className="text-[14px] font-medium text-[var(--text-secondary)]">Salary Amount</span>
                <span className="text-[22px] font-bold text-[var(--text-primary)]">₹{(selectedStaff.staff.salary || 0).toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Payment Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {['UPI', 'Cash', 'Bank Transfer'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentForm({...paymentForm, mode})}
                      className={`py-2 px-3 rounded-[var(--radius-md)] text-[13px] font-semibold border transition-all ${
                        paymentForm.mode === mode 
                          ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {paymentForm.mode !== 'Cash' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Transaction ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TXN123456789"
                    value={paymentForm.transactionId}
                    onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                    disabled={processingPayment}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processingPayment}
                className="w-full mt-4 py-3 bg-[var(--primary)] text-white text-[14px] font-bold rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Recording Payment...</>
                ) : (
                  <><Banknote className="w-4 h-4" /> Mark as Paid</>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
