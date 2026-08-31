import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const parentOperationsApi = {
  getLinkedChild: (parentId: string) => {
    // In our fake DB, parent has a linked email or child ID. Let's find a student where parentId matches, 
    // or we just find the first student with matching parentEmail.
    // For demo: peter.m@example.com is Parent, student is james.b@example.com
    // To link them, let's just return the first student if not explicitly linked, or look up by parent's email.
    const parents = db.getAll<any>(STORAGE_KEYS.PARENTS);
    const p = parents.find(x => x.userId === parentId);
    if (!p) return null;

    const students = db.getAll<any>(STORAGE_KEYS.STUDENTS);
    // Find student where student.parentEmail === p.email or student.parentId === p.id
    // For demo, we just return James if he exists.
    let child = students.find(t => t.parentEmail === p.email || t.parentId === p.id);
    if (!child) {
      // fallback for demo
      child = students[0];
    }
    return child || null;
  },

  getChildGateLogs: (studentId: string) => {
    return db.getAll<any>('spg_gate_logs').filter(l => l.studentId === studentId && !l.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getChildAlerts: (studentId: string) => {
    const alerts: any[] = [];
    
    // Check SOS
    const sos = db.getAll<any>('spg_sos').filter(s => s.studentId === studentId && s.status === 'active' && !s.isDeleted);
    sos.forEach(s => alerts.push({ type: 'sos', title: 'Emergency SOS Triggered', date: s.createdAt, severity: 'high' }));

    // Check Late Entries
    const late = db.getAll<any>('spg_gate_logs').filter(l => l.studentId === studentId && l.isLate && !l.isDeleted);
    late.forEach(l => alerts.push({ type: 'late', title: 'Late Entry Logged', date: l.createdAt, severity: 'medium' }));

    // Check Dues
    const invoices = db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.studentId === studentId && i.status !== 'Paid' && !i.isDeleted);
    invoices.forEach(i => alerts.push({ type: 'due', title: `Rent Due: ₹${i.amount}`, date: i.dueDate, severity: 'low' }));

    return alerts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getChildInvoices: (studentId: string) => {
    return db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.studentId === studentId && !i.isDeleted).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },

  getChildComplaints: (studentId: string) => {
    return db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.studentId === studentId && !c.isDeleted).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getWalletBalance: (studentId: string) => {
    const w = db.getAll<any>('spg_wallets').find(w => w.studentId === studentId);
    return w ? w.balance : 0;
  }
};
