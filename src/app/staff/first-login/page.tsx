'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getSession, setSession } from '@/lib/auth/session';

export default function StaffFirstLogin() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = getSession();
      if(!session) return;
      api.auth.changePassword(session.id, newPassword);
      session.mustChangePassword = false;
      setSession(session);
      router.push('/staff/dashboard');
    } catch(err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[var(--radius-lg,12px)] shadow-sm">
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4">Set Your Permanent Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] px-4 py-2" />
        </div>
        {error && <div className="text-[var(--danger)] text-sm">{error}</div>}
        <button type="submit" className="w-full bg-[var(--primary)] text-white py-2 rounded-[var(--radius-md,8px)] hover:bg-[var(--primary-hover)]">Save & Continue</button>
      </form>
    </div>
  );
}
