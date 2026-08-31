'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { AlertCircle, Clock, CheckCircle, IndianRupee, X } from 'lucide-react';

export default function ManagerComplaintsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'log'>('active');
  const [resolvingComplaint, setResolvingComplaint] = useState<any | null>(null);
  const [repairCost, setRepairCost] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = () => {
    if (selectedPropertyId) {
      setComplaints(api.managerOperations.listComplaints(selectedPropertyId));
    }
  };

  useEffect(() => {
    if (!ctxLoading) loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    const cost = parseFloat(repairCost) || 0;
    api.managerOperations.resolveComplaintWithCost(resolvingComplaint.id, cost, resolutionNotes, 'manager');
    setResolvingComplaint(null);
    setRepairCost('');
    setResolutionNotes('');
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-[var(--text-secondary)] text-center">Property Required</div>;

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').sort((a,b) => new Date(b.resolvedAt || b.updatedAt).getTime() - new Date(a.resolvedAt || a.updatedAt).getTime());

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Maintenance & Complaints</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage student issues and track repair costs.</p>
      </div>

      <div className="flex border-b border-[var(--border)] gap-6">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`pb-3 font-bold transition-colors ${activeTab === 'active' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Active Requests ({activeComplaints.length})
        </button>
        <button 
          onClick={() => setActiveTab('log')} 
          className={`pb-3 font-bold transition-colors ${activeTab === 'log' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Maintenance Log
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeComplaints.map(c => (
            <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{c.title || c.category}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                    c.status === 'In Progress' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                  }`}>
                    {c.status === 'In Progress' ? <Clock className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{c.description}</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2.5 py-1 bg-[var(--bg-input)] text-[var(--text-secondary)] font-medium rounded border border-[var(--border)]">Room {c.roomNumber || '-'}</span>
                  <span className="text-xs px-2.5 py-1 bg-[var(--bg-input)] text-[var(--text-secondary)] font-medium rounded border border-[var(--border)]">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="shrink-0 flex gap-2 w-full md:w-auto">
                {c.status === 'Open' && (
                  <button 
                    onClick={() => {
                      api.managerOperations.updateComplaintStatus(c.id, 'In Progress', 'manager');
                      loadData();
                    }}
                    className="flex-1 md:flex-none px-4 py-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded font-bold text-sm shadow-sm hover:bg-[var(--primary)] hover:text-white transition-colors"
                  >
                    Start Work
                  </button>
                )}
                <button 
                  onClick={() => setResolvingComplaint(c)}
                  className="flex-1 md:flex-none px-4 py-2 bg-[var(--success)] text-white rounded font-bold text-sm shadow-sm hover:bg-green-600 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
          {activeComplaints.length === 0 && (
            <div className="text-center p-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
              <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-3 opacity-50" />
              <div className="text-[var(--text-primary)] font-bold text-lg">No active requests</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">All maintenance issues are resolved.</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <div className="col-span-2">Room</div>
            <div className="col-span-4">Issue</div>
            <div className="col-span-3">Cost</div>
            <div className="col-span-3">Resolved Date</div>
          </div>
          {resolvedComplaints.map(c => (
            <div key={c.id} className="grid grid-cols-12 gap-4 items-center bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm hover:bg-[var(--bg-input)] transition-colors">
              <div className="col-span-2 font-bold text-[var(--text-primary)]">
                {c.roomNumber || '-'}
              </div>
              <div className="col-span-4">
                <div className="font-bold text-[var(--text-primary)]">{c.title || c.category}</div>
                {c.resolutionNotes && <div className="text-xs text-[var(--text-secondary)] truncate">{c.resolutionNotes}</div>}
              </div>
              <div className="col-span-3 font-bold text-[var(--danger)] flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5"/> {c.repairCost ? c.repairCost.toLocaleString('en-IN') : '0'}
              </div>
              <div className="col-span-3 text-sm text-[var(--text-secondary)]">
                {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : '-'}
              </div>
            </div>
          ))}
          {resolvedComplaints.length === 0 && (
            <div className="text-center p-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)]">
              No completed maintenance logs found.
            </div>
          )}
        </div>
      )}

      {resolvingComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-card)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--success)]" /> Resolve Issue
              </h2>
              <button onClick={() => setResolvingComplaint(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleResolveSubmit} className="p-6 space-y-5">
              <div className="p-4 bg-[var(--bg-input)] rounded-lg text-sm mb-4">
                <div className="font-bold text-[var(--text-primary)]">{resolvingComplaint.title || resolvingComplaint.category}</div>
                <div className="text-[var(--text-secondary)]">Room {resolvingComplaint.roomNumber || '-'}</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Repair Cost (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={repairCost}
                    onChange={e => setRepairCost(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border)] pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow"
                    placeholder="e.g. 1500"
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">This will be automatically logged as a maintenance expense in your P&L.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Resolution Notes (Optional)</label>
                <textarea 
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] resize-none transition-shadow"
                  placeholder="e.g. AC gas refilled by technician..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setResolvingComplaint(null)} className="flex-1 py-3 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--border)] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[var(--success)] text-white rounded-xl font-bold shadow-lg shadow-[var(--success)]/20 hover:bg-green-600 transition-colors">Confirm & Resolve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
