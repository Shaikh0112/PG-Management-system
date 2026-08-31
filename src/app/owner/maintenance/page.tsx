'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { IndianRupee } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';

export default function OwnerMaintenancePage() {
  const { properties } = useOwnerPropertyContext();
  const [resolvedComplaints, setResolvedComplaints] = useState<any[]>([]);
  const [filterPropertyId, setFilterPropertyId] = useState<string>('all');

  useEffect(() => {
    let allComplaints: any[] = [];
    
    if (filterPropertyId === 'all') {
      properties.forEach(p => {
        const propsComplaints = api.managerOperations.listComplaints(p.id).map(c => ({...c, propertyName: p.name}));
        allComplaints = [...allComplaints, ...propsComplaints];
      });
    } else {
      const selectedProp = properties.find(p => p.id === filterPropertyId);
      if (selectedProp) {
        allComplaints = api.managerOperations.listComplaints(selectedProp.id).map(c => ({...c, propertyName: selectedProp.name}));
      }
    }
    
    const resolved = allComplaints.filter(c => c.status === 'Resolved').sort((a, b) => new Date(b.resolvedAt || b.updatedAt).getTime() - new Date(a.resolvedAt || a.updatedAt).getTime());
    setResolvedComplaints(resolved);
  }, [filterPropertyId, properties]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPropertyId]);

  const totalPages = Math.ceil(resolvedComplaints.length / itemsPerPage);
  const paginatedData = resolvedComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Maintenance Log</h1>
          <p className="text-sm text-[var(--text-secondary)]">Review completed repairs and their costs.</p>
        </div>
        
        <select
          value={filterPropertyId}
          onChange={(e) => setFilterPropertyId(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)] shadow-sm min-w-[200px]"
        >
          <option value="all">All Properties</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4">Completed Repairs</h2>
        
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border)]">
            <div className="col-span-2">PG & Room</div>
            <div className="col-span-4">Issue</div>
            <div className="col-span-3">Cost</div>
            <div className="col-span-3">Resolved Date</div>
          </div>
          
          {paginatedData.map(c => (
            <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-input)] transition-colors">
              <div className="md:col-span-2 flex justify-between md:block">
                <span className="md:hidden text-xs font-bold text-[var(--text-secondary)] uppercase">PG & Room</span>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{c.propertyName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">Room {c.roomNumber || '-'}</div>
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="font-bold text-[var(--text-primary)]">{c.title || c.category}</div>
                {c.resolutionNotes && <div className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">{c.resolutionNotes}</div>}
              </div>
              <div className="md:col-span-3 flex justify-between md:block items-center mt-2 md:mt-0">
                <span className="md:hidden text-xs font-bold text-[var(--text-secondary)] uppercase">Cost</span>
                <div className="font-black text-[var(--danger)] flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5"/> {c.repairCost ? c.repairCost.toLocaleString('en-IN') : '0'}
                </div>
              </div>
              <div className="md:col-span-3 flex justify-between md:block items-center mt-1 md:mt-0">
                <span className="md:hidden text-xs font-bold text-[var(--text-secondary)] uppercase">Resolved Date</span>
                <div className="text-sm font-medium text-[var(--text-secondary)]">
                  {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : (c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '-')}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}

          {resolvedComplaints.length === 0 && (
            <div className="text-center p-12 text-[var(--text-secondary)]">
              No completed maintenance logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
