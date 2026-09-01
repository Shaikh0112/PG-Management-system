// @ts-nocheck
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';

export interface UsageLog {
  id: string;
  propertyId: string;
  itemName: string;
  quantity: number;
  unit: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Other';
  loggedBy: string; // Cook's ID
  date: string;
  createdAt: string;
}

export const usageLogsApi = {
  getByProperty: (propertyId: string): UsageLog[] => {
    return db.getAll<UsageLog>('spg_usage_logs')
      .filter(l => l.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  create: (data: Omit<UsageLog, 'id' | 'createdAt'>) => {
    const newLog: UsageLog = {
      ...data,
      id: createId('usg'),
      createdAt: new Date().toISOString()
    };
    db.insert('spg_usage_logs', newLog);
    return newLog;
  }
};
