// @ts-nocheck
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { createId } from '@/lib/utils/id';
import { financeApi } from '@/app/owner/lib/api/finance';

export const managerOperationsApi = {
  // Visitors
  listVisitors: (propertyId: string) => {
    if (!propertyId) return [];
    
    // Auto-seed visitors
    const existing = db.getAll<any>(STORAGE_KEYS.VISITORS || 'spg_visitors').filter(v => v.propertyId === propertyId);
    if (existing.length === 0) {
      db.insert<any>(STORAGE_KEYS.VISITORS || 'spg_visitors', {
        id: createId(), propertyId, studentName: 'Rahul Sharma', name: 'Suresh', phone: '9988776655', relation: 'Father', status: 'pending', createdAt: new Date().toISOString(), isDeleted: false
      });
      db.insert<any>(STORAGE_KEYS.VISITORS || 'spg_visitors', {
        id: createId(), propertyId, studentName: 'Amit Kumar', name: 'Delivery', phone: '9123456789', relation: 'Swiggy', status: 'checked_in', createdAt: new Date().toISOString(), isDeleted: false
      });
    }

    return db.getAll<any>(STORAGE_KEYS.VISITORS || 'spg_visitors').filter(v => v.propertyId === propertyId && !v.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  updateVisitorStatus: (id: string, status: 'approved' | 'rejected' | 'checked_in' | 'checked_out', managerId: string) => {
    const data: any = { status, updatedBy: managerId, updatedAt: new Date().toISOString() };
    if (status === 'checked_in') data.checkInTime = new Date().toISOString();
    if (status === 'checked_out') data.checkOutTime = new Date().toISOString();
    db.update<any>(STORAGE_KEYS.VISITORS, id, data);
  },

  // Attendance (Staff)
  listStaff: (propertyId: string) => {
    if (!propertyId) return [];
    
    // Auto-seed staff
    const existing = db.getAll<any>(STORAGE_KEYS.STAFF).filter(s => s.propertyId === propertyId);
    if (existing.length === 0) {
      db.insert<any>(STORAGE_KEYS.STAFF, { id: createId(), propertyId, name: 'Raju (Cook)', role: 'cook', phone: '9988776611', isDeleted: false });
      db.insert<any>(STORAGE_KEYS.STAFF, { id: createId(), propertyId, name: 'Bahadur (Guard)', role: 'guard', phone: '9988776622', isDeleted: false });
      db.insert<any>(STORAGE_KEYS.STAFF, { id: createId(), propertyId, name: 'Sunita (Cleaner)', role: 'cleaner', phone: '9988776633', isDeleted: false });
    }

    return db.getAll<any>(STORAGE_KEYS.STAFF).filter(s => s.propertyId === propertyId && !s.isDeleted);
  },
  listAttendanceToday: (propertyId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return db.getAll<any>(STORAGE_KEYS.ATTENDANCE).filter(a => a.propertyId === propertyId && a.date === today && !a.isDeleted);
  },
  markAttendance: (staffId: string, propertyId: string, status: 'Present' | 'Absent', managerId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.getAll<any>(STORAGE_KEYS.ATTENDANCE).find(a => a.staffId === staffId && a.date === today && !a.isDeleted);
    if (existing) {
      db.update<any>(STORAGE_KEYS.ATTENDANCE, existing.id, { status, updatedBy: managerId, updatedAt: new Date().toISOString() });
    } else {
      db.insert(STORAGE_KEYS.ATTENDANCE, {
        id: createId('att'), staffId, propertyId, date: today, status,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: managerId, updatedBy: managerId, isDeleted: false
      });
    }
  },

  // Gate Logs
  listGateLogs: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.GATE_LOGS).filter(g => g.propertyId === propertyId && !g.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addGateLog: (data: { propertyId: string, studentId: string, type: 'entry' | 'exit', isLate: boolean, managerId: string }) => {
    db.insert(STORAGE_KEYS.GATE_LOGS, {
      id: createId('gat'),
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.managerId, updatedBy: data.managerId, isDeleted: false
    });
  },

  // Broadcasts
  listBroadcasts: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.BROADCASTS).filter(b => b.propertyId === propertyId && !b.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  createBroadcast: (data: { propertyId: string, title: string, message: string, audience: 'all' | 'floor' | 'defaulters', targetFloor?: string, managerId: string }) => {
    db.insert(STORAGE_KEYS.BROADCASTS, {
      id: createId('brd'),
      ...data,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.managerId, updatedBy: data.managerId, isDeleted: false
    });
  },

  // Documents
  listDocuments: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.DOCUMENTS).filter(d => d.propertyId === propertyId && !d.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Inventory
  listInventory: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.INVENTORY).filter(i => i.propertyId === propertyId && !i.isDeleted);
  },
  updateInventory: (id: string, qtyDelta: number, managerId: string) => {
    const item = db.getById<any>(STORAGE_KEYS.INVENTORY, id);
    if (item) {
      db.update<any>(STORAGE_KEYS.INVENTORY, id, { 
        quantity: Math.max(0, item.quantity + qtyDelta),
        updatedAt: new Date().toISOString(),
        updatedBy: managerId
      });
    }
  },
  addInventoryItem: (data: { propertyId: string, name: string, quantity: number, threshold: number, category: string, managerId: string }) => {
    db.insert(STORAGE_KEYS.INVENTORY, {
      id: createId('inv'),
      ...data,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: data.managerId, updatedBy: data.managerId, isDeleted: false
    });
  },

  // Complaints
  listComplaints: (propertyId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.propertyId === propertyId && !c.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  updateComplaintStatus: (id: string, status: string, managerId: string) => {
    db.update<any>(STORAGE_KEYS.COMPLAINTS, id, { status, updatedAt: new Date().toISOString(), updatedBy: managerId });
  },
  resolveComplaintWithCost: (id: string, cost: number, notes: string, managerId: string) => {
    const complaint = db.getById<any>(STORAGE_KEYS.COMPLAINTS, id);
    if (!complaint) return;
    db.update<any>(STORAGE_KEYS.COMPLAINTS, id, { 
      status: 'Resolved', 
      repairCost: cost, 
      resolutionNotes: notes, 
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), 
      updatedBy: managerId 
    });
    
    if (cost > 0) {
      financeApi.createExpense({
        propertyId: complaint.propertyId,
        category: 'maintenance',
        amount: cost,
        description: `Maintenance: ${complaint.title || complaint.category} (Room ${complaint.roomNumber || 'N/A'})${notes ? ' - ' + notes : ''}`
      }, managerId);
    }
  },
  assignComplaint: (id: string, staffId: string, managerId: string) => {
    db.update<any>(STORAGE_KEYS.COMPLAINTS, id, { assignedTo: staffId, updatedAt: new Date().toISOString(), updatedBy: managerId });
  }
};
