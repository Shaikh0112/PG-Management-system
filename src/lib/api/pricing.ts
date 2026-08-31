// @ts-nocheck
import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';
import { PricingRule } from '../types/contract';

export const pricingApi = {
  listByProperty: (propertyId: string): PricingRule[] => {
    return db.getAll<PricingRule>(STORAGE_KEYS.PRICING_RULES as any).filter(r => r.propertyId === propertyId && !r.isDeleted);
  },

  create: (data: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>, actorId: string): PricingRule => {
    const newRule: PricingRule = {
      ...data,
      id: createId('prc'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.PRICING_RULES as any, newRule);
    return newRule;
  },

  delete: (id: string, actorId: string) => {
    db.update<PricingRule>(STORAGE_KEYS.PRICING_RULES as any, id, { 
      isDeleted: true,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId
    });
  }
};
