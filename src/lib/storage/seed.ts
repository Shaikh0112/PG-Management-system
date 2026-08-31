// @ts-nocheck
import { db } from './db';
import { STORAGE_KEYS } from './keys';
import { createId } from '../utils/id';

export function runSeed() {
  if (typeof window === 'undefined') return;
  
  const isSeeded = localStorage.getItem(STORAGE_KEYS.IS_SEEDED);
  if (isSeeded === 'v12') {
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
  const studentId = createId('usr');
  const studentId2 = createId('usr');
  const studentId3 = createId('usr');
  const studentId4 = createId('usr');
  const parentId = createId('usr');

  const users = [
    { id: superadminId, ...base(), role: 'superadmin', name: 'Super Admin', email: 'superadmin@gmail.com', password: 'Super@123', status: 'Active', mustChangePassword: false },
    { id: ownerUserId, ...base(), role: 'owner', ownerId: ownerProfileId, name: 'Owner 3', email: 'owner@gmail.com', password: 'Owner3@123', status: 'Active', mustChangePassword: false },
    { id: managerId, ...base(), role: 'manager', ownerId: ownerUserId, name: 'Manager 3', email: 'manager3@gmail.com', password: 'Manager@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: cookId, ...base(), role: 'staff', ownerId: ownerUserId, name: 'Cook 3', email: 'cook3@gmail.com', password: 'Cook@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: guardId, ...base(), role: 'staff', ownerId: ownerUserId, name: 'Ramu Guard', email: 'ramu@example.net', password: 'Staff@123', status: 'Active', mustChangePassword: false, assignedPropertyIds: ['prop_patna'] },
    { id: studentId, ...base(), role: 'student', ownerId: ownerUserId, name: 'Student 3', email: 'student3@gmail.com', password: 'Student@123', status: 'Active', mustChangePassword: false, propertyId: 'prop_patna' },
    { id: studentId2, ...base(), role: 'student', ownerId: ownerUserId, name: 'Vikas Kumar', email: 'vikas@example.com', password: 'Student@123', status: 'Active', mustChangePassword: false, propertyId: 'prop_patna' },
    { id: studentId3, ...base(), role: 'student', ownerId: ownerUserId, name: 'Neha Gupta', email: 'neha@example.com', password: 'Student@123', status: 'Active', mustChangePassword: false, propertyId: 'prop_patna' },
    { id: studentId4, ...base(), role: 'student', ownerId: ownerUserId, name: 'Anjali Desai', email: 'anjali@example.com', password: 'Student@123', status: 'Active', mustChangePassword: false, propertyId: 'prop_patna' },
    { id: parentId, ...base(), role: 'parent', ownerId: ownerUserId, name: 'Parent 3', email: 'peter.m@example.com', password: 'Parent@123', status: 'Active', mustChangePassword: false, linkedStudentId: studentId }
  ];

  db.replaceAll(STORAGE_KEYS.USERS, users as any);

  const plans = [
    { id: 'plan_basic', ...base(), name: 'Basic', price: 999, maxProperties: 1, maxBeds: 50, maxStaff: 5, features: [] },
    { id: 'plan_gold', ...base(), name: 'Gold', price: 2999, maxProperties: 5, maxBeds: 300, maxStaff: 15, features: ['mess', 'parent_portal'] },
    { id: 'plan_plat', ...base(), name: 'Platinum', price: 5999, maxProperties: 999, maxBeds: 9999, maxStaff: 999, features: ['mess', 'parent_portal', 'iot', 'sos'] }
  ];
  db.replaceAll(STORAGE_KEYS.PLANS, plans as any);

  // Generate 25 Owner Requests
  const requests = Array.from({length: 25}).map((_, i) => ({
    id: createId('req'),
    ...base(),
    name: `Requesting Owner ${i+1}`,
    businessName: `PG Business ${i+1}`,
    city: ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Noida'][i % 5],
    pgCount: (i % 5) + 1,
    beds: (i * 20) + 50,
    email: `req${i+1}@example.com`,
    phone: `99999990${i.toString().padStart(2, '0')}`,
    status: ['Pending', 'Approved', 'Rejected', 'Hold'][i % 4],
    createdAt: new Date(Date.now() - i * 86400000).toISOString() // Different dates
  }));
  db.replaceAll(STORAGE_KEYS.OWNER_REQUESTS, requests as any);

  // Generate 22 Owners
  const owners = Array.from({length: 22}).map((_, i) => ({
    id: createId('own'),
    ...base(),
    userId: createId('usr'),
    name: `Owner ${i+1}`,
    businessName: `Stays ${i+1}`,
    email: `owner${i+1}@example.com`,
    phone: `88888880${i.toString().padStart(2, '0')}`,
    status: ['Active', 'Inactive'][i % 2]
  }));
  owners[0] = { id: ownerProfileId, ...base(), userId: ownerUserId, name: 'Owner 3', businessName: 'Owner3 Stays', email: 'owner@gmail.com', phone: '8888888888', status: 'Active' };
  db.replaceAll(STORAGE_KEYS.OWNERS, owners as any);

  // Generate 35 Tickets
  const tickets = Array.from({length: 35}).map((_, i) => ({
    id: createId('tkt'),
    ...base(),
    title: `Issue with system ${i+1}`,
    description: `I am facing an issue in the platform. Please check.`,
    status: ['Open', 'In Progress', 'Resolved'][i % 3],
    priority: ['High', 'Medium', 'Low'][i % 3],
    reportedBy: owners[i % owners.length].userId,
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.TICKETS || 'spg_tickets', tickets as any);

  const subs = owners.map((o, i) => ({
    id: createId('sub'), 
    ...base(), 
    ownerId: o.id, 
    planId: ['plan_basic', 'plan_gold', 'plan_plat'][i % 3], 
    status: o.status === 'Active' ? 'active' : 'expired',
    startDate: new Date(Date.now() - i * 864000000).toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.SUBSCRIPTIONS, subs as any);

  const propPatna = { id: 'prop_patna', ...base(), ownerId: ownerUserId, name: 'Owner3 PG Patna', city: 'Patna', bedsPlanned: 75 };
  const propDelhi = { id: 'prop_delhi', ...base(), ownerId: ownerUserId, name: 'Owner3 PG Delhi', city: 'Delhi', bedsPlanned: 40 };
  db.replaceAll(STORAGE_KEYS.PROPERTIES, [propPatna, propDelhi] as any);

  const rooms = Array.from({length: 8}).map((_, i) => ({
    id: `room_${i+1}`, ...base(), propertyId: 'prop_patna', floor: 3, number: `30${i+1}`, sharing: 2, rentPerBed: 5000, deposit: 5000, amenities: ['AC', 'WiFi'], status: 'available'
  }));
  db.replaceAll(STORAGE_KEYS.ROOMS, rooms as any);

  const beds = [
    { id: 'bed_303B', ...base(), roomId: rooms[2].id, propertyId: 'prop_patna', code: 'B', status: 'occupied', studentId: studentId },
    { id: 'bed_303A', ...base(), roomId: rooms[2].id, propertyId: 'prop_patna', code: 'A', status: 'occupied', studentId: studentId2 },
    { id: 'bed_304A', ...base(), roomId: rooms[3].id, propertyId: 'prop_patna', code: 'A', status: 'occupied', studentId: studentId3 },
    { id: 'bed_304B', ...base(), roomId: rooms[3].id, propertyId: 'prop_patna', code: 'B', status: 'occupied', studentId: studentId4 }
  ];
  db.replaceAll(STORAGE_KEYS.BEDS, beds as any);

  const staffProfiles = [
    { id: createId('stf'), ...base(), userId: managerId, ownerId: ownerUserId, staffType: 'manager', salary: 25000, joinDate: now, shift: 'Flexible', permissions: { canEditRent: true, canAddExpense: true, canOnboardStudent: true, canBroadcast: true, canCollectCash: true } },
    { id: createId('stf'), ...base(), userId: cookId, ownerId: ownerUserId, staffType: 'cook', salary: 15000, joinDate: now, shift: 'Morning', permissions: { canEditRent: false, canAddExpense: false, canOnboardStudent: false, canBroadcast: false, canCollectCash: false } },
    { id: createId('stf'), ...base(), userId: guardId, ownerId: ownerUserId, staffType: 'guard', salary: 12000, joinDate: now, shift: 'Night', permissions: { canEditRent: false, canAddExpense: false, canOnboardStudent: false, canBroadcast: false, canCollectCash: false } }
  ];
  db.replaceAll(STORAGE_KEYS.STAFF, staffProfiles as any);

  const studentProfiles = [
    { id: createId('std'), ...base(), userId: studentId, ownerId: ownerUserId, propertyId: 'prop_patna', roomId: rooms[2].id, bedId: 'bed_303B', rentAmount: 5000, duesAmount: 0, pgScore: 95, agreementAccepted: true, agreementTimestamp: now, status: 'active', checkInDate: new Date(Date.now() - 300 * 86400000).toISOString(), stayStartDate: new Date(Date.now() - 300 * 86400000).toISOString(), stayEndDate: new Date(Date.now() + 60 * 86400000).toISOString() },
    { id: createId('std'), ...base(), userId: studentId2, ownerId: ownerUserId, propertyId: 'prop_patna', roomId: rooms[2].id, bedId: 'bed_303A', rentAmount: 5000, duesAmount: 5000, pgScore: 70, agreementAccepted: true, agreementTimestamp: now, status: 'active', checkInDate: now, stayStartDate: now, stayEndDate: new Date(Date.now() + 365 * 86400000).toISOString() },
    { id: createId('std'), ...base(), userId: studentId3, ownerId: ownerUserId, propertyId: 'prop_patna', roomId: rooms[3].id, bedId: 'bed_304A', rentAmount: 6000, duesAmount: 0, pgScore: 100, agreementAccepted: true, agreementTimestamp: now, status: 'active', checkInDate: now, stayStartDate: now, stayEndDate: new Date(Date.now() + 180 * 86400000).toISOString() },
    { id: createId('std'), ...base(), userId: studentId4, ownerId: ownerUserId, propertyId: 'prop_patna', roomId: rooms[3].id, bedId: 'bed_304B', rentAmount: 6000, duesAmount: 0, pgScore: 88, agreementAccepted: true, agreementTimestamp: now, status: 'active', checkInDate: now, stayStartDate: now, stayEndDate: new Date(Date.now() + 180 * 86400000).toISOString() }
  ];
  db.replaceAll(STORAGE_KEYS.STUDENTS, studentProfiles as any);

  const invoices = [];
  
  // Student 3: 10 months
  for (let m = 0; m < 10; m++) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    invoices.push({ id: createId('inv'), ...base(), propertyId: 'prop_patna', amount: 5000, status: m === 0 ? 'Pending' : 'Paid', studentId, title: `Rent - ${d.toLocaleString('default', { month: 'short', year: 'numeric' })}`, dueDate: d.toISOString(), updatedAt: m === 0 ? now : new Date(d.getTime() + 86400000).toISOString() });
  }

  // Vikas Kumar: 4 months
  for (let m = 0; m < 4; m++) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    invoices.push({ id: createId('inv'), ...base(), propertyId: 'prop_patna', amount: 5000, status: m === 0 ? 'Pending' : 'Paid', studentId: studentId2, title: `Rent - ${d.toLocaleString('default', { month: 'short', year: 'numeric' })}`, dueDate: d.toISOString(), updatedAt: m === 0 ? now : new Date(d.getTime() + 86400000).toISOString() });
  }

  // Neha Gupta: 8 months
  for (let m = 0; m < 8; m++) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    invoices.push({ id: createId('inv'), ...base(), propertyId: 'prop_patna', amount: 6000, status: m === 0 ? 'Pending' : 'Paid', studentId: studentId3, title: `Rent - ${d.toLocaleString('default', { month: 'short', year: 'numeric' })}`, dueDate: d.toISOString(), updatedAt: m === 0 ? now : new Date(d.getTime() + 86400000).toISOString() });
  }

  // Anjali Desai: 10 months
  for (let m = 0; m < 10; m++) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    invoices.push({ id: createId('inv'), ...base(), propertyId: 'prop_patna', amount: 6000, status: m === 0 ? 'Pending' : 'Paid', studentId: studentId4, title: `Rent - ${d.toLocaleString('default', { month: 'short', year: 'numeric' })}`, dueDate: d.toISOString(), updatedAt: m === 0 ? now : new Date(d.getTime() + 86400000).toISOString() });
  }

  db.replaceAll(STORAGE_KEYS.INVOICES, invoices as any);

  db.replaceAll(STORAGE_KEYS.COMPLAINTS, [
    { id: createId('cmp'), ...base(), propertyId: 'prop_patna', studentId: studentId, studentName: 'Student 3', roomId: rooms[2].id, roomNumber: '303', category: 'maintenance', title: 'AC not working in Room 303', description: 'The AC is blowing hot air since yesterday.', status: 'Open', priority: 'High' },
    { id: createId('cmp'), ...base(), propertyId: 'prop_patna', studentId: studentId, studentName: 'Student 3', roomId: rooms[2].id, roomNumber: '303', category: 'cleaning', title: 'Room cleaning missed', description: 'No one came to clean the room today.', status: 'Resolved', priority: 'Medium', repairCost: 1500, resolvedAt: now, resolutionNotes: 'Replaced AC capacitor and serviced unit' }
  ] as any);

  const foodMenu = JSON.stringify({ breakfast: 'Poha & Jalebi', lunch: 'Dal, Roti, Rice, Paneer Masala', dinner: 'Jeera Rice, Chole, Salad' });
  db.replaceAll(STORAGE_KEYS.MENUS, [
    { 
      id: createId('food'), 
      propertyId: 'prop_patna', 
      monday: foodMenu, tuesday: foodMenu, wednesday: foodMenu, thursday: foodMenu, friday: foodMenu, saturday: foodMenu, sunday: foodMenu,
      monthEndSpecial: 'Paneer Tikka, Naan, Gulab Jamun',
      updatedAt: new Date().toISOString()
    }
  ] as any);

  db.replaceAll(STORAGE_KEYS.MEAL_STATUS, [
    { id: createId('msl'), ...base(), propertyId: 'prop_patna', date: new Date().toISOString().split('T')[0], mealType: 'Breakfast', status: 'announced' },
    { id: createId('msl'), ...base(), propertyId: 'prop_patna', date: new Date().toISOString().split('T')[0], mealType: 'Lunch', status: 'ready' },
    { id: createId('msl'), ...base(), propertyId: 'prop_patna', date: new Date().toISOString().split('T')[0], mealType: 'Dinner', status: 'pending' }
  ] as any);

  db.replaceAll(STORAGE_KEYS.WALLETS, [
    { id: createId('wal'), ...base(), studentId, balance: 1000, propertyId: 'prop_patna' }
  ] as any);

  const gateLogs = Array.from({length: 35}).map((_, i) => ({
    id: createId('log'),
    ...base(),
    propertyId: 'prop_patna',
    studentId: studentId,
    type: ['entry', 'exit'][i % 2] as 'entry' | 'exit',
    isLate: i % 3 === 0,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.GATE_LOGS, gateLogs as any);

  const enquiries = Array.from({length: 35}).map((_, i) => ({
    id: createId('enq'),
    ...base(),
    propertyId: 'prop_patna',
    name: `Enquiry ${i+1}`,
    phone: `98765432${i.toString().padStart(2, '0')}`,
    email: `enq${i+1}@example.com`,
    status: ['New', 'Contacted', 'Converted', 'Closed'][i % 4],
    createdAt: new Date(Date.now() - i * 86400000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.ENQUIRIES, enquiries as any);

  const visitorNames = ['Ramesh Kumar', 'Sunita Devi', 'Ajay Sharma', 'Pooja Singh', 'Vikram Yadav', 'Meena Patel', 'Suresh Gupta'];
  const visitors = Array.from({length: 35}).map((_, i) => ({
    id: createId('vis'),
    ...base(),
    propertyId: 'prop_patna',
    studentId: studentId,
    studentName: 'Student 3',
    name: `${visitorNames[i % visitorNames.length]} ${i + 1}`,
    phone: `99887766${i.toString().padStart(2, '0')}`,
    relation: ['Father', 'Mother', 'Friend', 'Sibling'][i % 4],
    status: ['pending', 'checked_in', 'checked_out', 'rejected'][i % 4],
    purpose: ['Family Visit', 'Delivery', 'Emergency', 'Social'][i % 4],
    checkInTime: i % 2 === 0 ? new Date(Date.now() - i * 3600000).toISOString() : null,
    createdAt: new Date(Date.now() - i * 7200000).toISOString()
  }));
  db.replaceAll('spg_visitors', visitors as any);

  const staffAttendance = Array.from({length: 35}).map((_, i) => ({
    id: createId('att'),
    ...base(),
    propertyId: 'prop_patna',
    staffUserId: cookId,
    date: new Date(Date.now() - (i % 7) * 86400000).toISOString().split('T')[0],
    status: ['present', 'absent', 'half_day', 'leave'][i % 4],
    markedAt: new Date(Date.now() - i * 3600000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.STAFF_ATTENDANCE || 'spg_staff_attendance', staffAttendance as any);

  const inventory = Array.from({length: 35}).map((_, i) => ({
    id: createId('inv'),
    ...base(),
    propertyId: 'prop_patna',
    itemName: `Item ${i+1}`,
    category: ['Cleaning', 'Food', 'Stationery', 'Maintenance'][i % 4],
    quantity: (i + 1) * 10,
    unit: ['kg', 'liter', 'pieces', 'boxes'][i % 4],
    status: ['In Stock', 'Low Stock', 'Out of Stock'][i % 3]
  }));
  db.replaceAll('spg_inventory', inventory as any);

  const documents = Array.from({length: 35}).map((_, i) => ({
    id: createId('doc'),
    ...base(),
    propertyId: 'prop_patna',
    title: `Document ${i+1}`,
    type: ['Aadhaar', 'Agreement', 'Receipt', 'Other'][i % 4],
    uploadedBy: studentId,
    url: '#',
    createdAt: new Date(Date.now() - i * 86400000).toISOString()
  }));
  db.replaceAll('spg_documents', documents as any);

  const broadcasts = Array.from({length: 35}).map((_, i) => ({
    id: createId('brd'),
    ...base(),
    propertyId: 'prop_patna',
    title: `Notice ${i+1}`,
    message: `This is important notice number ${i+1} for all residents.`,
    sentBy: managerId,
    status: ['Sent', 'Draft', 'Scheduled'][i % 3],
    createdAt: new Date(Date.now() - i * 43200000).toISOString()
  }));
  db.replaceAll('spg_broadcasts', broadcasts as any);

  // Generate 45 Audit Logs
  const auditLogs = Array.from({length: 45}).map((_, i) => ({
    id: createId('log'),
    ...base(),
    actorId: superadminId,
    actorRole: 'superadmin',
    action: ['SYSTEM_SEEDED', 'OWNER_CREATED', 'PLAN_UPDATED', 'SETTING_CHANGED'][i % 4],
    entity: ['system', 'owner', 'plan', 'setting'][i % 4],
    entityId: `entity_${i}`,
    details: `Action performed successfully. Transaction #${1000 + i}`,
    createdAt: new Date(Date.now() - i * 7200000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.AUDIT_LOGS, auditLogs as any);

  // ── COOK PORTAL SEED DATA ──────────────────────────────────────────

  // 20 Grocery Stock Items (for spg_inventory with category 'Groceries')
  const groceryItems = [
    { name: 'Basmati Rice',     unit: 'Kg',      quantity: 25, lowStockThreshold: 5,  category: 'Groceries', expiryDate: '2026-12-01' },
    { name: 'Toor Dal',         unit: 'Kg',      quantity: 8,  lowStockThreshold: 3,  category: 'Groceries', expiryDate: '2026-11-15' },
    { name: 'Wheat Flour (Atta)',unit: 'Kg',     quantity: 15, lowStockThreshold: 4,  category: 'Groceries', expiryDate: '2026-10-20' },
    { name: 'Mustard Oil',      unit: 'Liters',  quantity: 4,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: '2027-03-01' },
    { name: 'Sunflower Oil',    unit: 'Liters',  quantity: 6,  lowStockThreshold: 2,  category: 'Groceries', expiryDate: '2027-02-15' },
    { name: 'Paneer',           unit: 'Kg',      quantity: 2,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] },
    { name: 'Fresh Milk',       unit: 'Liters',  quantity: 5,  lowStockThreshold: 2,  category: 'Groceries', expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] },
    { name: 'Tomatoes',         unit: 'Kg',      quantity: 3,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0] },
    { name: 'Onions',           unit: 'Kg',      quantity: 10, lowStockThreshold: 2,  category: 'Groceries' },
    { name: 'Potatoes',         unit: 'Kg',      quantity: 8,  lowStockThreshold: 2,  category: 'Groceries' },
    { name: 'Cumin Seeds',      unit: 'Grams',   quantity: 200,lowStockThreshold: 50, category: 'Groceries', expiryDate: '2026-12-31' },
    { name: 'Turmeric Powder',  unit: 'Grams',   quantity: 300,lowStockThreshold: 50, category: 'Groceries', expiryDate: '2027-01-01' },
    { name: 'Red Chilli Powder',unit: 'Grams',   quantity: 250,lowStockThreshold: 50, category: 'Groceries', expiryDate: '2027-01-01' },
    { name: 'Coriander Powder', unit: 'Grams',   quantity: 180,lowStockThreshold: 50, category: 'Groceries', expiryDate: '2027-01-01' },
    { name: 'Salt (Iodized)',   unit: 'Kg',      quantity: 3,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: '2028-01-01' },
    { name: 'Sugar',            unit: 'Kg',      quantity: 5,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: '2027-06-01' },
    { name: 'Tea Leaves',       unit: 'Grams',   quantity: 500,lowStockThreshold: 100,category: 'Groceries', expiryDate: '2026-12-01' },
    { name: 'Poha (Flattened Rice)', unit: 'Kg', quantity: 2,  lowStockThreshold: 0.5,category: 'Groceries', expiryDate: '2026-11-30' },
    { name: 'Chole (Chickpeas)',unit: 'Kg',      quantity: 4,  lowStockThreshold: 1,  category: 'Groceries', expiryDate: '2027-04-01' },
    { name: 'Ghee',             unit: 'Kg',      quantity: 1,  lowStockThreshold: 0.5,category: 'Groceries', expiryDate: '2026-12-15' },
  ].map(item => ({
    id: createId('stk'),
    ...base(),
    propertyId: 'prop_patna',
    ...item
  }));
  // Also add maintenance/cleaning inventory
  const maintenanceItems = Array.from({length: 15}).map((_, i) => ({
    id: createId('stk'),
    ...base(),
    propertyId: 'prop_patna',
    name: ['Light Bulbs (LED)', 'Toilet Cleaner', 'Brooms', 'Mop Set', 'Dish Soap', 'Dustbin Bags', 'Phenyl', 'Room Freshener', 'Extension Cords', 'Screwdrivers Set', 'Spare Fan Regulator', 'Insect Repellent', 'Handwash Soap', 'Tissue Rolls', 'Bleaching Powder'][i],
    unit: ['Pieces', 'Liters', 'Pieces', 'Pieces', 'Liters', 'Packets', 'Liters', 'Pieces', 'Pieces', 'Set', 'Pieces', 'Liters', 'Pieces', 'Rolls', 'Kg'][i],
    quantity: [20, 3, 5, 2, 4, 10, 2, 4, 3, 1, 5, 2, 15, 20, 2][i],
    lowStockThreshold: [5, 1, 2, 1, 1, 3, 1, 1, 1, 1, 2, 1, 5, 5, 1][i],
    category: ['Maintenance', 'Cleaning', 'Cleaning', 'Cleaning', 'Cleaning', 'Cleaning', 'Cleaning', 'Maintenance', 'Maintenance', 'Maintenance', 'Maintenance', 'Maintenance', 'Cleaning', 'Cleaning', 'Cleaning'][i],
  }));
  db.replaceAll(STORAGE_KEYS.INVENTORY, [...groceryItems, ...maintenanceItems] as any);

  // 20 Stock Requests (kitchen grocery requests from cook to manager)
  const stockRequestItems = ['Basmati Rice', 'Paneer', 'Tomatoes', 'Fresh Milk', 'Toor Dal', 'Sunflower Oil', 'Wheat Flour (Atta)', 'Chole (Chickpeas)', 'Onions', 'Potatoes'];
  const stockRequests = Array.from({length: 20}).map((_, i) => ({
    id: createId('req'),
    ...base(),
    propertyId: 'prop_patna',
    itemName: stockRequestItems[i % stockRequestItems.length],
    quantityRequested: [5, 2, 3, 4, 2, 3, 5, 3, 4, 5][i % 10],
    unit: ['Kg', 'Kg', 'Kg', 'Liters', 'Kg', 'Liters', 'Kg', 'Kg', 'Kg', 'Kg'][i % 10],
    requestedBy: cookId,
    status: ['pending', 'purchased', 'verified', 'pending'][i % 4],
    purchaseCost: i % 2 === 0 ? (i + 1) * 80 : null,
    purchasedAt: i % 4 === 1 ? new Date(Date.now() - i * 3600000).toISOString() : null,
    expiryDate: i % 4 === 2 ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : null,
    createdAt: new Date(Date.now() - i * 7200000).toISOString()
  }));
  db.replaceAll('spg_stock_requests', stockRequests as any);

  // 15 Live Meal Orders for cook
  const studentNames = ['Rajan Kumar', 'Priya Sharma', 'Mohan Das', 'Anita Singh', 'Vijay Mehta', 'Sunita Patel', 'Arjun Rao'];
  const mealOrders = Array.from({length: 15}).map((_, i) => ({
    id: createId('ord'),
    ...base(),
    propertyId: 'prop_patna',
    studentId: studentId,
    studentName: studentNames[i % studentNames.length],
    roomNumber: `30${(i % 8) + 1}`,
    mealType: ['Breakfast', 'Lunch', 'Dinner'][i % 3],
    status: i < 5 ? 'Pending' : 'Served',
    orderedAt: new Date(Date.now() - i * 1800000).toISOString(),
    createdAt: new Date(Date.now() - i * 1800000).toISOString()
  }));
  db.replaceAll(STORAGE_KEYS.MEAL_ORDERS, mealOrders as any);

  // 15 Staff Tasks
  const taskTitles = [
    'Clean kitchen counters after lunch service',
    'Prepare grocery request for next week',
    'Check expiry dates on all stock items',
    'Deep clean stoves and burners',
    'Restock pantry shelves',
    'Prepare breakfast items for tomorrow',
    'Log daily usage in stock register',
    'Sanitize kitchen tools and utensils',
    'Check refrigerator temperature settings',
    'Prepare monthly grocery report',
    'Arrange items in storage room',
    'Check and refill water filter',
    'Clean exhaust fans in kitchen',
    'Prepare special items for month-end',
    'Update cooking schedule for next week'
  ];
  const tasks = taskTitles.map((title, i) => ({
    id: createId('tsk'),
    ...base(),
    propertyId: 'prop_patna',
    assignedTo: cookId,
    title,
    desc: `Complete this task before end of shift. Priority: ${['High', 'Medium', 'Low'][i % 3]}`,
    status: i < 5 ? 'done' : 'pending',
    priority: ['high', 'medium', 'low'][i % 3],
    createdAt: new Date(Date.now() - i * 86400000).toISOString()
  }));
  db.replaceAll('spg_tasks', tasks as any);

  localStorage.setItem(STORAGE_KEYS.IS_SEEDED, 'v13');
  console.log('✅ LocalStorage Seeded with Demo Accounts + Cook Data (v13)');
}
