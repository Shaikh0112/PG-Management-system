import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';
import { BaseEntity } from '../types';

export type EnquiryStatus = 'new' | 'contacted' | 'visited' | 'interested' | 'booked' | 'lost' | 'converted';

export interface Enquiry extends BaseEntity {
  propertyId: string;
  name: string;
  phone: string;
  email?: string;
  expectedMoveIn?: string;
  budget?: number;
  status: EnquiryStatus;
  lossReason?: string;
  notes?: string;
  assignedManagerId?: string;
  referredByTenantId?: string;
}

export const managerEnquiriesApi = {
  listByProperty: (propertyId: string): Enquiry[] => {
    if (!propertyId) return [];
    
    // Auto-seed to ensure page isn't empty for demo
    const existing = db.getAll<Enquiry>(STORAGE_KEYS.ENQUIRIES).filter(e => e.propertyId === propertyId);
    if (existing.length === 0) {
      db.create(STORAGE_KEYS.ENQUIRIES, {
        id: createId(), propertyId, name: 'Vikram Singh', phone: '9988776655', email: 'vikram@example.com',
        status: 'new', expectedMoveIn: new Date().toISOString(), budget: 9000, notes: 'Looking for a single room.', isDeleted: false, createdAt: new Date().toISOString()
      });
      db.create(STORAGE_KEYS.ENQUIRIES, {
        id: createId(), propertyId, name: 'Priya Verma', phone: '9123456789',
        status: 'contacted', budget: 7000, isDeleted: false, createdAt: new Date(Date.now() - 86400000).toISOString()
      });
      db.create(STORAGE_KEYS.ENQUIRIES, {
        id: createId(), propertyId, name: 'Rohan Gupta', phone: '9876543210',
        status: 'visited', isDeleted: false, createdAt: new Date(Date.now() - 172800000).toISOString()
      });
    }

    return db.getAll<Enquiry>(STORAGE_KEYS.ENQUIRIES)
             .filter(e => e.propertyId === propertyId && !e.isDeleted)
             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): Enquiry | null => {
    return db.getById<Enquiry>(STORAGE_KEYS.ENQUIRIES, id) || null;
  },

  create: (data: Partial<Enquiry> & { propertyId: string, assignedManagerId?: string }): Enquiry => {
    const newEnquiry: Enquiry = {
      id: createId('enq'),
      propertyId: data.propertyId,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      expectedMoveIn: data.expectedMoveIn || '',
      budget: data.budget || 0,
      status: data.status || 'new',
      notes: data.notes || '',
      assignedManagerId: data.assignedManagerId,
      referredByTenantId: data.referredByTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.assignedManagerId || 'system',
      updatedBy: data.assignedManagerId || 'system',
      isDeleted: false
    };

    db.insert(STORAGE_KEYS.ENQUIRIES, newEnquiry);
    
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'ENQUIRY_CREATED',
      actorId: data.assignedManagerId || 'system',
      targetId: newEnquiry.id,
      details: `Created enquiry for ${newEnquiry.name}${data.referredByTenantId ? ' (Referral)' : ''}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.assignedManagerId || 'system',
      updatedBy: data.assignedManagerId || 'system',
      isDeleted: false
    });

    return newEnquiry;
  },

  updateStatus: (id: string, status: EnquiryStatus, managerId: string, lossReason?: string) => {
    const enq = db.getById<Enquiry>(STORAGE_KEYS.ENQUIRIES, id);
    if (!enq) return;

    const updateData: any = { 
      status, 
      updatedAt: new Date().toISOString(),
      updatedBy: managerId
    };
    if (lossReason !== undefined) {
      updateData.lossReason = lossReason;
    }

    db.update<Enquiry>(STORAGE_KEYS.ENQUIRIES, id, updateData);

    // If converted/booked and it was a referral, grant reward
    if ((status === 'booked' || status === 'converted') && enq.referredByTenantId && enq.status !== 'booked' && enq.status !== 'converted') {
      const allTenants = db.getAll<any>(STORAGE_KEYS.TENANTS);
      const tenant = allTenants.find((t: any) => t.userId === enq.referredByTenantId);
      if (tenant) {
        db.update(STORAGE_KEYS.TENANTS, tenant.id, {
          pendingReferralRewards: (tenant.pendingReferralRewards || 0) + 1
        });
      }
    }

    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'ENQUIRY_STATUS_UPDATE',
      actorId: managerId,
      targetId: id,
      details: `Status changed to ${status}${lossReason ? ` (Reason: ${lossReason})` : ''}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: managerId,
      updatedBy: managerId,
      isDeleted: false
    });
  }
};
