// @ts-nocheck
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity, User } from '@/lib/types';

export interface StudentProfile extends BaseEntity {
  userId: string;
  propertyId: string;
  roomId?: string;
  bedId?: string;
  status: 'active' | 'on_notice' | 'checked_out';
  duesAmount: number;
  walletBalance: number;
  rentAmount: number;
  noticeDate?: string;
  checkoutDate?: string;
  pgScore: number;
  parentName?: string;
  parentPhone?: string;
  hasMessFacility?: boolean;
  stayStartDate?: string;
  stayEndDate?: string;
  pendingReferralRewards?: number;
  aadharNumber?: string;
  panNumber?: string;
  discountApplied?: boolean;
}

export interface StudentMember {
  user: User;
  profile: StudentProfile;
}

export const studentsApi = {
  listByOwner: (ownerId: string): StudentMember[] => {
    // Find all properties owned by this owner
    const ownerProps = db.getAll<any>(STORAGE_KEYS.PROPERTIES)
                         .filter(p => p.ownerId === ownerId)
                         .map(p => p.id);
    
    // Find students in these properties
    const allProfiles = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS)
                          .filter(p => ownerProps.includes(p.propertyId) && !p.isDeleted);
    const allUsers = db.getAll<User>(STORAGE_KEYS.USERS).filter(u => !u.isDeleted);

    const students: StudentMember[] = [];
    allProfiles.forEach(profile => {
      const user = allUsers.find(u => u.id === profile.userId);
      if (user) {
        students.push({ user, profile });
      }
    });

    return students;
  },

  listByProperty: (propertyId: string): StudentMember[] => {
    const allProfiles = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS)
                          .filter(p => p.propertyId === propertyId && !p.isDeleted);
    const allUsers = db.getAll<User>(STORAGE_KEYS.USERS).filter(u => !u.isDeleted);

    const students: StudentMember[] = [];
    allProfiles.forEach(profile => {
      const user = allUsers.find(u => u.id === profile.userId);
      if (user) {
        students.push({ user, profile });
      }
    });

    return students;
  },

  checkoutStudent: (studentId: string, actorId: string): void => {
    const profiles = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS);
    const profile = profiles.find(p => p.id === studentId || p.userId === studentId);
    
    if (!profile) throw new Error('Student not found');

    db.update(STORAGE_KEYS.STUDENTS, profile.id, {
      status: 'checked_out',
      checkoutDate: new Date().toISOString(),
      updatedBy: actorId,
      updatedAt: new Date().toISOString()
    });

    // Update user status
    db.update(STORAGE_KEYS.USERS, profile.userId, {
      status: 'CheckedOut',
      updatedBy: actorId,
      updatedAt: new Date().toISOString()
    });

    // Free up the bed
    if (profile.bedId) {
      db.update(STORAGE_KEYS.BEDS, profile.bedId, {
        status: 'Vacant',
        studentId: undefined
      });
    }
  },

  onboardStudent: (data: any, actorId: string): void => {
    const existingUsers = db.getAll<User>(STORAGE_KEYS.USERS);
    if (existingUsers.some(u => u.email && u.email.toLowerCase() === data.email.toLowerCase() && !u.isDeleted)) {
      throw new Error('A user with this student email already exists.');
    }
    if (data.parentEmail && existingUsers.some(u => u.email && u.email.toLowerCase() === data.parentEmail.toLowerCase() && !u.isDeleted)) {
      throw new Error('A user with this parent email already exists.');
    }

    // Create Student User
    const studentUser: User = {
      id: createId('usr'),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || 'Student@123',
      role: 'student',
      status: 'Active',
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.USERS, studentUser);

    // Create Student Profile
    const studentProfile: StudentProfile = {
      id: createId('tnt'),
      userId: studentUser.id,
      propertyId: data.propertyId,
      roomId: data.roomId || undefined,
      bedId: data.bedId || undefined,
      status: 'active',
      duesAmount: 0,
      walletBalance: 0,
      rentAmount: Number(data.rentAmount) || 0,
      pgScore: 100,
      parentName: data.parentName || undefined,
      parentPhone: data.parentPhone || undefined,
      hasMessFacility: data.hasMessFacility || false,
      stayStartDate: data.stayStartDate || undefined,
      stayEndDate: data.stayEndDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.STUDENTS, studentProfile);

    // Generate Rent Schedule (Invoices)
    if (data.stayStartDate && data.stayEndDate) {
      const start = new Date(data.stayStartDate);
      const end = new Date(data.stayEndDate);
      let dues = 0;
      
      let current = new Date(start);
      while (current <= end) {
        const monthYear = current.toLocaleString('default', { month: 'short', year: 'numeric' });
        db.insert(STORAGE_KEYS.INVOICES, {
          id: createId('inv'),
          propertyId: data.propertyId,
          studentId: studentUser.id,
          amount: Number(data.rentAmount) || 0,
          status: 'Pending',
          type: 'Rent',
          dueDate: new Date(current.getFullYear(), current.getMonth(), 5).toISOString(),
          description: `Rent for ${monthYear}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: actorId,
          updatedBy: actorId,
          isDeleted: false
        });
        dues += (Number(data.rentAmount) || 0);
        current.setMonth(current.getMonth() + 1);
      }
      
      // Update initial dues
      db.update(STORAGE_KEYS.STUDENTS, studentProfile.id, {
        duesAmount: dues
      });
    }

    // Update Bed Status if provided
    if (data.bedId) {
      const beds = db.getAll<any>(STORAGE_KEYS.BEDS);
      const bed = beds.find(b => b.id === data.bedId);
      if (bed) {
        db.update(STORAGE_KEYS.BEDS, bed.id, { 
          status: 'occupied',
          studentId: studentUser.id
        });
      }
    }

    // Create Parent User (Optional)
    if (data.parentEmail) {
      const parentUser: User = {
        id: createId('usr'),
        name: data.parentName || 'Parent',
        email: data.parentEmail,
        phone: data.parentPhone,
        password: 'Parent@123',
        role: 'parent',
        status: 'Active',
        mustChangePassword: true,
        linkedStudentId: studentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: actorId,
        updatedBy: actorId,
        isDeleted: false
      };
      db.insert(STORAGE_KEYS.USERS, parentUser);
    }
  },

  listByProperty: (propertyId: string) => {
    const students = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS).filter(t => t.propertyId === propertyId && t.status === 'active' && !t.isDeleted);
    const users = db.getAll<User>(STORAGE_KEYS.USERS);
    return students.map(t => ({
      profile: t,
      user: users.find(u => u.id === t.userId)
    }));
  },

  getById: (profileId: string): StudentMember | null => {
    const profile = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS).find(p => p.id === profileId && !p.isDeleted);
    if (!profile) return null;
    const user = db.getAll<User>(STORAGE_KEYS.USERS).find(u => u.id === profile.userId && !u.isDeleted);
    if (!user) return null;
    return { user, profile };
  },

  markNotice: (profileId: string, actorId: string): void => {
    const profile = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS).find(p => p.id === profileId);
    if (profile) {
      profile.status = 'on_notice';
      profile.noticeDate = new Date().toISOString();
      profile.updatedAt = new Date().toISOString();
      profile.updatedBy = actorId;
      db.update(STORAGE_KEYS.STUDENTS, profileId, profile);
    }
  },

  checkout: (profileId: string, actorId: string): void => {
    const profile = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS).find(p => p.id === profileId);
    if (profile) {
      profile.status = 'checked_out';
      profile.checkoutDate = new Date().toISOString();
      profile.updatedAt = new Date().toISOString();
      profile.updatedBy = actorId;
      db.update(STORAGE_KEYS.STUDENTS, profileId, profile);

      // Free up bed if any
      if (profile.bedId) {
        const bed = db.getAll<any>(STORAGE_KEYS.BEDS).find(b => b.id === profile.bedId);
        if (bed) {
          bed.status = 'available';
          db.update(STORAGE_KEYS.BEDS, bed.id, bed);
        }
      }
    }
  },

  // Mock generator just to show data if empty
  seedMocksIfEmpty: (ownerId: string) => {
    const profiles = db.getAll<StudentProfile>(STORAGE_KEYS.STUDENTS);
    if (profiles.length > 0) return; // Already seeded

    const ownerProps = db.getAll<any>(STORAGE_KEYS.PROPERTIES).filter(p => p.ownerId === ownerId);
    if (ownerProps.length === 0) return;

    const propId = ownerProps[0].id;
    
    // Create 3 fake students
    const mockData = [
      { name: 'Amit Singh', email: 'amit@example.com', phone: '9876543211', dues: 0, status: 'active' },
      { name: 'Rahul Verma', email: 'rahul@example.com', phone: '9876543212', dues: 5000, status: 'on_notice' },
      { name: 'Priya Das', email: 'priya@example.com', phone: '9876543213', dues: 0, status: 'checked_out' }
    ];

    mockData.forEach(d => {
      const uId = createId('usr');
      const pId = createId('tnt');
      
      db.insert(STORAGE_KEYS.USERS, {
        id: uId, name: d.name, email: d.email, phone: d.phone, password: 'Password123',
        role: 'student', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        createdBy: 'system', updatedBy: 'system', isDeleted: false
      });

      db.insert(STORAGE_KEYS.STUDENTS, {
        id: pId, userId: uId, propertyId: propId, status: d.status as any,
        duesAmount: d.dues, walletBalance: 1000, rentAmount: 8500, pgScore: 85,
        parentName: 'Mr. ' + d.name.split(' ')[1], parentPhone: '9998887776',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        createdBy: 'system', updatedBy: 'system', isDeleted: false
      });
    });
  }
};
