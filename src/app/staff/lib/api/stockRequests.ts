// @ts-nocheck
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';

export type StockRequestStatus = 'pending' | 'purchased' | 'verified';

export interface StockRequest {
  id: string;
  propertyId: string;
  itemName: string;
  quantityRequested: number;
  unit: string;
  status: StockRequestStatus;
  requestedBy: string; // user ID of the cook
  price?: number; // Added by manager
  createdAt: string;
  updatedAt: string;
}

export const stockRequestsApi = {
  getByProperty: (propertyId: string): StockRequest[] => {
    return db.getAll<StockRequest>(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests')
      .filter(r => r.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: (data: { propertyId: string, itemName: string, quantityRequested: number, unit: string, requestedBy: string }) => {
    const newRequest: StockRequest = {
      ...data,
      id: createId('srq'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.insert(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests', newRequest);
    return newRequest;
  },

  markPurchased: (id: string, price: number, managerId: string) => {
    const existing = db.getById<StockRequest>(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests', id);
    if (!existing) throw new Error('Stock request not found');
    
    const updated = {
      ...existing,
      status: 'purchased' as StockRequestStatus,
      price,
      updatedAt: new Date().toISOString()
    };
    db.update(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests', id, updated);

    // Automatically create an Expense when marked purchased
    const { financeApi } = require('@/app/owner/lib/api/finance');
    financeApi.createExpense({
      propertyId: existing.propertyId,
      category: 'groceries',
      amount: price,
      description: `Purchased Grocery: ${existing.itemName} (${existing.quantityRequested}${existing.unit})`
    }, managerId);

    return updated;
  },

  verifyReceipt: (id: string, actualQuantity: number, unit: string, expiryDate?: string) => {
    const existing = db.getById<StockRequest>(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests', id);
    if (!existing) throw new Error('Stock request not found');
    
    const updated = {
      ...existing,
      status: 'verified' as StockRequestStatus,
      updatedAt: new Date().toISOString()
    };
    db.update(STORAGE_KEYS.KITCHEN_REQUESTS || 'spg_stock_requests', id, updated);

    // Add to Batches
    const { stockBatchesApi } = require('./stock');
    
    stockBatchesApi.addBatch({
      propertyId: existing.propertyId,
      itemName: existing.itemName,
      quantity: actualQuantity,
      unit: unit,
      category: 'Groceries',
      expiryDate
    });

    return updated;
  }
};
