'use client';

import { useState, useEffect } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { useTenantContext } from '@/app/tenant/components/TenantContext';
import { getSession } from '@/lib/auth/session';
import { User, Shield, Star, Award, TrendingUp, TrendingDown } from 'lucide-react';

export default function TenantProfilePage() {
  const { profile } = useTenantContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [formData, setFormData] = useState({ phone: '', parentName: '', parentPhone: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.user?.phone || '',
        parentName: profile.parentName || '',
        parentPhone: profile.parentPhone || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !session) return;
    tenantOperationsApi.updateProfile(profile.id, formData, session.id);
    alert('Profile updated successfully.');
    window.location.reload();
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">My Profile</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your personal and emergency contact details.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 bg-[var(--bg-card)] text-[var(--primary)] rounded-full flex items-center justify-center text-3xl font-black border-4 border-[var(--bg-card)] shadow-lg">
              {session?.name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-8 px-6 text-center relative z-10">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">{session?.name}</h2>
          <p className="text-[var(--text-secondary)] font-medium mt-1">{session?.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-page)] border border-[var(--border)] rounded-full text-sm font-bold text-[var(--text-primary)] shadow-sm">
            <span>Room {profile.roomNumber}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></span>
            <span>Bed {profile.bedId}</span>
          </div>

        <div className="border-t border-[var(--border)] pt-6 mt-2">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-page)] rounded-xl p-4 border border-[var(--border)]">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${profile.pgScore >= 90 ? 'border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]' : profile.pgScore < 50 ? 'border-[var(--danger)] bg-[var(--danger-bg)] text-[var(--danger)]' : 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]'}`}>
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Your PG Score</div>
                <div className="text-2xl font-black text-[var(--text-primary)]">{profile.pgScore} <span className="text-sm font-medium text-[var(--text-secondary)]">/ 100</span></div>
              </div>
            </div>
            
            <div className="text-left sm:text-right text-sm">
              {profile.pgScore >= 90 ? (
                <div className="flex items-center sm:justify-end gap-1 text-[var(--success)] font-semibold">
                  <Award className="w-4 h-4" /> Excellent! Eligible for discounts.
                </div>
              ) : profile.pgScore >= 70 ? (
                <div className="flex items-center sm:justify-end gap-1 text-[var(--primary)] font-semibold">
                  <TrendingUp className="w-4 h-4" /> Good standing. Keep it up!
                </div>
              ) : (
                <div className="flex items-center sm:justify-end gap-1 text-[var(--danger)] font-semibold">
                  <TrendingDown className="w-4 h-4" /> Pay rent on time to improve score.
                </div>
              )}
              {profile.discountApplied && (
                <div className="mt-1 text-xs bg-[var(--success)] text-white px-2 py-0.5 rounded inline-block">5% Discount Applied Next Month</div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
        <div>
          <h3 className="font-black text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            Contact Info
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-black text-lg text-[var(--text-primary)] border-t border-[var(--border)] pt-8 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            Emergency Contacts
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Parent / Guardian Name</label>
              <input type="text" value={formData.parentName} onChange={e=>setFormData({...formData, parentName: e.target.value})} className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Parent / Guardian Phone</label>
              <input type="tel" value={formData.parentPhone} onChange={e=>setFormData({...formData, parentPhone: e.target.value})} className="w-full bg-[var(--bg-page)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-primary)] transition-shadow" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex justify-end">
          <button type="submit" className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary-subtle)] hover:-translate-y-0.5 transition-transform">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
