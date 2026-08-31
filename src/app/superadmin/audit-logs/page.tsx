'use client';
import { useState, useEffect } from 'react';
import { auditApi } from '@/lib/api/audit';
import { Search, Filter, Shield, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    setLogs(auditApi.getAll().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, []);

  const filtered = logs.filter(l => {
    if(roleFilter !== 'All' && l.actorId !== 'superadmin' && roleFilter === 'superadmin') return false; // simplistic filter for demo
    if(search) {
      const q = search.toLowerCase();
      return l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="animate-pulse p-6">Loading audit logs...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">System Audit Logs</h1>
        <p className="text-[var(--text-secondary)] text-sm">Chronological record of critical system actions.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--bg-card)] rounded-t-[var(--radius-lg,12px)]">
          <div className="flex gap-2">
            {['All', 'Auth', 'Settings', 'Owners'].map(f => (
              <button 
                key={f} 
                className={`px-3 py-1.5 text-sm font-medium rounded-[var(--radius-full,999px)] transition-colors ${f === 'All' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="relative border-l border-[var(--border)] ml-3 space-y-8 pb-8">
            {filtered.length === 0 && <div className="pl-6 text-[var(--text-secondary)]">No logs found.</div>}
            
            {filtered.map(log => (
              <div key={log.id} className="relative pl-8">
                <span className="absolute -left-[17px] top-1 bg-[var(--bg-card)] border-[3px] border-[var(--primary)] w-[32px] h-[32px] rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[var(--primary)]" />
                </span>
                <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-[var(--text-primary)] text-sm">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{log.details}</div>
                  <div className="mt-3 text-[11px] text-[var(--text-disabled)] font-mono">
                    Actor: {log.actorId} | Target: {log.targetId} | Ref: {log.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}