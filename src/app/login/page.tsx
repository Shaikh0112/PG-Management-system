'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setSession } from '@/lib/auth/session';
import { Shield, Briefcase, Users, Utensils, UserCheck, Heart, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/public/ThemeToggle';

const DEMO_ACCOUNTS = [
  { id: 'superadmin', label: 'SuperAdmin', email: 'leo.a@example.org', password: 'Super@123', icon: Shield },
  { id: 'owner', label: 'Owner', email: 'peter.m@example.com', password: 'Owner@123', icon: Briefcase },
  { id: 'manager', label: 'Manager', email: 'tom.h@example.org', password: 'Manager@123', icon: Users },
  { id: 'cook', label: 'Cook', email: 'ivan.p@example.net', password: 'Staff@123', icon: Utensils },
  { id: 'student', label: 'Student', email: 'james.b@example.com', password: 'Student@123', icon: UserCheck }
];

export default function UnifiedLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(DEMO_ACCOUNTS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(acc);
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = api.auth.login({ email, password });
      setSession(user);
      
      router.push(`/${user.role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Login failed. Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="absolute top-4 left-4">
        <Link href="/" className="font-bold text-xl tracking-tight text-[var(--text-primary)]">
          <span className="text-[var(--primary)]">Smart</span>PG
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Select a role below to auto-fill demo credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[var(--bg-card)] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-[var(--border)]">
          
          <div className="grid grid-cols-3 gap-3 mb-8">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = selectedRole.id === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleRoleSelect(acc)}
                  className={`flex flex-col items-center justify-center p-3 rounded-[var(--radius-md,8px)] border transition-all ${
                    isSelected 
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] ring-1 ring-[var(--primary)]' 
                      : 'border-[var(--border)] bg-[var(--bg-page)] hover:bg-[var(--border)]'
                  }`}
                >
                  <acc.icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {acc.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-md,8px)] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-[var(--radius-md,8px)] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-[var(--danger)] text-sm bg-[var(--danger-bg)] p-3 rounded-[var(--radius-md,8px)]">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[var(--radius-md,8px)] shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
