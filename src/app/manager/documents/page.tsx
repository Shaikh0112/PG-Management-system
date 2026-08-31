'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { FileText, Download } from 'lucide-react';
import { Pagination } from '@/components/shared/Pagination';

export default function ManagerDocumentsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!ctxLoading && selectedPropertyId) {
      setDocuments(api.managerOperations.listDocuments(selectedPropertyId));
    }
  }, [selectedPropertyId, ctxLoading]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPropertyId]);

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const paginatedData = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Student Documents</h1>
        <p className="text-sm text-[var(--text-secondary)]">Verify uploaded IDs and agreements.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] sticky top-0 z-10 shadow-sm shadow-black/5">
            <tr>
              <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Student ID</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Document Type</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              <th className="p-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {paginatedData.map(d => (
              <tr key={d.id} className="hover:bg-[var(--bg-page)] transition-colors">
                <td className="p-4 font-medium text-[var(--text-primary)]">{d.uploaderId?.slice(0,8) || d.studentId?.slice(0,8) || 'student'}...</td>
                <td className="p-4 text-[var(--text-secondary)] uppercase text-xs">{d.type || d.documentType || 'Aadhaar'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'verified' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>
                    {d.status || 'pending'}
                  </span>
                </td>
                <td className="p-4 flex justify-end">
                  <button className="p-2 hover:bg-[var(--bg-input)] rounded border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No documents uploaded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}
