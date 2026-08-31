import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';

export const parentOperationsApi = {
  getLinkedChild: (parentId: string) => {
    // In our fake DB, parent has a linked email or child ID. Let's find a tenant where parentId matches, 
    // or we just find the first tenant with matching parentEmail.
    // For demo: peter.m@example.com is Parent, tenant is james.b@example.com
    // To link them, let's just return the first tenant if not explicitly linked, or look up by parent's email.
    const parents = db.getAll<any>(STORAGE_KEYS.PARENTS);
    const p = parents.find(x => x.userId === parentId);
    if (!p) return null;

    const tenants = db.getAll<any>(STORAGE_KEYS.TENANTS);
    // Find tenant where tenant.parentEmail === p.email or tenant.parentId === p.id
    // For demo, we just return James if he exists.
    let child = tenants.find(t => t.parentEmail === p.email || t.parentId === p.id);
    if (!child) {
      // fallback for demo
      child = tenants[0];
    }
    return child || null;
  },

  getChildGateLogs: (tenantId: string) => {
    return db.getAll<any>('spg_gate_logs').filter(l => l.tenantId === tenantId && !l.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getChildAlerts: (tenantId: string) => {
    const alerts: any[] = [];
    
    // Check SOS
    const sos = db.getAll<any>('spg_sos').filter(s => s.tenantId === tenantId && s.status === 'active' && !s.isDeleted);
    sos.forEach(s => alerts.push({ type: 'sos', title: 'Emergency SOS Triggered', date: s.createdAt, severity: 'high' }));

    // Check Late Entries
    const late = db.getAll<any>('spg_gate_logs').filter(l => l.tenantId === tenantId && l.isLate && !l.isDeleted);
    late.forEach(l => alerts.push({ type: 'late', title: 'Late Entry Logged', date: l.createdAt, severity: 'medium' }));

    // Check Dues
    const invoices = db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.tenantId === tenantId && i.status !== 'Paid' && !i.isDeleted);
    invoices.forEach(i => alerts.push({ type: 'due', title: `Rent Due: ₹${i.amount}`, date: i.dueDate, severity: 'low' }));

    return alerts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getChildInvoices: (tenantId: string) => {
    return db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.tenantId === tenantId && !i.isDeleted).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },

  getChildComplaints: (tenantId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.tenantId === tenantId && !c.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getWalletBalance: (tenantId: string) => {
    const w = db.getAll<any>('spg_wallets').find(w => w.tenantId === tenantId);
    return w ? w.balance : 0;
  }
};
