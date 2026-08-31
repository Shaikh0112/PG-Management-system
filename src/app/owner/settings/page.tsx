'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function OwnerSettingsPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId } = useOwnerPropertyContext();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    lateFine: 50,
    dueDate: 5,
    nightEntryTime: '22:00',
    noticeDays: 30
  });

  const property = properties.find(p => p.id === selectedPropertyId);

  // In a real app, these fields would exist on the property object in DB.
  // We'll simulate loading them (or just defaulting).

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSaving(true);
    setSuccess(false);
    
    // Simulate API update delay
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  if (selectedPropertyId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Settings className="w-16 h-16 text-[var(--text-secondary)] opacity-30 mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Select a Property</h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          Settings are configured on a per-property basis. Please select a specific property from the header dropdown above to configure its rules.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Property Rules & Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Configure {property?.name}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Financial Rules</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Rent Due Date (Day of Month)</label>
              <input 
                type="number" min="1" max="31"
                value={formData.dueDate} onChange={e => setFormData(p => ({...p, dueDate: parseInt(e.target.value)}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Late Fine Per Day (₹)</label>
              <input 
                type="number" min="0"
                value={formData.lateFine} onChange={e => setFormData(p => ({...p, lateFine: parseInt(e.target.value)}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Operational Rules</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Notice Period (Days)</label>
              <input 
                type="number" min="1"
                value={formData.noticeDays} onChange={e => setFormData(p => ({...p, noticeDays: parseInt(e.target.value)}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">Days tenant must serve before leaving.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Night Entry Cutoff Time</label>
              <input 
                type="time"
                value={formData.nightEntryTime} onChange={e => setFormData(p => ({...p, nightEntryTime: e.target.value}))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">Triggers alert for parents/managers if late.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {success ? (
            <div className="text-sm font-medium text-[var(--success)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Settings saved!
            </div>
          ) : <div />}
          <button 
            type="submit"
            disabled={saving}
            className="bg-[var(--primary)] text-white px-8 py-2.5 rounded-[var(--radius-md,8px)] font-bold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 text-sm flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
