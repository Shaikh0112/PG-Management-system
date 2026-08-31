'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export default function ManagerAttendancePage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [staff, setStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const user = typeof window !== 'undefined' ? getSession() : null;

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setStaff(api.managerOperations.listStaff(selectedPropertyId));
      setAttendance(api.managerOperations.listAttendanceToday(selectedPropertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleMark = (staffId: string, status: 'Present' | 'Absent') => {
    if (!user || !selectedPropertyId) return;
    api.managerOperations.markAttendance(staffId, selectedPropertyId, status, user.id);
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Staff Attendance</h1>
        <p className="text-sm text-[var(--text-secondary)]">Mark attendance for today ({new Date().toLocaleDateString()}).</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)] text-[var(--text-secondary)]">
            <tr>
              <th className="p-4 font-medium">Staff Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status Today</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {staff.map(s => {
              const record = attendance.find(a => a.staffId === s.id);
              return (
                <tr key={s.id} className="hover:bg-[var(--bg-input)] transition-colors">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{s.name}</td>
                  <td className="p-4 text-[var(--text-secondary)] capitalize">{s.staffRole}</td>
                  <td className="p-4">
                    {record ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'}`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)] text-xs">Not Marked</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleMark(s.id, 'Present')} className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs border ${record?.status === 'Present' ? 'bg-[var(--success)] text-white border-[var(--success)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--success)]'}`}>
                      <CheckCircle className="w-3 h-3"/> Present
                    </button>
                    <button onClick={() => handleMark(s.id, 'Absent')} className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs border ${record?.status === 'Absent' ? 'bg-[var(--danger)] text-white border-[var(--danger)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--danger)]'}`}>
                      <XCircle className="w-3 h-3"/> Absent
                    </button>
                  </td>
                </tr>
              );
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No staff found for this property.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
