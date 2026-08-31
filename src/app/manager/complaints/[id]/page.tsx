'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, UserPlus, MessageSquare } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import Link from 'next/link';

export default function ManagerComplaintDetail() {
  const { id } = useParams() as { id: string };
  const [complaint, setComplaint] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [note, setNote] = useState('');

  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId } = useManagerPropertyContext();

  useEffect(() => {
    if (id && user && selectedPropertyId) {
      // Use API layer instead of direct localStorage
      const allComplaints = api.managerOperations.listComplaints(selectedPropertyId);
      const c = allComplaints.find((x: any) => x.id === id);
      setComplaint(c);
      
      // Mock timeline 
      if (c) {
        setTimeline([
          { id: '1', type: 'status', text: `Created with status ${c.status}`, time: c.createdAt },
          ...(c.assignedTo ? [{ id: '2', type: 'assign', text: `Assigned to staff ID: ${c.assignedTo}`, time: c.updatedAt }] : [])
        ]);
      }
    }
  }, [id]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setTimeline(prev => [...prev, { id: Date.now().toString(), type: 'note', text: note, time: new Date().toISOString() }]);
    setNote('');
  };

  const handleAssign = (staffId: string) => {
    api.managerOperations.assignComplaint(id, staffId, 'manager');
    setTimeline(prev => [...prev, { id: Date.now().toString(), type: 'assign', text: `Assigned to staff ID: ${staffId}`, time: new Date().toISOString() }]);
  };

  if (!complaint) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <Link href="/manager/complaints" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Complaints
      </Link>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 p-6 md:border-r border-[var(--border)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{complaint.title || complaint.category}</h1>
              <div className="text-sm text-[var(--text-secondary)] mt-1">Student ID: {complaint.studentId} • Room {complaint.roomNumber || '-'}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              complaint.status === 'Resolved' ? 'bg-[rgba(16,185,129,0.1)] text-[var(--success)]' :
              complaint.status === 'In Progress' ? 'bg-[rgba(99,102,241,0.1)] text-[var(--primary)]' :
              'bg-[var(--danger-bg)] text-[var(--danger)]'
            }`}>
              {complaint.status === 'Resolved' ? <CheckCircle className="w-3.5 h-3.5"/> : complaint.status === 'In Progress' ? <Clock className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5"/>}
              {complaint.status}
            </span>
          </div>

          <div className="bg-[var(--bg-input)] p-4 rounded-lg text-[var(--text-primary)] text-sm mb-8 border border-[var(--border)]">
            {complaint.description}
          </div>

          <h3 className="font-bold text-[var(--text-primary)] mb-4">Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={item.id} className="flex gap-4">
                <div className="mt-1">
                  {item.type === 'status' && <AlertCircle className="w-5 h-5 text-[var(--text-secondary)]" />}
                  {item.type === 'assign' && <UserPlus className="w-5 h-5 text-[var(--primary)]" />}
                  {item.type === 'note' && <MessageSquare className="w-5 h-5 text-[var(--text-secondary)]" />}
                </div>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{item.text}</p>
                  <span className="text-xs text-[var(--text-secondary)]">{new Date(item.time).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="mt-6 flex gap-2">
            <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add internal note..." className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
            <button type="submit" className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded font-medium hover:bg-[var(--bg-input)]">Add</button>
          </form>
        </div>

        <div className="w-full md:w-1/3 p-6 bg-[rgba(99,102,241,0.02)]">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Assign Staff</h3>
          <div className="space-y-3">
            <button onClick={() => handleAssign('staff_991')} className="w-full p-3 text-left bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
              <div className="font-medium text-[var(--text-primary)] text-sm">Raju (Maintenance)</div>
              <div className="text-xs text-[var(--text-secondary)]">Available</div>
            </button>
            <button onClick={() => handleAssign('staff_992')} className="w-full p-3 text-left bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
              <div className="font-medium text-[var(--text-primary)] text-sm">Suresh (Plumber)</div>
              <div className="text-xs text-[var(--text-secondary)]">Busy (2 tasks)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
