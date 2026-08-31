import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity } from '@/lib/types';

export interface StaffAttendance extends BaseEntity {
  propertyId: string;
  staffUserId: string; // the userId of the staff
  date: string; // YYYY-MM-DD
  status: 'present';
  markedAt: string; // ISO timestamp
}

export const attendanceApi = {
  markPresent: (propertyId: string, staffUserId: string): StaffAttendance => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked
    const existing = db.getAll<StaffAttendance>(STORAGE_KEYS.STAFF_ATTENDANCE || 'spg_staff_attendance')
      .find(a => a.propertyId === propertyId && a.staffUserId === staffUserId && a.date === today && !a.isDeleted);
      
    if (existing) return existing;

    const record: StaffAttendance = {
      id: createId('att'),
      propertyId,
      staffUserId,
      date: today,
      status: 'present',
      markedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: staffUserId,
      updatedBy: staffUserId,
      isDeleted: false
    };

    db.insert(STORAGE_KEYS.STAFF_ATTENDANCE || 'spg_staff_attendance', record);
    return record;
  },

  getTodayStatus: (propertyId: string, staffUserId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.getAll<StaffAttendance>(STORAGE_KEYS.STAFF_ATTENDANCE || 'spg_staff_attendance')
      .find(a => a.propertyId === propertyId && a.staffUserId === staffUserId && a.date === today && !a.isDeleted);
    return !!existing;
  },

  getAttendanceByOwner: (ownerId: string, date: string): StaffAttendance[] => {
    // Get all properties for this owner
    const properties = db.getAll<any>(STORAGE_KEYS.PROPERTIES).filter(p => p.ownerId === ownerId && !p.isDeleted);
    const propertyIds = properties.map(p => p.id);
    
    return db.getAll<StaffAttendance>(STORAGE_KEYS.STAFF_ATTENDANCE || 'spg_staff_attendance')
      .filter(a => propertyIds.includes(a.propertyId) && a.date === date && !a.isDeleted);
  }
};
