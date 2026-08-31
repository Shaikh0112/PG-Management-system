'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentOperationsApi } from '@/app/student/lib/api/studentOperations';
import { useStudentContext } from '@/app/student/components/StudentContext';
import { getSession } from '@/lib/auth/session';

export default function NewComplaintPage() {
  const router = useRouter();
  const { profile } = useStudentContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [formData, setFormData] = useState({ category: 'Electrical', title: '', description: '', priority: 'Medium', photoUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session) return;
    studentOperationsApi.createComplaint({
      ...formData,
      propertyId: profile.propertyId,
      studentId: profile.id,
      roomNumber: profile.roomNumber,
    }, session.id);
    alert('Complaint raised successfully.');
    router.push('/student/complaints');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Raise Complaint</h1>
        <p className="text-sm text-[var(--text-secondary)]">Report an issue in your room or property.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Category</label>
            <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow">
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>Cleaning</option>
              <option>Internet/Wi-Fi</option>
              <option>Others</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Priority</label>
            <select value={formData.priority} onChange={e=>setFormData({...formData, priority: e.target.value})} className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Issue Title</label>
          <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="e.g., Fan not working" className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow" />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Description</label>
          <textarea required rows={4} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="Describe the problem in detail..." className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] resize-none transition-shadow" />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Photo URL (Optional)</label>
          <input type="url" value={formData.photoUrl} onChange={e=>setFormData({...formData, photoUrl: e.target.value})} placeholder="https://..." className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow" />
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-4 mt-8">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-bold text-sm hover:bg-[var(--bg-input)] transition-colors">Cancel</button>
          <button type="submit" className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary-subtle)] hover:-translate-y-0.5 transition-transform">Submit Complaint</button>
        </div>
      </form>
    </div>
  );
}
