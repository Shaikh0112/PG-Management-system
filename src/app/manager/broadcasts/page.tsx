'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { Radio, Users, Building, AlertTriangle } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export default function ManagerBroadcastsPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const user = typeof window !== 'undefined' ? getSession() : null;

  const [formData, setFormData] = useState({ title: '', message: '', audience: 'all', targetFloor: '' });

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setBroadcasts(api.managerOperations.listBroadcasts(selectedPropertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPropertyId) return;
    
    api.managerOperations.createBroadcast({
      ...formData,
      audience: formData.audience as any,
      propertyId: selectedPropertyId,
      managerId: user.id
    });
    
    setFormData({ title: '', message: '', audience: 'all', targetFloor: '' });
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="space-y-6 pb-20 flex flex-col lg:flex-row gap-6">
      
      <div className="w-full lg:w-1/3 shrink-0">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[var(--radius-lg,12px)] sticky top-6">
          <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-[var(--primary)]" />
            New Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
             <div>
               <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
               <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="e.g. Water Supply Update" className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
             </div>
             <div>
               <label className="block text-sm text-[var(--text-secondary)] mb-1">Message</label>
               <textarea required rows={4} value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} placeholder="Type message..." className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none" />
             </div>
             <div>
               <label className="block text-sm text-[var(--text-secondary)] mb-1">Audience</label>
               <select value={formData.audience} onChange={e=>setFormData({...formData, audience: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]">
                 <option value="all">All Students</option>
                 <option value="floor">Specific Floor</option>
                 <option value="defaulters">Rent Defaulters</option>
               </select>
             </div>
             {formData.audience === 'floor' && (
               <div className="animate-in fade-in">
                 <label className="block text-sm text-[var(--text-secondary)] mb-1">Target Floor</label>
                 <input required type="text" value={formData.targetFloor} onChange={e=>setFormData({...formData, targetFloor: e.target.value})} placeholder="e.g. 2nd Floor" className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-3 py-2 rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
               </div>
             )}
             <button type="submit" className="w-full py-2 bg-[var(--primary)] text-white rounded font-medium mt-4">Send Broadcast</button>
          </form>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Broadcast History</h1>
          <p className="text-sm text-[var(--text-secondary)]">Past announcements sent to students.</p>
        </div>

        <div className="space-y-4">
          {broadcasts.map(b => (
            <div key={b.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg,12px)]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[var(--text-primary)]">{b.title}</h3>
                <span className="text-xs text-[var(--text-secondary)]">{new Date(b.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{b.message}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-input)] text-xs text-[var(--text-primary)] font-medium">
                {b.audience === 'all' && <Users className="w-3.5 h-3.5 text-[var(--primary)]" />}
                {b.audience === 'floor' && <Building className="w-3.5 h-3.5 text-[var(--success)]" />}
                {b.audience === 'defaulters' && <AlertTriangle className="w-3.5 h-3.5 text-[var(--danger)]" />}
                Target: {b.audience === 'floor' ? b.targetFloor : b.audience === 'defaulters' ? 'Defaulters' : 'All Students'}
              </div>
            </div>
          ))}
          {broadcasts.length === 0 && (
            <div className="text-center p-8 text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-[var(--radius-lg,12px)] border border-[var(--border)]">
              No previous broadcasts.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
