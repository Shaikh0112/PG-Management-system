import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const reportsApi = {
  getOwnerReport: (ownerId: string, propertyId?: string) => {
    let ownerProps = db.getAll<any>(STORAGE_KEYS.PROPERTIES).filter(p => p.ownerId === ownerId);
    if (propertyId && propertyId !== 'all') {
      ownerProps = ownerProps.filter(p => p.id === propertyId);
    }
    const propIds = ownerProps.map(p => p.id);

    const beds = db.getAll<any>(STORAGE_KEYS.BEDS).filter(b => b.propertyId && propIds.includes(b.propertyId));
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const invoices = db.getAll<any>(STORAGE_KEYS.INVOICES).filter(i => propIds.includes(i.propertyId));
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const collectionEfficiency = invoices.length > 0 ? Math.round((paidInvoices / invoices.length) * 100) : 0;

    const complaints = db.getAll<any>(STORAGE_KEYS.COMPLAINTS).filter(c => propIds.includes(c.propertyId));
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

    return {
      occupancyRate,
      totalBeds,
      occupiedBeds,
      collectionEfficiency,
      openComplaints,
      totalComplaints: complaints.length
    };
  }
};
