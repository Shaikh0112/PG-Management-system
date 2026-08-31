export * from './models';
export type Role = 'superadmin' | 'owner' | 'manager' | 'staff' | 'tenant' | 'parent';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
}

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  propertyId?: string;
  ownerId?: string;
  assignedPropertyIds?: string[];
  mustChangePassword?: boolean;
}
