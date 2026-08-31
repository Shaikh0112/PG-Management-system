import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';

export const managerDashboardApi = {
  seedMocksIfEmpty: (propertyId: string) => {
    if (!propertyId) return;

    // Check if students exist
    const students = db.getAll<any>(STORAGE_KEYS.STUDENTS).filter(t => t.propertyId === propertyId);
    if (students.length === 0) {
      // Seed Rooms & Beds
      const r1 = createId();
      db.insert(STORAGE_KEYS.ROOMS, { id: r1, propertyId, number: '101', floor: 1, type: '2 Sharing', isDeleted: false });
      
      const b1 = createId();
      const b2 = createId();
      db.insert(STORAGE_KEYS.BEDS, { id: b1, propertyId, roomId: r1, code: 'A', status: 'occupied', isDeleted: false });
      db.insert(STORAGE_KEYS.BEDS, { id: b2, propertyId, roomId: r1, code: 'B', status: 'available', isDeleted: false });

      // Seed Students
      const t1 = createId();
      db.insert(STORAGE_KEYS.STUDENTS, {
        id: t1,
        propertyId,
        roomId: r1,
        bedId: b1,
        name: 'Rahul Sharma',
        phone: '9876543210',
        email: 'rahul@example.com',
        status: 'active',
        duesAmount: 1500,
        rentAmount: 8000,
        securityDeposit: 8000,
        checkInDate: new Date().toISOString(),
        isDeleted: false
      });

      // Seed Complaints
      db.insert(STORAGE_KEYS.COMPLAINTS, {
        id: createId(),
        propertyId,
        studentId: t1,
        studentName: 'Rahul Sharma',
        category: 'Maintenance',
        description: 'AC is making a weird noise',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
        isDeleted: false
      });

      // Seed Visitors
      db.insert(STORAGE_KEYS.VISITORS || 'spg_visitors', {
        id: createId(),
        propertyId,
        studentId: t1,
        studentName: 'Rahul Sharma',
        name: 'Amit Kumar',
        phone: '9988776655',
        relation: 'Friend',
        status: 'pending',
        createdAt: new Date().toISOString(),
        isDeleted: false
      });
      
      // Seed Enquiries
      db.insert(STORAGE_KEYS.ENQUIRIES || 'spg_enquiries', {
        id: createId(),
        propertyId,
        name: 'Sneha Gupta',
        phone: '9123456789',
        status: 'New',
        expectedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isDeleted: false
      });
    }
  },

  getStats: (propertyId: string) => {
    if (!propertyId) return null;
    
    // Auto-seed so dashboard feels alive
    managerDashboardApi.seedMocksIfEmpty(propertyId);

    const students = db.getAll<any>(STORAGE_KEYS.STUDENTS).filter(t => t.propertyId === propertyId && !t.isDeleted);
    const activeStudents = students.filter(t => t.status === 'active' || t.status === 'on_notice').length;

    const beds = db.getAll<any>(STORAGE_KEYS.BEDS).filter(b => b.propertyId === propertyId && !b.isDeleted);
    const vacantBeds = beds.filter(b => b.status === 'available' || b.status === 'vacant').length;

    const complaints = db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => c.propertyId === propertyId && !c.isDeleted);
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

    // Simulate overdue rent by checking students dues
    const overdueStudentsCount = students.filter(t => t.duesAmount > 0).length;

    const activeSos = db.getAll<any>(STORAGE_KEYS.SOS || 'spg_sos').filter(s => s.propertyId === propertyId && s.status === 'active' && !s.isDeleted).length;

    // Rent Statistics
    const { financeApi } = require('./finance');
    financeApi.seedMonthlyInvoices(propertyId); // Ensure current month invoices exist

    const now = new Date();
    const currentMonthStr = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    const allInvoices = db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => i.propertyId === propertyId && i.month === currentMonthStr && !i.isDeleted);
    
    const totalExpectedRent = allInvoices.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCollectedRent = allInvoices.filter(i => i.status.toLowerCase() === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingRentAmount = allInvoices.filter(i => i.status.toLowerCase() !== 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    
    const paidStudentIds = new Set(allInvoices.filter(i => i.status.toLowerCase() === 'paid').map(i => i.studentId));
    const pendingStudentIds = new Set(allInvoices.filter(i => i.status.toLowerCase() !== 'paid').map(i => i.studentId));
    
    return {
      activeStudents,
      vacantBeds,
      todayCheckins: 1, // Simulated fixed
      openComplaints,
      pendingVisitors: db.getAll<any>(STORAGE_KEYS.VISITORS || 'spg_visitors').filter(v => v.propertyId === propertyId && v.status === 'pending').length || 1, 
      overdueStudentsCount: pendingStudentIds.size,
      lateEntries: 2, 
      lowInventoryItems: 3, 
      activeSos,
      rentStats: {
        totalExpectedRent,
        totalCollectedRent,
        pendingRentAmount,
        studentsPaidCount: paidStudentIds.size,
        studentsPendingCount: pendingStudentIds.size,
        totalStudents: activeStudents
      }
    };
  }
};
