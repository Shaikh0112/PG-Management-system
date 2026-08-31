import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity } from '@/lib/types';
import { bedsApi } from '@/app/owner/lib/api/beds';

export type RoomStatus = 'available' | 'full' | 'maintenance';

export interface Room extends BaseEntity {
  propertyId: string;
  floor: number;
  number: string;
  sharing: number;
  rentPerBed: number;
  deposit: number;
  amenities: string[];
  status: RoomStatus;
  photos: string[];
}

export const roomsApi = {
  listByProperty: (propertyId: string): Room[] => {
    const rooms = db.getAll<Room>(STORAGE_KEYS.ROOMS);
    return rooms.filter(r => r.propertyId === propertyId && !r.isDeleted)
                .sort((a, b) => {
                  if (a.floor !== b.floor) return (a.floor || 0) - (b.floor || 0);
                  return String(a.number || '').localeCompare(String(b.number || ''));
                });
  },

  getById: (id: string): Room | null => {
    return db.getById<Room>(STORAGE_KEYS.ROOMS, id) || null;
  },

  create: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'> & { actorId: string }): Room => {
    const newRoom: Room = {
      ...data,
      id: createId('room'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.actorId,
      updatedBy: data.actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.ROOMS, newRoom);

    // Generate Beds automatically based on sharing count
    // A=65, B=66, C=67, etc.
    for (let i = 0; i < data.sharing; i++) {
      const code = String.fromCharCode(65 + i); // 'A', 'B', 'C', ...
      bedsApi.create({
        roomId: newRoom.id,
        propertyId: newRoom.propertyId,
        code,
        status: 'available',
        actorId: data.actorId
      });
    }

    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'ROOM_CREATED',
      actorId: data.actorId,
      targetId: newRoom.id,
      details: `Created room ${newRoom.number} with ${data.sharing} beds`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.actorId,
      updatedBy: data.actorId,
      isDeleted: false
    } as any);

    return newRoom;
  },

  updateStatus: (id: string, status: RoomStatus, actorId: string): Room | null => {
    return db.update<Room>(STORAGE_KEYS.ROOMS, id, { 
      status, 
      updatedAt: new Date().toISOString(), 
      updatedBy: actorId 
    });
  },

  delete: (id: string, actorId: string) => {
    // Prevent delete if any bed is occupied
    const beds = bedsApi.listByRoom(id);
    if (beds.some(b => b.status === 'occupied')) {
      throw new Error('Cannot delete room with occupied beds.');
    }
    
    // Mark beds as deleted
    beds.forEach(b => {
      db.update(STORAGE_KEYS.BEDS, b.id, { isDeleted: true, updatedBy: actorId });
    });

    // Mark room as deleted
    db.update(STORAGE_KEYS.ROOMS, id, { isDeleted: true, updatedBy: actorId });

    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'ROOM_DELETED',
      actorId,
      targetId: id,
      details: `Deleted room ${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    } as any);
  }
};
