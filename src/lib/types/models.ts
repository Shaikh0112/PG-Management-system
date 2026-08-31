import { BaseEntity, Role } from './index';

export interface User extends BaseEntity {
  role: Role;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  mustChangePassword?: boolean;
  ownerId?: string;
  propertyId?: string;
  assignedPropertyIds?: string[];
  linkedStudentId?: string;
}
