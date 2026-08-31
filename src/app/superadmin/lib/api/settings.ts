import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';

export interface PlatformSettings {
  id: string;
  otpEnabled: boolean;
  defaultNightEntryTime: string;
  defaultNoticeDays: number;
  supportPhone: string;
  maintenanceMode: boolean;
  whatsappEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export const settingsApi = {
  getSettings(): PlatformSettings {
    const records = db.getAll<PlatformSettings>('spg_settings' as any);
    if (records.length > 0) {
      return records[0];
    }
    // Default settings if not seeded
    const def: PlatformSettings = {
      id: 'set_1',
      otpEnabled: false,
      defaultNightEntryTime: '22:00',
      defaultNoticeDays: 30,
      supportPhone: '+91 9999999999',
      maintenanceMode: false,
      whatsappEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      isDeleted: false
    };
    db.insert('spg_settings' as any, def as any);
    return def;
  },
  
  updateSettings(data: Partial<PlatformSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...data };
    db.update<PlatformSettings>('spg_settings' as any, current.id, updated);
    
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'SETTINGS_UPDATED',
      actorId: 'superadmin',
      targetId: 'platform',
      details: 'Platform settings were updated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'superadmin',
      updatedBy: 'superadmin',
      isDeleted: false
    });
    
    return updated;
  },

  exportDatabase(): string {
    if (typeof window === 'undefined') return '{}';
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('spg_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  },

  importDatabase(jsonData: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = JSON.parse(jsonData);
      // Clear existing spg_ keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('spg_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Import new data
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('spg_')) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }
};
