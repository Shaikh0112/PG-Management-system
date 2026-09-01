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
  category?: string;
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
    db.remove(STORAGE_KEYS.INVENTORY || 'spg_inventory', id); // Fix: use remove instead of delete
  }
};

export type StockBatchStatus = 'unopened' | 'opened' | 'empty';

export interface StockBatch {
  id: string;
  propertyId: string;
  itemName: string;
  category?: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  status: StockBatchStatus;
  receivedAt: string; // Date manager fulfilled it
  openedAt?: string;  // Date cook opened it
  emptiedAt?: string; // Date cook emptied it
  isDeleted?: boolean;
}

export const stockBatchesApi = {
  getByProperty: (propertyId: string): StockBatch[] => {
    return db.getAll<StockBatch>(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches')
      .filter(b => b.propertyId === propertyId && !b.isDeleted)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  },

  addBatch: (data: Omit<StockBatch, 'id' | 'status' | 'receivedAt'>) => {
    const newBatch: StockBatch = {
      ...data,
      id: createId('sbat'),
      status: 'unopened',
      receivedAt: new Date().toISOString()
    };
    db.insert(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches', newBatch);
    return newBatch;
  },

  openBatch: (id: string) => {
    const existing = db.getById<StockBatch>(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches', id);
    if (!existing) throw new Error('Batch not found');
    db.update(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches', id, {
      status: 'opened',
      openedAt: new Date().toISOString()
    });
  },

  emptyBatch: (id: string) => {
    const existing = db.getById<StockBatch>(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches', id);
    if (!existing) throw new Error('Batch not found');
    db.update(STORAGE_KEYS.STOCK_BATCHES || 'spg_stock_batches', id, {
      status: 'empty',
      emptiedAt: new Date().toISOString()
    });
  }
};
