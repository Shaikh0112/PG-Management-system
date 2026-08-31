// @ts-nocheck
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';

export interface StockItem {
  id: string;
  propertyId: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
  expiryDate?: string;
  updatedAt: string;
}

export const stockApi = {
  getByProperty: (propertyId: string): StockItem[] => {
    return db.getAll<StockItem>(STORAGE_KEYS.INVENTORY || 'spg_inventory')
      .filter(i => i.propertyId === propertyId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  
  add: (data: Omit<StockItem, 'id' | 'updatedAt'>) => {
    const newItem: StockItem = {
      ...data,
      id: createId('stk'),
      updatedAt: new Date().toISOString()
    };
    db.insert(STORAGE_KEYS.INVENTORY || 'spg_inventory', newItem);
    return newItem;
  },

  update: (id: string, updates: Partial<Omit<StockItem, 'id' | 'propertyId'>>) => {
    const existing = db.getById<StockItem>(STORAGE_KEYS.INVENTORY || 'spg_inventory', id);
    if (!existing) throw new Error('Stock item not found');
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db.update(STORAGE_KEYS.INVENTORY || 'spg_inventory', id, updated);
    return updated;
  },

  delete: (id: string) => {
    db.delete(STORAGE_KEYS.INVENTORY || 'spg_inventory', id);
  }
};
