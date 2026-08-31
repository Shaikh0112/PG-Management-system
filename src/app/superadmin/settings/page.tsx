'use client';
import { useState, useEffect } from 'react';
import { settingsApi, PlatformSettings } from '@/lib/api/settings';
import { Settings, Save, ShieldAlert, Clock, Smartphone, Info, Database, Download, Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/lib/ui/ToastContext';

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = import('react').then(React => React.createRef<HTMLInputElement>());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setSettings(settingsApi.getSettings());
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!settings) return;
    setSaving(true);
    settingsApi.updateSettings(settings);
    setTimeout(() => {
      setSaving(false);
      showToast('Platform settings saved successfully.', 'success');
    }, 500); // simulate network
  };

  const handleExport = () => {
    const data = settingsApi.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpg_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('WARNING: Importing a database will completely overwrite all existing data. Are you sure you want to continue?')) {
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = settingsApi.importDatabase(content);
        if (success) {
          showToast('Database imported successfully. Reloading...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast('Failed to import database. Invalid format.', 'error');
        }
      }
      setIsImporting(false);
    };
    reader.onerror = () => {
      showToast('Error reading file', 'error');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  if (loading || !settings) return <div className="animate-pulse p-6">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Platform Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">Configure core behaviors for the SmartPG network.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Security & Access */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Security & Operations</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-[var(--radius-md,8px)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e=>setSettings({...settings, maintenanceMode: e.target.checked})} className="w-4 h-4 text-[var(--primary)] bg-[var(--bg-input)] border-[var(--border)] rounded" />
              <div>
                <div className="font-medium text-[var(--text-primary)] text-sm">Maintenance Mode</div>
                <div className="text-[var(--text-secondary)] text-xs">Block all non-superadmin logins and show a maintenance screen.</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-[var(--radius-md,8px)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer">
              <input type="checkbox" checked={settings.otpEnabled} onChange={e=>setSettings({...settings, otpEnabled: e.target.checked})} className="w-4 h-4 text-[var(--primary)] bg-[var(--bg-input)] border-[var(--border)] rounded" />
              <div>
                <div className="font-medium text-[var(--text-primary)] text-sm">Enforce 2FA / OTP Logins</div>
                <div className="text-[var(--text-secondary)] text-xs">Require SMS OTP in addition to passwords for all Owner & Manager logins.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Defaults */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">System Defaults</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Default Night Entry Time limit</label>
              <input type="time" value={settings.defaultNightEntryTime} onChange={e=>setSettings({...settings, defaultNightEntryTime: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] text-sm focus:border-[var(--primary)] focus:outline-none" />
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">Applied to new properties unless overridden.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Default Notice Period (Days)</label>
              <input type="number" value={settings.defaultNoticeDays} onChange={e=>setSettings({...settings, defaultNoticeDays: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Communication */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Communication & Support</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Global Support Phone (visible to students)</label>
              <input type="text" value={settings.supportPhone} onChange={e=>setSettings({...settings, supportPhone: e.target.value})} className="w-full max-w-sm bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-[var(--radius-md,8px)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer max-w-sm">
              <input type="checkbox" checked={settings.whatsappEnabled} onChange={e=>setSettings({...settings, whatsappEnabled: e.target.checked})} className="w-4 h-4 text-[var(--primary)] bg-[var(--bg-input)] border-[var(--border)] rounded" />
              <div>
                <div className="font-medium text-[var(--text-primary)] text-sm">WhatsApp Integration</div>
                <div className="text-[var(--text-secondary)] text-xs">Enable global WhatsApp API for rent reminders.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
            <Info className="w-4 h-4" /> Changes take effect instantly across the network.
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>

      {/* Data Management Export / Import */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm mt-8">
        <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-bold text-[var(--text-primary)]">Data Management</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Export the entire LocalStorage database to a JSON file, or import an existing backup. Useful for demos, migrations, or backend mapping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-input)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] rounded-[var(--radius-md,8px)] transition-all font-medium text-[var(--text-primary)]"
            >
              <Download className="w-5 h-5" />
              Export JSON Backup
            </button>
            
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--danger-bg)] text-[var(--danger)] hover:bg-red-900/40 border border-[var(--danger)] rounded-[var(--radius-md,8px)] transition-all font-medium cursor-pointer">
              <Upload className="w-5 h-5" />
              {isImporting ? 'Importing...' : 'Import & Replace DB'}
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImport}
                disabled={isImporting}
              />
            </label>
          </div>

          <div className="bg-[var(--warning-bg)] border border-[var(--warning)] text-[var(--warning)] p-4 rounded-[var(--radius-md,8px)] flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Warning:</strong> Importing a JSON backup will completely wipe the current state of the application and replace it with the uploaded data. Please ensure you have exported a recent backup before importing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}