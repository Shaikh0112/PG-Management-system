'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { SessionUser } from '@/lib/types';
import { Lock, AlertTriangle, Key } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

interface ForcePasswordChangeModalProps {
  user: SessionUser | null;
  onSuccess: () => void;
}

export function ForcePasswordChangeModal({ user, onSuccess }: ForcePasswordChangeModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !user.mustChangePassword) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      api.auth.changePassword(user.id, password);
      
      // Update session to reflect password changed
      const currentSession = getSession();
      if (currentSession) {
        currentSession.mustChangePassword = false;
        localStorage.setItem('spg_current_session', JSON.stringify(currentSession));
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/5 border-b border-[var(--border)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-orange-500/30">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Security Requirement</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
            Since this is your first time logging in, you must change the temporary password provided to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger)] text-[var(--danger)] rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
