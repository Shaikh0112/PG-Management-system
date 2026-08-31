'use client';

import { useState, useEffect } from 'react';
import { staffOperationsApi } from '@/app/staff/lib/api/staffOperations';
import { useStaffContext } from '@/app/staff/components/StaffContext';
import { getSession } from '@/lib/auth/session';
import { ListTodo, CheckSquare, Square } from 'lucide-react';

export default function StaffTasksPage() {
  const { propertyId } = useStaffContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [tasks, setTasks] = useState<any[]>([]);

  const loadData = () => {
    if (session && propertyId) {
      setTasks(staffOperationsApi.getTasks(propertyId, session.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId, session?.id]);

  const handleToggle = (id: string, currentStatus: string) => {
    if (!session) return;
    staffOperationsApi.updateTask(id, currentStatus === 'done' ? 'pending' : 'done', session.id);
    loadData();
  };

  if (!propertyId) return <div className="p-6">Loading or Property not assigned...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-3xl">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">General Tasks</h1>
        <p className="text-sm text-[var(--text-secondary)]">Your assigned checklists and ad-hoc tasks.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
        <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[var(--primary)]" />
          Task List
        </h2>
        <div className="space-y-2">
          {tasks.map(t => (
            <button 
              key={t.id} 
              onClick={() => handleToggle(t.id, t.status)}
              className={`w-full flex items-center gap-3 p-4 rounded text-left transition-colors border ${
                t.status === 'done' 
                  ? 'bg-[var(--bg-card)] opacity-60 border-[var(--border)]' 
                  : 'bg-[var(--bg-input)] hover:bg-[var(--primary-subtle)] border-transparent'
              }`}
            >
              {t.status === 'done' ? <CheckSquare className="w-5 h-5 text-[var(--success)]" /> : <Square className="w-5 h-5 text-[var(--text-secondary)]" />}
              <div>
                <div className={`font-medium ${t.status === 'done' ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                  {t.title}
                </div>
                {t.desc && <div className="text-sm text-[var(--text-secondary)] mt-0.5">{t.desc}</div>}
              </div>
            </button>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)] py-4 text-center">No tasks assigned to you right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
