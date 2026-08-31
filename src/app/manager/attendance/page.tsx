'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { Users, CheckCircle, XCircle, Clock, Search, BedDouble, Building } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { format } from 'date-fns';
import { Pagination } from '@/components/shared/Pagination';

export default function ManagerAttendancePage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const user = typeof window !== 'undefined' ? getSession() : null;

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setStudents(api.managerOperations.listStudents(selectedPropertyId));
      setAttendance(api.managerOperations.listStudentAttendanceToday(selectedPropertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleMark = (studentId: string, status: 'Present' | 'Absent' | 'On Leave') => {
    if (!user || !selectedPropertyId) return;
    api.managerOperations.markStudentAttendance(studentId, selectedPropertyId, status, user.id);
    loadData();
  };

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roomNumber?.includes(searchQuery);
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPropertyId]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    if (status === 'Present') return 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]';
    if (status === 'Absent') return 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]';
    if (status === 'On Leave') return 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]';
    return 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border)]';
  };

  if (ctxLoading) return (
    <div className="p-8 text-center text-[var(--text-secondary)] animate-pulse">
      Loading student roster...
    </div>
  );
  
  if (!selectedPropertyId) return (
    <div className="p-8 text-center flex flex-col items-center">
      <Building className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-50" />
      <h3 className="text-lg font-bold text-[var(--text-primary)]">Property Required</h3>
      <p className="text-sm text-[var(--text-secondary)]">Please select a property from the top navigation to mark attendance.</p>
    </div>
  );

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const leaveCount = attendance.filter(a => a.status === 'On Leave').length;
  const pendingCount = students.length - attendance.length;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Student Roll Call</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Mark night attendance for {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-[var(--success-bg)] px-3 py-1.5 rounded-md border border-[var(--success)] border-opacity-20 flex flex-col items-center min-w-[70px]">
            <span className="text-xs font-bold text-[var(--success)] uppercase">Present</span>
            <span className="text-lg font-bold text-[var(--success)]">{presentCount}</span>
          </div>
          <div className="bg-[var(--danger-bg)] px-3 py-1.5 rounded-md border border-[var(--danger)] border-opacity-20 flex flex-col items-center min-w-[70px]">
            <span className="text-xs font-bold text-[var(--danger)] uppercase">Absent</span>
            <span className="text-lg font-bold text-[var(--danger)]">{absentCount}</span>
          </div>
          <div className="bg-[var(--bg-input)] px-3 py-1.5 rounded-md border border-[var(--border)] flex flex-col items-center min-w-[70px]">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Pending</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search student by name or room..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] sticky top-0 z-10 shadow-sm shadow-black/5">
              <tr>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Student Name</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Room & Bed</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Today's Status</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[11px] text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedData.map(s => {
                const record = attendance.find(a => a.studentId === s.userId || a.studentId === s.id);
                const currentStatus = record?.status || 'Pending';

                return (
                  <tr key={s.id} className="hover:bg-[var(--bg-page)] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{s.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{s.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                        <BedDouble className="w-4 h-4" />
                        {s.roomNumber ? `Room ${s.roomNumber}` : 'Not Assigned'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleMark(s.userId || s.id, 'Present')} 
                          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all border ${currentStatus === 'Present' ? 'bg-[var(--success)] text-white border-[var(--success)] shadow-sm' : 'bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--success)] hover:text-[var(--success)]'}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5"/> 
                          <span className="hidden sm:inline">Present</span>
                        </button>
                        <button 
                          onClick={() => handleMark(s.userId || s.id, 'Absent')} 
                          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all border ${currentStatus === 'Absent' ? 'bg-[var(--danger)] text-white border-[var(--danger)] shadow-sm' : 'bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--danger)] hover:text-[var(--danger)]'}`}
                        >
                          <XCircle className="w-3.5 h-3.5"/> 
                          <span className="hidden sm:inline">Absent</span>
                        </button>
                        <button 
                          onClick={() => handleMark(s.userId || s.id, 'On Leave')} 
                          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all border ${currentStatus === 'On Leave' ? 'bg-[var(--warning)] text-white border-[var(--warning)] shadow-sm' : 'bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--warning)] hover:text-[var(--warning)]'}`}
                        >
                          <Clock className="w-3.5 h-3.5"/> 
                          <span className="hidden sm:inline">Leave</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--text-secondary)]">
                      <Users className="w-10 h-10 mb-3 opacity-40" />
                      <p className="font-medium text-base">No students found</p>
                      <p className="text-sm">There are no active students matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  );
}
