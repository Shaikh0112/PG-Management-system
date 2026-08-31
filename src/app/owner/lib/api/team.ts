import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { BaseEntity, Role } from '../types';
import { User } from '@/lib/types/models';

export type StaffRoleType = 'manager' | 'cook' | 'guard' | 'cleaner';

export interface StaffPermissions {
  canEditRent: boolean;
  canAddExpense: boolean;
  canOnboardStudent: boolean;
  canBroadcast: boolean;
  canCollectCash: boolean;
}

export interface StaffProfile extends BaseEntity {
  userId: string;
  ownerId: string;
  staffType: StaffRoleType;
  salary: number;
  joinDate: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Flexible';
  permissions: StaffPermissions;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  phone: string;
  password?: string;
  roleType: StaffRoleType; // 'manager' maps to Role 'manager', others to Role 'staff'
  assignedPropertyIds: string[];
  salary: number;
  joinDate: string;
  shift: StaffProfile['shift'];
  permissions?: StaffPermissions;
}

export interface TeamMember {
  user: User;
  profile: StaffProfile;
}

export const teamApi = {
  createTeamMember: (data: CreateStaffDto, actorId: string): TeamMember => {
    // Check email uniqueness
    const existingUsers = db.getAll<User>(STORAGE_KEYS.USERS);
    if (existingUsers.some(u => u.email && u.email.toLowerCase() === data.email.toLowerCase() && !u.isDeleted)) {
      throw new Error('A user with this email already exists.');
    }

    const actualRole: Role = data.roleType === 'manager' ? 'manager' : 'staff';

    const newUser: User = {
      id: createId('usr'),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || 'Temp@123', // Owner provided temporary password
      role: actualRole,
      status: 'Active',
      mustChangePassword: true, // Core rule: must change on first login
      ownerId: actorId, // They belong to this owner
      assignedPropertyIds: data.assignedPropertyIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };

    const newProfile: StaffProfile = {
      id: createId('stf'),
      userId: newUser.id,
      ownerId: actorId,
      staffType: data.roleType,
      salary: data.salary,
      joinDate: data.joinDate,
      shift: data.shift,
      permissions: data.permissions || {
        canEditRent: false,
        canAddExpense: false,
        canOnboardStudent: false,
        canBroadcast: false,
        canCollectCash: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    };

    // Save to DB
    db.insert(STORAGE_KEYS.USERS, newUser);
    db.insert(STORAGE_KEYS.STAFF, newProfile);

    // Audit Log
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'STAFF_CREATED',
      actorId,
      targetId: newUser.id,
      details: `Created ${actualRole} (${data.roleType}) ${data.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId,
      updatedBy: actorId,
      isDeleted: false
    } as any);

    return { user: newUser, profile: newProfile };
  },

  listByOwner: (ownerId: string): TeamMember[] => {
    const allProfiles = db.getAll<StaffProfile>(STORAGE_KEYS.STAFF).filter(p => p.ownerId === ownerId && !p.isDeleted);
    const allUsers = db.getAll<User>(STORAGE_KEYS.USERS).filter(u => !u.isDeleted);

    const team: TeamMember[] = [];
    allProfiles.forEach(profile => {
      const user = allUsers.find(u => u.id === profile.userId);
      if (user) {
        team.push({ user, profile });
      }
    });

    // Sort by role (managers first) then name
    return team.sort((a, b) => {
      if (a.user.role !== b.user.role) return a.user.role === 'manager' ? -1 : 1;
      return a.user.name.localeCompare(b.user.name);
    });
  },

  getStaffProfileByUserId: (userId: string): StaffProfile | null => {
    return db.getAll<StaffProfile>(STORAGE_KEYS.STAFF).find(p => p.userId === userId && !p.isDeleted) || null;
  },

  getTeamMemberById: (userId: string): TeamMember | null => {
    const user = db.getById<User>(STORAGE_KEYS.USERS, userId);
    if (!user || user.isDeleted) return null;
    
    const profile = db.getAll<StaffProfile>(STORAGE_KEYS.STAFF).find(p => p.userId === userId && !p.isDeleted);
    if (!profile) return null;

    return { user, profile };
  }
};
