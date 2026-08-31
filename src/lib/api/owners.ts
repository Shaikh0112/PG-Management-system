// @ts-nocheck
import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';
import { User } from '../types';
import { ownerRequestsApi } from './ownerRequests';

export const ownersApi = {
  createOwner(data: any) {
    // 1. Validate unique email in users
    const existingUser = db.query<User>(STORAGE_KEYS.USERS, u => u.email === data.email && !u.isDeleted);
    if (existingUser.length > 0) {
      throw new Error('Email is already in use by another user.');
    }

    const now = new Date().toISOString();
    const adminId = 'superadmin'; // hardcoded for backend simulation

    // 2. Create User record
    const user: User = {
      id: createId('usr'),
      role: 'owner',
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.temporaryPassword,
      status: 'Active',
      mustChangePassword: data.mustChangePassword ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId,
      isDeleted: false
    };
    const createdUser = db.insert(STORAGE_KEYS.USERS, user);

    // 3. Create Owner Profile
    const ownerProfile = {
      id: createId('own'),
      userId: createdUser.id,
      name: data.name,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      address: data.address,
      gst: data.gst,
      pan: data.pan,
      expectedPgs: data.expectedPgs,
      expectedBeds: data.expectedBeds,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId,
      isDeleted: false
    };
    const createdOwner = db.insert(STORAGE_KEYS.OWNERS, ownerProfile);

    // Link user to ownerId
    db.update<User>(STORAGE_KEYS.USERS, createdUser.id, { ownerId: createdOwner.id });

    // 4. Create Subscription (Only if planId is selected)
    if (data.planId && data.planId !== 'none') {
      const subscription = {
        id: createId('sub'),
        ownerId: createdOwner.id,
        planId: data.planId,
        billingCycle: data.billingCycle,
        maxProperties: data.maxProperties,
        maxBeds: data.maxBeds,
        maxStaff: data.maxStaff,
        features: data.features,
        status: 'active',
        startDate: now,
        endDate: data.billingCycle === 'yearly' ? new Date(Date.now() + 365*24*60*60*1000).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        createdAt: now,
        updatedAt: now,
        createdBy: adminId,
        updatedBy: adminId,
        isDeleted: false
      };
      db.insert(STORAGE_KEYS.SUBSCRIPTIONS, subscription);
    }

    // 5. Audit Log
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'OWNER_CREATED',
      actorId: adminId,
      targetId: createdOwner.id,
      details: `Created owner ${data.businessName} (${data.email})`,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId,
      isDeleted: false
    });

    // 6. Update Request if linked
    if (data.requestId) {
      ownerRequestsApi.updateStatus(data.requestId, 'Approved');
    }

    return { user: createdUser, owner: createdOwner };
  },

  listOwners() {
    const owners = db.getAll<any>(STORAGE_KEYS.OWNERS).filter(o => !o.isDeleted);
    const users = db.getAll<User>(STORAGE_KEYS.USERS);
    const subscriptions = db.getAll<any>(STORAGE_KEYS.SUBSCRIPTIONS);
        
    return owners.map(owner => {
      const user = users.find(u => u.ownerId === owner.id);
      const sub = subscriptions.find(s => s.ownerId === owner.id && s.status === 'active');
      
      const hasActivePlan = !!sub && sub.planId !== 'none';
      
      return {
        ...owner,
        status: hasActivePlan ? (user?.status || 'Active') : 'Inactive',
        lastLogin: user?.updatedAt, // simulated
        planId: sub?.planId || 'None',
        // Use real data later, for now 0 if no plan, otherwise simulated or 0
        propertiesCount: hasActivePlan ? (Math.floor(Math.random() * 3) + 1) : 0,
        bedsCount: hasActivePlan ? (Math.floor(Math.random() * 50) + 20) : 0,
        occupancy: hasActivePlan ? (Math.floor(Math.random() * 100)) : 0,
        collectionThisMonth: hasActivePlan ? (Math.floor(Math.random() * 50000)) : 0
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOwner360(id: string) {
    const owner = db.getById<any>(STORAGE_KEYS.OWNERS, id);
    if (!owner) throw new Error('Owner not found');
    
    const user = db.getAll<User>(STORAGE_KEYS.USERS).find(u => u.ownerId === id);
    const sub = db.getAll<any>(STORAGE_KEYS.SUBSCRIPTIONS).find(s => s.ownerId === id);
    
    return {
      owner,
      user,
      subscription: sub,
      // Mock nested data
      properties: [
        { id: 'prop-1', name: 'Elite PG 1', city: owner.city, capacity: 50, occupied: 42, managers: 2 },
        { id: 'prop-2', name: 'Elite PG 2', city: owner.city, capacity: 100, occupied: 98, managers: 3 }
      ],
      managersCount: 5,
      tenantsCount: 140,
      recentPayments: [
        { id: 'pay-1', date: new Date().toISOString(), amount: 4999, status: 'Success', mode: 'UPI' },
        { id: 'pay-2', date: new Date(Date.now() - 30*24*60*60*1000).toISOString(), amount: 4999, status: 'Success', mode: 'Card' }
      ],
      tickets: [
        { id: 'tkt-1', issue: 'App not loading on mobile', status: 'Resolved' },
        { id: 'tkt-2', issue: 'Feature request: Export PDF', status: 'Open' }
      ]
    };
  },

  upgradePlan(ownerId: string, newPlanId: string) {
    const subs = db.getAll<any>(STORAGE_KEYS.SUBSCRIPTIONS);
    
    // Find active subscription for this owner
    const activeSub = subs.find(s => s.ownerId === ownerId && s.status === 'active');
    
    // Fetch the new plan details
    const plans = db.getAll<any>('spg_plans' as any);
    const newPlan = plans.find(p => p.id === newPlanId);
    
    if (!newPlan) throw new Error('Selected plan not found in database');

    const now = new Date().toISOString();

    // Mark current as expired if exists
    if (activeSub) {
      db.update(STORAGE_KEYS.SUBSCRIPTIONS, activeSub.id, { 
        status: 'expired',
        updatedAt: now
      });
    }

    // Create new subscription
    const newSub = {
      id: createId('sub'),
      ownerId,
      planId: newPlanId,
      billingCycle: 'monthly', // default
      maxProperties: newPlan.maxProperties,
      maxBeds: newPlan.maxBeds,
      maxStaff: newPlan.maxStaff,
      features: newPlan.features,
      status: 'active',
      startDate: now,
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      updatedBy: ownerId,
      isDeleted: false
    };
    db.insert(STORAGE_KEYS.SUBSCRIPTIONS, newSub);

    // Audit log
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'PLAN_UPGRADED_SELF_SERVE',
      actorId: ownerId,
      targetId: ownerId,
      details: `Owner self-upgraded to ${newPlan.name} plan`,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      updatedBy: ownerId,
      isDeleted: false
    });
  },

  updateStatus(id: string, status: 'Active' | 'Pending' | 'Suspended') {
    const user = db.getAll<User>(STORAGE_KEYS.USERS).find(u => u.ownerId === id);
    if (user) {
      db.update<User>(STORAGE_KEYS.USERS, user.id, { status });
      db.insert(STORAGE_KEYS.AUDIT_LOGS, {
        id: createId('aud'),
        action: 'OWNER_STATUS_CHANGED',
        actorId: 'superadmin',
        targetId: id,
        details: `Status changed to ${status}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'superadmin',
        updatedBy: 'superadmin',
        isDeleted: false
      });
    }
  },

  resetPassword(id: string, newPassword: string) {
    const user = db.getAll<User>(STORAGE_KEYS.USERS).find(u => u.ownerId === id);
    if (user) {
      db.update<User>(STORAGE_KEYS.USERS, user.id, { password: newPassword, mustChangePassword: true });
      db.insert(STORAGE_KEYS.AUDIT_LOGS, {
        id: createId('aud'),
        action: 'PASSWORD_RESET',
        actorId: 'superadmin',
        targetId: id,
        details: 'SuperAdmin reset owner password',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'superadmin',
        updatedBy: 'superadmin',
        isDeleted: false
      });
    }
  },

  addInternalNote(id: string, note: string) {
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'INTERNAL_NOTE',
      actorId: 'superadmin',
      targetId: id,
      details: note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'superadmin',
      updatedBy: 'superadmin',
      isDeleted: false
    });
  }
};
