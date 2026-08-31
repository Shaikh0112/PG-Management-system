import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';

export interface FoodMenu {
  id: string;
  propertyId: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  monthEndSpecial: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export const foodApi = {
  getByProperty: (propertyId: string): FoodMenu | null => {
    const menus = db.getAll<FoodMenu>(STORAGE_KEYS.FOOD_MENUS || 'spg_food_menus');
    return menus.find(m => m.propertyId === propertyId && !m.isDeleted) || null;
  },
  
  save: (propertyId: string, data: Partial<FoodMenu>) => {
    const existing = foodApi.getByProperty(propertyId);
    if (existing) {
      db.update(STORAGE_KEYS.FOOD_MENUS || 'spg_food_menus', existing.id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { ...existing, ...data };
    } else {
      const newMenu: FoodMenu = {
        id: createId('food'),
        propertyId,
        monday: data.monday || '',
        tuesday: data.tuesday || '',
        wednesday: data.wednesday || '',
        thursday: data.thursday || '',
        friday: data.friday || '',
        saturday: data.saturday || '',
        sunday: data.sunday || '',
        monthEndSpecial: data.monthEndSpecial || '',
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };
      db.insert(STORAGE_KEYS.FOOD_MENUS || 'spg_food_menus', newMenu);
      return newMenu;
    }
  }
};
