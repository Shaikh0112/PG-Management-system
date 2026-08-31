import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity } from '@/lib/types';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type MealStatusType = 'pending' | 'ready' | 'announced';

export interface MealStatus extends BaseEntity {
  propertyId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  status: MealStatusType;
}

export const mealsApi = {
  getTodayMealStatus: (propertyId: string): Record<MealType, MealStatusType> => {
    const today = new Date().toISOString().split('T')[0];
    const allStatuses = db.getAll<MealStatus>(STORAGE_KEYS.MEAL_STATUS)
      .filter(m => m.propertyId === propertyId && m.date === today && !m.isDeleted);
    
    return {
      Breakfast: allStatuses.find(m => m.mealType === 'Breakfast')?.status || 'pending',
      Lunch: allStatuses.find(m => m.mealType === 'Lunch')?.status || 'pending',
      Dinner: allStatuses.find(m => m.mealType === 'Dinner')?.status || 'pending'
    };
  },

  getAllTodayStatuses: (propertyId: string): MealStatus[] => {
    const today = new Date().toISOString().split('T')[0];
    return db.getAll<MealStatus>(STORAGE_KEYS.MEAL_STATUS)
      .filter(m => m.propertyId === propertyId && m.date === today && !m.isDeleted);
  },

  markMealReady: (propertyId: string, mealType: MealType, actorId: string): void => {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.getAll<MealStatus>(STORAGE_KEYS.MEAL_STATUS)
      .find(m => m.propertyId === propertyId && m.date === today && m.mealType === mealType && !m.isDeleted);
      
    if (existing) {
      if (existing.status !== 'announced') {
        db.update(STORAGE_KEYS.MEAL_STATUS, existing.id, {
          status: 'ready',
          updatedAt: new Date().toISOString(),
          updatedBy: actorId
        });
      }
    } else {
      const newStatus: MealStatus = {
        id: createId('msl'),
        propertyId,
        date: today,
        mealType,
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: actorId,
        updatedBy: actorId,
        isDeleted: false
      };
      db.insert(STORAGE_KEYS.MEAL_STATUS, newStatus);
    }
  },

  announceMeal: (propertyId: string, mealType: MealType, actorId: string): void => {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.getAll<MealStatus>(STORAGE_KEYS.MEAL_STATUS)
      .find(m => m.propertyId === propertyId && m.date === today && m.mealType === mealType && !m.isDeleted);
      
    if (existing) {
      db.update(STORAGE_KEYS.MEAL_STATUS, existing.id, {
        status: 'announced',
        updatedAt: new Date().toISOString(),
        updatedBy: actorId
      });
    } else {
      const newStatus: MealStatus = {
        id: createId('msl'),
        propertyId,
        date: today,
        mealType,
        status: 'announced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: actorId,
        updatedBy: actorId,
        isDeleted: false
      };
      db.insert(STORAGE_KEYS.MEAL_STATUS, newStatus);
    }

    // Create a broadcast announcement
    const broadcast = {
      id: createId('brd'),
      propertyId,
      title: `${mealType} is Ready!`,
      message: `The cook has prepared ${mealType}. Please proceed to the dining area.`,
      targetAudience: 'students',
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.BROADCASTS, broadcast as any);
  }
};
