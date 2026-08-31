import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';

export const staffOperationsApi = {
  // Cook
  getTodayMenu: (propertyId: string) => {
    const menus = db.getAll<any>(STORAGE_KEYS.MENUS || 'spg_food_menus').filter(m => m.propertyId === propertyId && !m.isDeleted);
    if (menus.length === 0) return null;
    const menu = menus[0];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const rawValue = menu[today] || '';
    try {
      const parsed = JSON.parse(rawValue);
      if (parsed.breakfast !== undefined) return parsed;
    } catch (e) {}
    return { breakfast: '', lunch: '', dinner: rawValue };
  },
  saveMenu: (propertyId: string, data: any, staffId: string) => {
    const existing = staffOperationsApi.getTodayMenu(propertyId);
    if (existing) {
      db.update<any>(STORAGE_KEYS.MENUS || 'spg_menus', existing.id, { ...data, updatedAt: new Date().toISOString(), updatedBy: staffId });
    } else {
      db.insert(STORAGE_KEYS.MENUS || 'spg_menus', {
        id: createId('mnu'), propertyId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: staffId, updatedBy: staffId, isDeleted: false
      });
    }
  },
  getLiveOrders: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.MEAL_ORDERS || 'spg_meal_orders').filter(o => o.propertyId === propertyId && o.status !== 'Served' && !o.isDeleted);
  },
  updateOrderStatus: (orderId: string, status: string, staffId: string) => {
    db.update<any>(STORAGE_KEYS.MEAL_ORDERS || 'spg_meal_orders', orderId, { status, updatedAt: new Date().toISOString(), updatedBy: staffId });
  },

  // Guard
  getExpectedVisitors: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.VISITORS).filter(v => v.propertyId === propertyId && v.status === 'pending' && !v.isDeleted);
  },
  getActiveSos: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.SOS || 'spg_sos').filter(s => s.propertyId === propertyId && s.status === 'active' && !s.isDeleted);
  },
  resolveSos: (sosId: string, staffId: string) => {
    db.update<any>(STORAGE_KEYS.SOS || 'spg_sos', sosId, { status: 'resolved', updatedAt: new Date().toISOString(), updatedBy: staffId });
  },
  addGateLog: (data: { propertyId: string, studentId: string, type: 'entry' | 'exit', isLate: boolean, staffId: string }) => {
    db.insert(STORAGE_KEYS.GATE_LOGS, {
      id: createId('gat'),
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.staffId, updatedBy: data.staffId, isDeleted: false
    });
  },

  // Housekeeping & Tasks
  getTasks: (propertyId: string, assignedTo?: string) => {
    let tasks = db.getAll<any>('spg_tasks').filter(t => t.propertyId === propertyId && !t.isDeleted);
    if (assignedTo) tasks = tasks.filter(t => t.assignedTo === assignedTo);
    return tasks;
  },
  updateTask: (taskId: string, status: string, staffId: string) => {
    db.update<any>('spg_tasks', taskId, { status, updatedAt: new Date().toISOString(), updatedBy: staffId });
  },

  // Maintenance
  getAssignedComplaints: (staffId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.assignedTo === staffId && !c.isDeleted);
  },
  updateComplaintStatus: (complaintId: string, status: string, staffId: string) => {
    db.update<any>(STORAGE_KEYS.COMPLAINTS, complaintId, { status, updatedAt: new Date().toISOString(), updatedBy: staffId });
  },

  // Get Staff Details
  getStaffProfile: (userId: string) => {
    return db.getAll<any>(STORAGE_KEYS.STAFF).find(s => s.userId === userId && !s.isDeleted) || null;
  }
};
