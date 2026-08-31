import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';

export const tenantOperationsApi = {
  getProfile: (userId: string) => {
    const tenants = db.getAll<any>(STORAGE_KEYS.TENANTS);
    const tenant = tenants.find(t => t.userId === userId && !t.isDeleted) || null;
    if (!tenant) return null;

    const property = db.getById<any>(STORAGE_KEYS.PROPERTIES, tenant.propertyId);
    const bed = db.getById<any>(STORAGE_KEYS.BEDS, tenant.bedId);
    const roomId = tenant.roomId || bed?.roomId;
    const room = db.getById<any>(STORAGE_KEYS.ROOMS, roomId);

    return {
      ...tenant,
      propertyName: property?.name || 'Unknown Property',
      roomNumber: room?.number || 'Unknown Room',
      bedCode: bed?.code || tenant.bedId
    };
  },
  
  updateProfile: (tenantId: string, data: any, userId: string) => {
    db.update<any>(STORAGE_KEYS.TENANTS, tenantId, { ...data, updatedAt: new Date().toISOString(), updatedBy: userId });
  },

  // Finance
  getInvoices: (tenantId: string) => {
    return db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.tenantId === tenantId && !i.isDeleted).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },
  payInvoice: (invoiceId: string, tenantId: string, amount: number, userId: string) => {
    // Record payment
    db.insert(STORAGE_KEYS.PAYMENTS, {
      id: createId('pay'), invoiceId, tenantId, amount, method: 'OnlineMock', status: 'completed',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
    // Mark invoice paid
    db.update<any>(STORAGE_KEYS.INVOICES, invoiceId, { status: 'Paid', updatedAt: new Date().toISOString(), updatedBy: userId });
    // Add PG score
    const allTenants = db.getAll<any>(STORAGE_KEYS.TENANTS);
    const tenant = allTenants.find(t => t.id === tenantId || t.userId === tenantId);
    if (tenant) {
      db.update<any>(STORAGE_KEYS.TENANTS, tenant.id, { 
        pgScore: Math.min((tenant.pgScore || 80) + 10, 100), 
        duesAmount: Math.max((tenant.duesAmount || 0) - amount, 0),
        updatedAt: new Date().toISOString(), updatedBy: userId 
      });
    }
  },

  // Wallet
  getWalletBalance: (tenantId: string) => {
    const w = db.getAll<any>('spg_wallets').find(w => w.tenantId === tenantId);
    return w ? w.balance : 0;
  },
  rechargeWallet: (tenantId: string, amount: number, userId: string) => {
    let w = db.getAll<any>('spg_wallets').find(w => w.tenantId === tenantId);
    if (w) {
      db.update<any>('spg_wallets', w.id, { balance: w.balance + amount, updatedAt: new Date().toISOString() });
    } else {
      db.insert('spg_wallets', { id: createId('wal'), tenantId, balance: amount, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
    }
    db.insert('spg_wallet_txns', { id: createId('wtx'), tenantId, type: 'credit', amount, description: 'Recharge', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
  },

  // Mess
  getTodayMenu: (propertyId: string) => {
    const menus = db.getAll<any>('spg_menus').filter(m => m.propertyId === propertyId && !m.isDeleted);
    return menus.length > 0 ? menus[0] : null;
  },
  orderMeal: (tenantId: string, propertyId: string, mealType: 'breakfast'|'lunch'|'dinner', cost: number, userId: string) => {
    const bal = tenantOperationsApi.getWalletBalance(tenantId);
    if (bal < cost) throw new Error('Insufficient wallet balance');
    
    // deduct
    let w = db.getAll<any>('spg_wallets').find(w => w.tenantId === tenantId);
    if (w) db.update<any>('spg_wallets', w.id, { balance: w.balance - cost, updatedAt: new Date().toISOString() });
    
    db.insert('spg_wallet_txns', { id: createId('wtx'), tenantId, type: 'debit', amount: cost, description: `${mealType} deduction`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false });
    
    // create order
    db.insert('spg_meal_orders', {
      id: createId('ord'), propertyId, tenantId, mealType, status: 'Preparing', date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
  },

  // Complaints
  getComplaints: (tenantId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.tenantId === tenantId && !c.isDeleted);
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
  submitNotice: (tenantId: string, propertyId: string, moveOutDate: string, reason: string, userId: string) => {
    db.insert('spg_notices', {
      id: createId('not'), propertyId, tenantId, moveOutDate, reason, status: 'Pending',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
    // Update tenant status
    const tenant = db.getById<any>(STORAGE_KEYS.TENANTS, tenantId);
    if (tenant) {
      db.update<any>(STORAGE_KEYS.TENANTS, tenantId, { status: 'on_notice', updatedAt: new Date().toISOString(), updatedBy: userId });
    }
  },

  // SOS
  triggerSos: (tenantId: string, propertyId: string, userId: string) => {
    db.insert('spg_sos', {
      id: createId('sos'), propertyId, tenantId, status: 'active', lat: '28.6139', lng: '77.2090',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId, updatedBy: userId, isDeleted: false
    });
  }
};
