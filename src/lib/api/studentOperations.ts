import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';

export const studentOperationsApi = {
  getProfile: (userId: string) => {
    const students = db.getAll<any>(STORAGE_KEYS.STUDENTS);
    const student = students.find(t => t.userId === userId && !t.isDeleted) || null;
    if (!student) return null;

    const property = db.getById<any>(STORAGE_KEYS.PROPERTIES, student.propertyId);
    const bed = db.getById<any>(STORAGE_KEYS.BEDS, student.bedId);
    const roomId = student.roomId || bed?.roomId;
    const room = db.getById<any>(STORAGE_KEYS.ROOMS, roomId);

    return {
      ...student,
      propertyName: property?.name || 'Unknown Property',
      roomNumber: room?.number || 'Unknown Room',
      bedCode: bed?.code || student.bedId
    };
  },
  
  updateProfile: (studentId: string, data: any, userId: string) => {
    db.update<any>(STORAGE_KEYS.STUDENTS, studentId, { ...data, updatedAt: new Date().toISOString(), updatedBy: userId });
  },

  // Finance
  getInvoices: (studentId: string) => {
    return db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.studentId === studentId && !i.isDeleted).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },
  payInvoice: (invoiceId: string, studentId: string, amount: number, userId: string) => {
    // Record payment
    db.insert(STORAGE_KEYS.PAYMENTS, {
      id: createId('pay'), invoiceId, studentId, amount, method: 'OnlineMock', status: 'completed',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
    // Mark invoice paid
    db.update<any>(STORAGE_KEYS.INVOICES, invoiceId, { status: 'Paid', updatedAt: new Date().toISOString(), updatedBy: userId });
    // Add PG score
    const allStudents = db.getAll<any>(STORAGE_KEYS.STUDENTS);
    const student = allStudents.find(t => t.id === studentId || t.userId === studentId);
    if (student) {
      db.update<any>(STORAGE_KEYS.STUDENTS, student.id, { 
        pgScore: Math.min((student.pgScore || 80) + 10, 100), 
        duesAmount: Math.max((student.duesAmount || 0) - amount, 0),
        updatedAt: new Date().toISOString(), updatedBy: userId 
      });
    }
  },

  // Wallet
  getWalletBalance: (studentId: string) => {
    const w = db.getAll<any>('spg_wallets').find(w => w.studentId === studentId);
    return w ? w.balance : 0;
  },
  rechargeWallet: (studentId: string, amount: number, userId: string) => {
    let w = db.getAll<any>('spg_wallets').find(w => w.studentId === studentId);
    if (w) {
      db.update<any>('spg_wallets', w.id, { balance: w.balance + amount, updatedAt: new Date().toISOString() });
    } else {
      db.insert('spg_wallets', { id: createId('wal'), studentId, balance: amount, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
    }
    db.insert('spg_wallet_txns', { id: createId('wtx'), studentId, type: 'credit', amount, description: 'Recharge', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
  },

  // Mess
  getTodayMenu: (propertyId: string) => {
    const menus = db.getAll<any>('spg_menus').filter(m => m.propertyId === propertyId && !m.isDeleted);
    return menus.length > 0 ? menus[0] : null;
  },
  orderMeal: (studentId: string, propertyId: string, mealType: 'breakfast'|'lunch'|'dinner', cost: number, userId: string) => {
    const bal = studentOperationsApi.getWalletBalance(studentId);
    if (bal < cost) throw new Error('Insufficient wallet balance');
    
    // deduct
    let w = db.getAll<any>('spg_wallets').find(w => w.studentId === studentId);
    if (w) db.update<any>('spg_wallets', w.id, { balance: w.balance - cost, updatedAt: new Date().toISOString() });
    
    db.insert('spg_wallet_txns', { id: createId('wtx'), studentId, type: 'debit', amount: cost, description: `${mealType} deduction`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
    
    // create order
    db.insert('spg_meal_orders', {
      id: createId('ord'), propertyId, studentId, mealType, status: 'Preparing', date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
  },

  // Complaints
  getComplaints: (studentId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.studentId === studentId && !c.isDeleted);
  },
  createComplaint: (data: any, userId: string) => {
    db.insert(STORAGE_KEYS.COMPLAINTS, {
      id: createId('cmp'), ...data, status: 'Open',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
  },

  // Notices
  getNotices: (propertyId: string) => {
    return db.getAll<any>('spg_broadcasts').filter(n => n.propertyId === propertyId && !n.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  submitNotice: (studentId: string, propertyId: string, moveOutDate: string, reason: string, userId: string) => {
    db.insert('spg_notices', {
      id: createId('not'), propertyId, studentId, moveOutDate, reason, status: 'Pending',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
    // Update student status
    const student = db.getById<any>(STORAGE_KEYS.STUDENTS, studentId);
    if (student) {
      db.update<any>(STORAGE_KEYS.STUDENTS, studentId, { status: 'on_notice', updatedAt: new Date().toISOString(), updatedBy: userId });
    }
  },

  // SOS
  triggerSos: (studentId: string, propertyId: string, userId: string) => {
    db.insert('spg_sos', {
      id: createId('sos'), propertyId, studentId, status: 'active', lat: '28.6139', lng: '77.2090',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
  }
};
