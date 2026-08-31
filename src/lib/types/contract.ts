/**
 * Data Contract Freeze - Core Types
 * 
 * This file defines the standard data models for the PG SaaS application.
 * All properties must include an `id`, `createdAt`, `updatedAt` (ISO date strings),
 * and when applicable, `ownerId` and `propertyId` to ensure multi-tenant isolation.
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'owner' | 'manager' | 'staff' | 'tenant' | 'parent';
  password?: string; 
  ownerId?: string; // If applicable
  status: 'active' | 'inactive' | 'suspended';
}

export interface PricingRule extends BaseEntity {
  propertyId: string;
  name: string; // e.g. "Summer Hike"
  startMonth: number; // 1-12
  endMonth: number; // 1-12
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number; // e.g. 10 for +10% or +10 INR
}

export interface Property extends BaseEntity {
  ownerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: 'active' | 'maintenance' | 'inactive';
  amenities: string[];
}

export interface Room extends BaseEntity {
  propertyId: string;
  ownerId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  type: 'AC' | 'Non-AC';
  status: 'available' | 'full' | 'maintenance';
}

export interface Bed extends BaseEntity {
  roomId: string;
  propertyId: string;
  ownerId: string;
  code: string; // e.g. "A", "B"
  price: number;
  status: 'vacant' | 'occupied' | 'maintenance';
}

export interface TenantProfile extends BaseEntity {
  userId: string; // Refers to the User
  propertyId: string;
  ownerId: string;
  bedId: string;
  roomId: string;
  status: 'active' | 'on_notice' | 'checked_out';
  duesAmount: number;
  pgScore: number;
  messBalance: number;
  parentUserId?: string;
  checkInDate: string;
  checkOutDate?: string;
  discountApplied?: boolean;
  agreementAccepted?: boolean;
  agreementTimestamp?: string;
}

export interface ParentProfile extends BaseEntity {
  userId: string; // Parent's User ID
  tenantUserId: string; // The child's User ID
  ownerId: string;
}

export interface Invoice extends BaseEntity {
  tenantId: string; // Refers to Tenant Profile or User ID
  propertyId: string;
  ownerId: string;
  amount: number;
  description: string;
  month: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Payment extends BaseEntity {
  tenantId: string;
  propertyId: string;
  ownerId: string;
  amount: number;
  method: 'upi' | 'card' | 'cash' | 'net_banking';
  referenceNo: string;
  date: string;
}

export interface Expense extends BaseEntity {
  propertyId: string;
  ownerId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Complaint extends BaseEntity {
  tenantId: string;
  propertyId: string;
  ownerId: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

export interface GateLog extends BaseEntity {
  tenantId: string;
  propertyId: string;
  ownerId: string;
  entryType: 'in' | 'out';
  timestamp: string;
  approvedBy?: string; // Manager or Staff ID
  lateEntry: boolean;
}

export interface Notice extends BaseEntity {
  tenantId: string;
  propertyId: string;
  ownerId: string;
  moveOutDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MessOrder extends BaseEntity {
  tenantId: string;
  propertyId: string;
  ownerId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  status: 'ordered' | 'served' | 'cancelled';
  price: number;
}

export interface OwnerRequest extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  city: string;
  pgCount: number;
  bedCount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Hold';
  rejectionReason?: string;
}

export interface Enquiry extends BaseEntity {
  propertyId: string;
  ownerId: string;
  name: string;
  phone: string;
  email?: string;
  status: 'new' | 'contacted' | 'visited' | 'converted' | 'lost';
  budget?: number;
}
