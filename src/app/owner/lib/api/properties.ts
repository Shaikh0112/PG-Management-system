import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity } from '../types';
import { plansApi } from '@/app/superadmin/lib/api/plans';

export interface Property extends BaseEntity {
  ownerId: string;
  name: string;
  slug: string;
  type: 'boys' | 'girls' | 'coed';
  address: string;
  city: string;
  pincode: string;
  landmark: string;
  description: string;
  contactName: string;
  contactPhone: string;
  floorsCount: number;
  amenities: string[];
  nightEntryTime: string;
  noticePeriodDays: number;
  messEnabled: boolean;
  visitorCutoff: string;
  defaultDeposit: number;
  rentCycleDate: number;
  photos: string[];
  bedsPlanned: number; // Keep for backward compatibility/dashboard stats
}

export const propertiesApi = {
  listAll: (): Property[] => {
    return db.getAll<Property>(STORAGE_KEYS.PROPERTIES).filter(p => !p.isDeleted);
  },

  listByOwner: (ownerId: string): Property[] => {
    const props = db.getAll<Property>(STORAGE_KEYS.PROPERTIES);
    return props.filter(p => p.ownerId === ownerId && !p.isDeleted);
  },

  getById: (id: string): Property | null => {
    return db.getById<Property>(STORAGE_KEYS.PROPERTIES, id) || null;
  },

  create: (data: Partial<Property> & { ownerId: string, generateRooms?: boolean, singleRoomsCount?: number, doubleRoomsCount?: number, tripleRoomsCount?: number }) => {
    // Resolve real owner ID in case user.id was passed
    const owners = db.getAll<any>(STORAGE_KEYS.OWNERS);
    const ownerRecord = owners.find(o => o.userId === data.ownerId || o.id === data.ownerId);
    const realOwnerId = ownerRecord ? ownerRecord.id : data.ownerId;

    // 1. Subscription Check
    const activeProps = propertiesApi.listByOwner(data.ownerId);
    const subs = db.getAll<any>(STORAGE_KEYS.SUBSCRIPTIONS);
    const ownerSub = subs.find(s => s.ownerId === realOwnerId && (s.status === 'Active' || s.status === 'active'));
    
    if (!ownerSub) {
      throw new Error('No active subscription found. Please purchase a plan first.');
    }

    const planId = ownerSub.planId;
    const plans = plansApi.listPlans();
    // Sometimes seeded plans are 'plan_gold' instead of 'gold' due to seed.ts difference, handle safely:
    const plan = plans.find(p => p.id === planId || `plan_${p.id}` === planId || p.id === `plan_${planId}`) || plans[0];
    
    if (activeProps.length >= plan.maxProperties) {
      throw new Error(`Subscription limit reached. Your plan allows max ${plan.maxProperties} properties.`);
    }

    // Existing Beds Calculation
    const allOwnerRooms = db.getAll<any>(STORAGE_KEYS.ROOMS).filter(r => activeProps.some(p => p.id === r.propertyId));
    const existingBedsCount = db.getAll<any>(STORAGE_KEYS.BEDS).filter(b => allOwnerRooms.some(r => r.id === b.roomId)).length;

    let newBedsCount = 0;
    if (data.generateRooms) {
      if ((data.singleRoomsCount || 0) > 0 || (data.doubleRoomsCount || 0) > 0 || (data.tripleRoomsCount || 0) > 0) {
        newBedsCount = (data.singleRoomsCount || 0) * 1 + (data.doubleRoomsCount || 0) * 2 + (data.tripleRoomsCount || 0) * 3;
      } else if (data.floorsCount && data.floorsCount > 0) {
        newBedsCount = data.floorsCount * 4 * 2; // legacy fallback: 4 rooms per floor * 2 beds
      }
    }

    if (existingBedsCount + newBedsCount > plan.maxBeds) {
      throw new Error(`Subscription limit reached. Your plan allows max ${plan.maxBeds} beds. You currently have ${existingBedsCount} beds, and are trying to add ${newBedsCount} more.`);
    }

    // 2. Generate slug if empty
    const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || createId('prop');

    const newProp: Property = {
      ...data,
      id: createId('prop'),
      ownerId: data.ownerId,
      name: data.name || 'New Property',
      slug,
      type: data.type || 'coed',
      address: data.address || '',
      city: data.city || '',
      pincode: data.pincode || '',
      landmark: data.landmark || '',
      description: data.description || '',
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      floorsCount: data.floorsCount || 0,
      amenities: data.amenities || [],
      nightEntryTime: data.nightEntryTime || '23:00',
      noticePeriodDays: data.noticePeriodDays || 30,
      messEnabled: data.messEnabled ?? false,
      visitorCutoff: data.visitorCutoff || '20:00',
      defaultDeposit: data.defaultDeposit || 0,
      rentCycleDate: data.rentCycleDate || 1,
      photos: data.photos || [],
      bedsPlanned: data.bedsPlanned || (data.floorsCount ? data.floorsCount * 10 : 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.ownerId,
      updatedBy: data.ownerId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.PROPERTIES, newProp);

    // 3. Optionally generate rooms
    if (data.generateRooms) {
      if ((data.singleRoomsCount || 0) > 0 || (data.doubleRoomsCount || 0) > 0 || (data.tripleRoomsCount || 0) > 0) {
        let roomCounter = 1;
        const createRoomsForType = (count: number, sharing: number) => {
          for (let i = 0; i < count; i++) {
            const roomNumber = `${100 + roomCounter}`; // Sequentially 101, 102...
            const roomId = createId('room');
            db.insert(STORAGE_KEYS.ROOMS, {
              id: roomId,
              propertyId: newProp.id,
              number: roomNumber,
              floor: 1,
              sharing: sharing,
              rentPerBed: newProp.defaultDeposit || 5000,
              deposit: newProp.defaultDeposit || 5000,
              amenities: [],
              status: 'available',
              photos: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: data.ownerId,
              updatedBy: data.ownerId,
              isDeleted: false
            } as any);

            // Add Beds
            const bedCodes = ['A', 'B', 'C', 'D', 'E'];
            for(let b = 0; b < sharing; b++) {
              db.insert(STORAGE_KEYS.BEDS, {
                id: createId('bed'),
                roomId,
                code: bedCodes[b] || `${b+1}`,
                status: 'vacant',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: data.ownerId,
                updatedBy: data.ownerId,
                isDeleted: false
              } as any);
            }
            roomCounter++;
          }
        };

        createRoomsForType(data.singleRoomsCount || 0, 1);
        createRoomsForType(data.doubleRoomsCount || 0, 2);
        createRoomsForType(data.tripleRoomsCount || 0, 3);
      } else if (newProp.floorsCount > 0) {
        // Fallback legacy behavior
        for (let floor = 1; floor <= newProp.floorsCount; floor++) {
          for (let room = 1; room <= 4; room++) { // 4 rooms per floor
            const roomNumber = `${floor}0${room}`;
            const roomId = createId('room');
            db.insert(STORAGE_KEYS.ROOMS, {
              id: roomId,
              propertyId: newProp.id,
              number: roomNumber,
              floor: floor,
              sharing: 2,
              rentPerBed: 5000,
              deposit: 5000,
              status: 'available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: data.ownerId,
              updatedBy: data.ownerId,
              isDeleted: false
            } as any);

            // 2 beds per room
            db.insert(STORAGE_KEYS.BEDS, {
              id: createId('bed'), roomId, code: 'A', status: 'vacant', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.ownerId, updatedBy: data.ownerId, isDeleted: false
            } as any);
            db.insert(STORAGE_KEYS.BEDS, {
              id: createId('bed'), roomId, code: 'B', status: 'vacant', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.ownerId, updatedBy: data.ownerId, isDeleted: false
            } as any);
          }
        }
      }
    }

    // 4. Audit Log
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'PROPERTY_CREATED',
      actorId: data.ownerId,
      actorRole: 'owner',
      targetId: newProp.id,
      details: `Created property ${newProp.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.ownerId,
      updatedBy: data.ownerId,
      isDeleted: false
    } as any);

    return newProp;
  }
};
