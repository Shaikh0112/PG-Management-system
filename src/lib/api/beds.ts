import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';
import { BaseEntity } from '../types';

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked';

export interface Bed extends BaseEntity {
  roomId: string;
  propertyId: string;
  code: string; // e.g., 'A', 'B', 'C'
  status: BedStatus;
  tenantId?: string; // Optional reference if occupied
}

export const bedsApi = {
  listByRoom: (roomId: string): Bed[] => {
    const beds = db.getAll<Bed>(STORAGE_KEYS.BEDS);
    return beds.filter(b => b.roomId === roomId && !b.isDeleted).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  },

  listByProperty: (propertyId: string): Bed[] => {
    const beds = db.getAll<Bed>(STORAGE_KEYS.BEDS);
    return beds.filter(b => b.propertyId === propertyId && !b.isDeleted);
  },

  getById: (id: string): Bed | null => {
    return db.getById<Bed>(STORAGE_KEYS.BEDS, id) || null;
  },

  create: (data: Omit<Bed, keyof BaseEntity | 'id'> & { actorId: string }): Bed => {
    const newBed: Bed = {
      ...data,
      id: createId('bed'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.actorId,
      updatedBy: data.actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.BEDS, newBed);
    return newBed;
  },

  updateStatus: (id: string, status: BedStatus, actorId: string): Bed | null => {
    return db.update<Bed>(STORAGE_KEYS.BEDS, id, { 
      status, 
      updatedAt: new Date().toISOString(), 
      updatedBy: actorId 
    });
  }
};
