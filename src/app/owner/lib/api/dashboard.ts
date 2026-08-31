import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { Property, propertiesApi } from '@/app/owner/lib/api/properties';

export interface OwnerDashboardMetrics {
  totalPGs: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyPercent: number;
  thisMonthCollection: number;
  yearlyRevenue: number;
  pendingRent: number;
  totalExpenses: number;
  netProfit: number;
  expenseBreakdown: { category: string; amount: number }[];
  openComplaints: number;
  staffPresent: number;
  messRevenue: number;
  
  occupancyByProperty: { name: string; occupied: number; total: number }[];
  collectionVsPending: { month: string; collected: number; pending: number }[];
  defaulters: { name: string; room: string; amount: number; property: string }[];
  vacantBedsList: { property: string; room: string; bed: string }[];
  latestEnquiries: { name: string; date: string; status: string; property: string }[];
}

export const dashboardApi = {
  getOwnerMetrics: (ownerId: string, selectedPropertyId: string | 'all'): OwnerDashboardMetrics => {
    const allProps = propertiesApi.listByOwner(ownerId);
    
    // Filter properties context
    const contextProps = selectedPropertyId === 'all' 
      ? allProps 
      : allProps.filter(p => p.id === selectedPropertyId);
      
    const propIds = contextProps.map(p => p.id);

    // If no properties, return zeroes
    if (propIds.length === 0) {
      return {
        totalPGs: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, vacantBeds: 0, occupancyPercent: 0,
        thisMonthCollection: 0, yearlyRevenue: 0, pendingRent: 0, totalExpenses: 0, netProfit: 0, openComplaints: 0, staffPresent: 0, messRevenue: 0,
        expenseBreakdown: [],
        occupancyByProperty: [], collectionVsPending: [], defaulters: [], vacantBedsList: [], latestEnquiries: []
      };
    }

    // Fetch related collections
    const beds = db.getAll<any>(STORAGE_KEYS.BEDS).filter(b => !b.isDeleted);
    const rooms = db.getAll<any>(STORAGE_KEYS.ROOMS).filter(r => !r.isDeleted && propIds.includes(r.propertyId));
    const roomIds = rooms.map(r => r.id);
    const contextBeds = beds.filter(b => roomIds.includes(b.roomId));
    
    const invoices = db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => propIds.includes(i.propertyId) && !i.isDeleted);
    const payments = db.getAll<any>(STORAGE_KEYS.PAYMENTS).filter(p => !p.isDeleted);
    
    // Revenue calculations
    let thisMonthCollection = 0;
    let pendingRent = 0;
    const currentMonth = new Date().toISOString().slice(0,7);
    
    invoices.forEach(i => {
      // Get month from either 'month' field or 'dueDate'
      const invoiceMonth = i.month || (i.dueDate ? i.dueDate.slice(0,7) : '');
      const amt = Number(i.amount) || 0;
      
      if (invoiceMonth === currentMonth) {
        if (i.status === 'Paid') {
          thisMonthCollection += amt;
        } else {
          pendingRent += amt;
        }
      }
    });

    // Expenses calculations
    const expenses = db.getAll<any>(STORAGE_KEYS.EXPENSES).filter(e => propIds.includes(e.propertyId) && !e.isDeleted);
    let totalExpenses = 0;
    
    // Always include standard categories so they appear in the UI
    const categoryTotals: Record<string, number> = {
      staff_salary: 0,
      maintenance: 0,
      groceries: 0,
      electricity: 0,
      water: 0
    };
    
    expenses.forEach(e => {
      if (e.date?.startsWith(currentMonth) || e.createdAt?.startsWith(currentMonth)) {
        const amt = Number(e.amount) || 0;
        totalExpenses += amt;
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;
      }
    });
    
    // Filter out 'other' if it's 0, but keep standard ones
    const expenseBreakdown = Object.entries(categoryTotals)
      .filter(([cat, amt]) => amt > 0 || ['staff_salary', 'maintenance', 'groceries'].includes(cat))
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt
      }));

    const netProfit = thisMonthCollection - totalExpenses;

    // Yearly projection
    const yearlyRevenue = thisMonthCollection * 12;

    const complaints = db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => propIds.includes(c.propertyId) && !c.isDeleted);
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;
    const staff = db.getAll<any>(STORAGE_KEYS.STAFF).filter(s => !s.isDeleted && s.assignedPropertyIds?.some((id: string) => propIds.includes(id)));
    const enquiries = db.getAll<any>(STORAGE_KEYS.ENQUIRIES).filter(e => !e.isDeleted && propIds.includes(e.propertyId));
    const wallets = db.getAll<any>(STORAGE_KEYS.WALLETS).filter(w => !w.isDeleted); // Mess revenue proxy
    const students = db.getAll<any>(STORAGE_KEYS.USERS).filter(u => !u.isDeleted && u.role === 'student' && propIds.includes(u.propertyId));

    const totalRooms = roomIds.length;
    const totalBeds = contextBeds.length;
    const occupiedBeds = contextBeds.filter(b => b.status === 'Occupied' || b.status === 'occupied').length;
    const vacantBeds = totalBeds - occupiedBeds;
    const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const staffPresent = staff.length; // Dummy
    const messRevenue = wallets.reduce((sum, w) => sum + (w.balance || 0), 0); // Dummy

    // Charts
    const occupancyByProperty = contextProps.map(p => {
      const pRooms = rooms.filter(r => r.propertyId === p.id).map(r => r.id);
      const pBeds = beds.filter(b => pRooms.includes(b.roomId));
      return {
        name: p.name,
        total: pBeds.length || p.bedsPlanned,
        occupied: pBeds.filter(b => b.status === 'Occupied' || b.status === 'occupied').length
      };
    });

    const collectionVsPending = [
      { month: 'Jun', collected: thisMonthCollection * 0.8, pending: pendingRent * 1.2 },
      { month: 'Jul', collected: thisMonthCollection * 0.9, pending: pendingRent * 1.1 },
      { month: 'Aug', collected: thisMonthCollection, pending: pendingRent }
    ];

    // Tables
    const defaulters = invoices
      .filter(i => i.status.toLowerCase() !== 'paid' && i.amount > 0)
      .map(i => {
        const student = students.find(t => t.id === i.studentId);
        const prop = contextProps.find(p => p.id === student?.propertyId);
        return {
          name: student?.name || 'Unknown',
          room: '101', // Dummy mapped
          amount: i.amount,
          property: prop?.name || 'Unknown'
        };
      }).slice(0, 5);

    const vacantBedsList = contextBeds
      .filter(b => b.status !== 'Occupied' && b.status !== 'occupied')
      .map(b => {
        const r = rooms.find(r => r.id === b.roomId);
        const p = contextProps.find(p => p.id === r?.propertyId);
        return {
          property: p?.name || 'Unknown',
          room: r?.roomNumber || 'Unknown',
          bed: b.code || 'A'
        };
      }).slice(0, 5);

    const latestEnquiries = enquiries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(e => {
        const p = contextProps.find(p => p.id === e.propertyId);
        return {
          name: e.name,
          date: new Date(e.createdAt).toLocaleDateString(),
          status: e.status,
          property: p?.name || 'Unknown'
        };
      }).slice(0, 5);

    return {
      totalPGs: contextProps.length,
      totalRooms,
      totalBeds,
      occupiedBeds,
      vacantBeds,
      occupancyPercent,
      thisMonthCollection,
      yearlyRevenue,
      pendingRent,
      totalExpenses,
      netProfit,
      openComplaints,
      staffPresent,
      messRevenue,
      expenseBreakdown,
      occupancyByProperty,
      collectionVsPending,
      defaulters,
      vacantBedsList,
      latestEnquiries
    };
  }
};
