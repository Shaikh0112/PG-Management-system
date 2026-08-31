'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { Users, CheckCircle2, XCircle, Search, Building } from 'lucide-react';
import { attendanceApi, StaffAttendance } from '@/lib/api/attendance';
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { format } from 'date-fns';

export default function OwnerAttendancePage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId } = useOwnerPropertyContext();

  const [staff, setStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Get all staff for this owner
    const allStaff = db.getAll<any>(STORAGE_KEYS.STAFF).filter(s => {
      const prop = properties.find(p => p.id === s.propertyId);
      return prop && !s.isDeleted;
    });
    setStaff(allStaff);

    // Get attendance for the selected date
    const attData = attendanceApi.getAttendanceByOwner(user.id, dateStr);
    setAttendance(attData);

    setLoading(false);
  }, [user?.id, properties, dateStr]);

  const filteredStaff = staff.filter(s => {
    // Property filter
    if (selectedPropertyId !== 'all' && s.propertyId !== selectedPropertyId) return false;
    
    // Search
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      return s.name?.toLowerCase().includes(sq) || s.role?.toLowerCase().includes(sq);
    }
    
    return true;
  });

  const getAttendanceStatus = (staffUserId: string) => {
    const record = attendance.find(a => a.staffUserId === staffUserId);
    return record ? record.markedAt : null;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Staff Attendance</h1>
          <p className="text-sm text-[var(--text-secondary)]">Monitor daily attendance of your staff across all properties.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search staff by name or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2">
          <label className="text-sm text-[var(--text-secondary)] font-medium">Date:</label>
          <input 
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="bg-transparent text-sm focus:outline-none text-[var(--text-primary)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--text-secondary)] animate-pulse">Loading attendance records...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <Users className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Staff Found</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm">
            We couldn't find any staff members matching your criteria.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[rgba(99,102,241,0.03)] border-b border-[var(--border)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Staff Member</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Property</th>
                  <th className="px-6 py-4 font-semibold">Status ({new Date(dateStr).toLocaleDateString()})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredStaff.map((s) => {
                  const markedAt = getAttendanceStatus(s.userId);
                  const property = properties.find(p => p.id === s.propertyId);
                  
                  return (
                    <tr key={s.id} className="hover:bg-[rgba(99,102,241,0.01)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)]">{s.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{s.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[var(--bg-input)] rounded text-xs font-bold capitalize text-[var(--text-primary)]">
                          {s.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Building className="w-4 h-4" />
                          <span>{property?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {markedAt ? (
                          <div className="flex items-center gap-2 text-[var(--success)]">
                            <CheckCircle2 className="w-5 h-5" />
                            <div>
                              <div className="font-bold">Present</div>
                              <div className="text-[10px] opacity-80">Marked at {new Date(markedAt).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[var(--danger)]">
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold">Pending / Absent</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
