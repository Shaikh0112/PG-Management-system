'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { StaffRoleType } from '@/lib/api/team';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/components/owner/OwnerPropertyContext';
import { ArrowLeft, UserPlus, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties } = useOwnerPropertyContext();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ email: string, password: string, loginUrl: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleType: 'manager' as StaffRoleType,
    assignedPropertyIds: [] as string[],
    salary: 15000,
    joinDate: new Date().toISOString().split('T')[0],
    shift: 'Flexible' as 'Morning' | 'Evening' | 'Night' | 'Flexible',
    permissions: {
      canEditRent: false,
      canAddExpense: false,
      canOnboardTenant: false,
      canBroadcast: false,
      canCollectCash: false
    }
  });

  const handlePropertyToggle = (propId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedPropertyIds.includes(propId);
      if (isSelected) {
        return { ...prev, assignedPropertyIds: prev.assignedPropertyIds.filter(id => id !== propId) };
      } else {
        return { ...prev, assignedPropertyIds: [...prev.assignedPropertyIds, propId] };
      }
    });
  };

  const handlePermissionToggle = (key: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (formData.assignedPropertyIds.length === 0) {
      setError('Please assign at least one property to this staff member.');
      return;
    }

    setSubmitting(true);
    try {
      api.team.createTeamMember(formData, user.id);
      
      const loginUrl = formData.roleType === 'manager' ? '/manager/login' : '/staff/login';
      setSuccessData({
        email: formData.email,
        password: formData.password,
        loginUrl
      });

    } catch (err: any) {
      setError(err.message || 'Failed to create team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!successData) return;
    const text = `Login URL: ${window.location.origin}${successData.loginUrl}\nEmail: ${successData.email}\nPassword: ${successData.password}`;
    navigator.clipboard.writeText(text);
    alert('Copied credentials to clipboard!');
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div className="bg-[var(--bg-card)] border border-[var(--success)] rounded-[var(--radius-lg,12px)] p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto text-[var(--success)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Team Member Created!</h2>
            <p className="text-[var(--text-secondary)] text-sm">
              They can now log in using the credentials below. They will be forced to change this password on their first login.
            </p>
          </div>

          <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-6 text-left space-y-4 max-w-md mx-auto relative">
            <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] bg-[var(--bg-input)] rounded-md transition-colors" title="Copy to clipboard">
              <Copy className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-[var(--text-secondary)] mb-1">Login URL</div>
              <div className="font-mono text-sm text-[var(--primary)]">{window.location.origin}{successData.loginUrl}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] mb-1">Email</div>
              <div className="font-mono text-sm text-[var(--text-primary)]">{successData.email}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] mb-1">Temporary Password</div>
              <div className="font-mono text-sm text-[var(--text-primary)]">{successData.password}</div>
            </div>
          </div>

          <Link href="/owner/team" className="inline-block mt-4 bg-[var(--primary)] text-white px-6 py-2.5 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors text-sm">
            Back to Team Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/owner/team" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Onboard New Team Member</h1>
          <p className="text-sm text-[var(--text-secondary)]">Create a profile for a manager or staff member and generate their login.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--danger-bg)] border border-[var(--danger)] text-[var(--danger)] rounded-[var(--radius-md,8px)] flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Personal Details & Role</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Full Name *</label>
              <input 
                required type="text" placeholder="e.g. Rahul Kumar"
                value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Phone Number *</label>
              <input 
                required type="text" placeholder="e.g. +91 9876543210"
                value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Role Profile *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1">
                {[
                  { id: 'manager', label: 'Manager' },
                  { id: 'cook', label: 'Cook / Chef' }
                ].map(role => (
                  <label 
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-[var(--radius-md,8px)] border cursor-pointer transition-colors ${
                      formData.roleType === role.id 
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' 
                        : 'border-[var(--border)] bg-[var(--bg-input)] hover:border-[var(--primary-subtle)]'
                    }`}
                  >
                    <input 
                      type="radio" name="roleType" value={role.id}
                      checked={formData.roleType === role.id}
                      onChange={() => setFormData(p => ({...p, roleType: role.id as StaffRoleType}))}
                      className="accent-[var(--primary)]"
                    />
                    <span className={`text-sm font-medium ${formData.roleType === role.id ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                      {role.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Property Assignment</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Select which properties this staff member can access.</p>
          </div>
          <div className="p-6">
            {properties.length === 0 ? (
              <p className="text-sm text-[var(--danger)]">You have no properties. Please create a property first.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map(prop => (
                  <label key={prop.id} className={`flex items-start gap-3 p-4 rounded-[var(--radius-md,8px)] border cursor-pointer transition-colors ${
                    formData.assignedPropertyIds.includes(prop.id)
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                      : 'border-[var(--border)] bg-[var(--bg-input)] hover:border-[var(--primary-subtle)]'
                  }`}>
                    <input 
                      type="checkbox"
                      className="mt-1 accent-[var(--primary)] w-4 h-4"
                      checked={formData.assignedPropertyIds.includes(prop.id)}
                      onChange={() => handlePropertyToggle(prop.id)}
                    />
                    <div>
                      <div className={`font-semibold text-sm ${formData.assignedPropertyIds.includes(prop.id) ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                        {prop.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">{prop.address}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Login Credentials</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Login Email *</label>
              <input 
                required type="email" placeholder="e.g. rahul@pg.com"
                value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Temporary Password *</label>
              <input 
                required type="text" placeholder="e.g. Staff@123" minLength={6}
                value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">They will be forced to change this upon first login.</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Employment Terms</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Monthly Salary (₹)</label>
              <input 
                required type="number" min="0"
                value={formData.salary} onChange={e => setFormData(p => ({...p, salary: parseInt(e.target.value)||0}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Join Date</label>
              <input 
                required type="date"
                value={formData.joinDate} onChange={e => setFormData(p => ({...p, joinDate: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Working Shift</label>
              <select
                value={formData.shift} onChange={e => setFormData(p => ({...p, shift: e.target.value as any}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>

        {formData.roleType === 'manager' && (
          <div className="bg-[var(--bg-card)] border border-[var(--primary)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <div className="p-4 border-b border-[var(--primary-subtle)] bg-[rgba(99,102,241,0.05)]">
              <h2 className="text-base font-semibold text-[var(--primary)]">Manager Permissions</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Control what this manager can do inside the Manager Portal.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'canEditRent', label: 'Edit Rent Amounts', desc: 'Allow manager to modify monthly rent during check-in.' },
                  { key: 'canCollectCash', label: 'Collect Cash Payments', desc: 'Allow manager to log manual cash/UPI receipts.' },
                  { key: 'canAddExpense', label: 'Add Expenses', desc: 'Allow manager to record property maintenance expenses.' },
                  { key: 'canOnboardTenant', label: 'Onboard Tenants', desc: 'Allow manager to add new tenants to the system.' },
                  { key: 'canBroadcast', label: 'Send Broadcasts', desc: 'Allow manager to send announcements to all tenants.' }
                ].map(perm => (
                  <label key={perm.key} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] cursor-pointer hover:border-[var(--primary-subtle)] transition-colors">
                    <input 
                      type="checkbox"
                      className="mt-1 accent-[var(--primary)] w-4 h-4"
                      checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                      onChange={() => handlePermissionToggle(perm.key as keyof typeof formData.permissions)}
                    />
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{perm.label}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{perm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-4">
          <Link 
            href="/owner/team"
            className="px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={submitting}
            className="bg-[var(--primary)] text-white px-8 py-2.5 rounded-[var(--radius-md,8px)] font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? 'Creating...' : 'Create Team Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
