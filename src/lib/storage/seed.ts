import { db } from './db';
import { STORAGE_KEYS } from './keys';
import { createId } from '../utils/id';

export function runSeed() {
  if (typeof window === 'undefined') return;
  
  const isSeeded = localStorage.getItem(STORAGE_KEYS.IS_SEEDED);
  if (isSeeded === 'true') {
    return;
  }

  const now = new Date().toISOString();
  
  const base = () => ({
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
    updatedBy: 'system',
    isDeleted: false
  });

  const superadminId = createId('usr');
  const ownerUserId = createId('usr');
  const ownerProfileId = createId('own');
  const managerId = createId('usr');
  const cookId = createId('usr');
  const guardId = createId('usr');
  const tenantId = createId('usr');
  const parentId = createId('usr');

  const users = [
    { id: superadminId, ...base(), role: 'superadmin', name: 'Leo Admin', email: 'leo.a@example.org', password: 'Super@123', status: 'Active', mustChangePassword: false },
    { id: ownerUserId, ...base(), role: 'owner', ownerId: ownerProfileId, name: 'Rajesh Sharma', email: 'peter.m@example.com', password: 'Owner@123', status: 'Active', mustChangePassword: false },
    { id: managerId, ...base(), role: 'manager', ownerId: ownerProfileId, name: 'Ramesh Manager', email: 'tom.h@example.org', password: 'Manager@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: cookId, ...base(), role: 'staff', ownerId: ownerProfileId, name: 'Ivan Cook', email: 'ivan.p@example.net', password: 'Staff@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: guardId, ...base(), role: 'staff', ownerId: ownerProfileId, name: 'Ramu Guard', email: 'ramu@example.net', password: 'Staff@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: tenantId, ...base(), role: 'tenant', ownerId: ownerProfileId, name: 'James Rahul Singh', email: 'james.b@example.com', password: 'Tenant@123', status: 'Active', mustChangePassword: false, propertyId: 'prop_patna' },
    { id: parentId, ...base(), role: 'parent', ownerId: ownerProfileId, name: 'Peter Parent', email: 'peter.m@example.com', password: 'Parent@123', status: 'Active', mustChangePassword: false, linkedTenantId: tenantId }
  ];

  db.replaceAll(STORAGE_KEYS.USERS, users as any);

  const plans = [
    { id: 'plan_basic', ...base(), name: 'Basic', price: 999, maxProperties: 1, maxBeds: 50, maxStaff: 5, features: [] },
    { id: 'plan_gold', ...base(), name: 'Gold', price: 2999, maxProperties: 5, maxBeds: 300, maxStaff: 15, features: ['mess', 'parent_portal'] },
    { id: 'plan_plat', ...base(), name: 'Platinum', price: 5999, maxProperties: 999, maxBeds: 9999, maxStaff: 999, features: ['mess', 'parent_portal', 'iot', 'sos'] }
  ];
  db.replaceAll(STORAGE_KEYS.PLANS, plans as any);

  const requests = [
    { id: createId('req'), ...base(), name: 'Rajesh Verma', businessName: 'Verma PGs', city: 'Lucknow', pgCount: 2, beds: 100, email: 'verma@test.com', phone: '9999999999', status: 'Pending' }
  ];
  db.replaceAll(STORAGE_KEYS.OWNER_REQUESTS, requests as any);

  const ownerProfile = { id: ownerProfileId, ...base(), userId: ownerUserId, name: 'Rajesh Sharma', businessName: 'Sharma Stays', email: 'peter.m@example.com', phone: '8888888888' };
  db.replaceAll(STORAGE_KEYS.OWNERS, [ownerProfile] as any);

  const subs = [{ id: createId('sub'), ...base(), ownerId: ownerProfile.id, planId: 'plan_gold', status: 'Active' }];
  db.replaceAll(STORAGE_KEYS.SUBSCRIPTIONS, subs as any);

  const propPatna = { id: 'prop_patna', ...base(), ownerId: ownerProfile.id, name: 'Sharma PG Patna', city: 'Patna', bedsPlanned: 75 };
  const propDelhi = { id: 'prop_delhi', ...base(), ownerId: ownerProfile.id, name: 'Sharma PG Delhi', city: 'Delhi', bedsPlanned: 40 };
  db.replaceAll(STORAGE_KEYS.PROPERTIES, [propPatna, propDelhi] as any);

  const rooms = Array.from({length: 8}).map((_, i) => ({
    id: `room_${i+1}`, ...base(), propertyId: 'prop_patna', roomNumber: `30${i+1}`
  }));
  db.replaceAll(STORAGE_KEYS.ROOMS, rooms as any);

  const beds = [{ id: 'bed_303B', ...base(), roomId: rooms[2].id, code: 'B', status: 'Occupied', tenantId: tenantId }];
  db.replaceAll(STORAGE_KEYS.BEDS, beds as any);

  db.replaceAll(STORAGE_KEYS.INVOICES, [
    { id: createId('inv'), ...base(), amount: 5000, status: 'Paid', tenantId },
    { id: createId('inv'), ...base(), amount: 5000, status: 'Pending', tenantId }
  ] as any);

  db.replaceAll(STORAGE_KEYS.COMPLAINTS, [
    { id: createId('cmp'), ...base(), propertyId: 'prop_patna', title: 'AC not working', status: 'Open' }
  ] as any);

  db.replaceAll(STORAGE_KEYS.MENUS, [
    { id: createId('mnu'), ...base(), propertyId: 'prop_patna', date: new Date().toISOString().split('T')[0], items: 'Dal, Roti, Rice' }
  ] as any);

  db.replaceAll(STORAGE_KEYS.WALLETS, [
    { id: createId('wal'), ...base(), tenantId, balance: 1000 }
  ] as any);

  db.replaceAll(STORAGE_KEYS.GATE_LOGS, [
    { id: createId('log'), ...base(), propertyId: 'prop_patna', tenantId, type: 'IN', status: 'LATE' },
    { id: createId('log'), ...base(), propertyId: 'prop_patna', tenantId, type: 'OUT', status: 'NORMAL' }
  ] as any);

  db.replaceAll(STORAGE_KEYS.ENQUIRIES, [
    { id: createId('enq'), ...base(), propertyId: 'prop_patna', name: 'New Student', status: 'New' }
  ] as any);

  // Added mock Tenants so manager dashboards aren't empty
  db.replaceAll(STORAGE_KEYS.TENANTS, [
    { 
      id: tenantId, 
      ...base(), 
      propertyId: 'prop_patna', 
      roomId: rooms[2].id, 
      bedId: 'bed_303B',
      name: 'James Rahul Singh', 
      phone: '9876543210', 
      email: 'james.b@example.com', 
      status: 'active', 
      duesAmount: 1500, 
      rentAmount: 8000, 
      securityDeposit: 8000,
      checkInDate: now
    }
  ] as any);

  // Added mock Staff
  db.replaceAll(STORAGE_KEYS.STAFF, [
    { id: cookId, ...base(), propertyId: 'prop_patna', name: 'Ivan Cook', role: 'cook', phone: '9988776611' },
    { id: guardId, ...base(), propertyId: 'prop_patna', name: 'Ramu Guard', role: 'guard', phone: '9988776622' }
  ] as any);

  // Added mock Visitors
  db.replaceAll('spg_visitors', [
    { id: createId('vis'), ...base(), propertyId: 'prop_patna', tenantId, tenantName: 'James Rahul Singh', name: 'Suresh', phone: '9988776655', relation: 'Father', status: 'pending' },
    { id: createId('vis'), ...base(), propertyId: 'prop_patna', tenantId, tenantName: 'James Rahul Singh', name: 'Amazon', phone: '9123456789', relation: 'Delivery', status: 'checked_in' }
  ] as any);

  // Added mock Attendance
  db.replaceAll(STORAGE_KEYS.ATTENDANCE, [
    { id: createId('att'), ...base(), propertyId: 'prop_patna', staffId: cookId, date: now.split('T')[0], status: 'Present' }
  ] as any);

  db.replaceAll(STORAGE_KEYS.AUDIT_LOGS, [
    { id: createId('log'), ...base(), actorId: superadminId, actorRole: 'superadmin', action: 'SYSTEM_SEEDED', entity: 'system', entityId: 'sys' },
    { id: createId('log'), ...base(), actorId: superadminId, actorRole: 'superadmin', action: 'OWNER_CREATED', entity: 'owner', entityId: ownerId }
  ] as any);

  localStorage.setItem(STORAGE_KEYS.IS_SEEDED, 'true');
  console.log('✅ LocalStorage Seeded with Demo Accounts');
}
