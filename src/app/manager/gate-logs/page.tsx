'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { LogIn, LogOut, AlertTriangle, User } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export default function ManagerGateLogsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [logs, setLogs] = useState<any[]>([]);
  const user = typeof window !== 'undefined' ? getSession() : null;

  // Manual Entry Form
  const [tenantId, setTenantId] = useState('');
  const [type, setType] = useState<'entry'|'exit'>('entry');
  const [isLate, setIsLate] = useState(false);

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setLogs(api.managerOperations.listGateLogs(selectedPropertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPropertyId || !tenantId) return;
    
    api.managerOperations.addGateLog({
      propertyId: selectedPropertyId,
      tenantId,
      type,
      isLate,
      managerId: user.id
    });
    
    setTenantId('');
    setIsLate(false);
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Gate Logs</h1>
          <p className="text-sm text-[var(--text-secondary)]">Monitor tenant entries and exits.</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-medium">Tenant</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg-input)] transition-colors">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{log.tenantId}</td>
                  <td className="p-4">
                    {log.type === 'entry' 
                      ? <span className="text-[var(--primary)] flex items-center gap-1"><LogIn className="w-4 h-4"/> Entry</span> 
                      : <span className="text-[var(--text-secondary)] flex items-center gap-1"><LogOut className="w-4 h-4"/> Exit</span>}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {log.isLate && <span className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1 rounded flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3"/> Late Entry</span>}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No gate logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg,12px)] sticky top-6">
          <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4">Manual Entry</h2>
          <form onSubmit={handleAdd} className="space-y-4">
             <div>
               <label className="block text-sm text-[var(--text-secondary)] mb-1">Tenant ID</label>
               <input required type="text" value={tenantId} onChange={e=>setTenantId(e.target.value)} placeholder="e.g. ten_123" className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
             </div>
             <div>
               <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
               <select value={type} onChange={e=>setType(e.target.value as 'entry'|'exit')} className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]">
                 <option value="entry">Entry</option>
                 <option value="exit">Exit</option>
               </select>
             </div>
             {type === 'entry' && (
               <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] mt-2">
                 <input type="checkbox" checked={isLate} onChange={e=>setIsLate(e.target.checked)} className="accent-[var(--danger)] w-4 h-4" />
                 Flag as Late Entry
               </label>
             )}
             <button type="submit" className="w-full py-2 bg-[var(--primary)] text-white rounded font-medium mt-4">Log {type}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
