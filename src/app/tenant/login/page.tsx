'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setSession } from '@/lib/auth/session';

export default function TenantLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = api.auth.login({ email, password, expectedRole: 'tenant' });
      setSession(user);
      router.push('/tenant/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[var(--radius-lg,12px)] max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">Tenant Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] px-4 py-2 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] px-4 py-2 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]" />
          </div>
          
          {error && <div className="text-[var(--danger)] text-sm bg-[var(--danger-bg)] p-3 rounded-md">{error}</div>}
          
          <button type="submit" className="w-full bg-[var(--primary)] text-white font-medium py-2 rounded-[var(--radius-md,8px)] hover:bg-[var(--primary-hover)] transition-colors">
            Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-[var(--bg-page)] rounded-md border border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <strong>Demo Credentials:</strong><br/>
          Email: james.b@example.com<br/>
          Password: Tenant@123
        </div>
      </div>
    </div>
  );
}
