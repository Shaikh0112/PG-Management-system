import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';

export const platformApi = {
  getDashboardStats: () => {
    const owners = db.getAll(STORAGE_KEYS.USERS).filter((u: any) => u.role === 'owner' && !u.isDeleted);
    const activeOwnersCount = owners.length;
    
    const ownerRequests = db.getAll(STORAGE_KEYS.OWNER_REQUESTS).filter((r: any) => !r.isDeleted);
    const pendingRequestsCount = ownerRequests.filter((r: any) => r.status === 'pending').length;
    
    const properties = db.getAll(STORAGE_KEYS.PROPERTIES).filter((p: any) => !p.isDeleted);
    const activePropertiesCount = properties.length;
    
    const tenants = db.getAll(STORAGE_KEYS.USERS).filter((u: any) => u.role === 'tenant' && !u.isDeleted);
    const totalTenantsCount = tenants.length;
    
    // Occupancy Network Average
    const rooms = db.getAll(STORAGE_KEYS.ROOMS).filter((r: any) => !r.isDeleted);
    const totalCapacity = rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((totalTenantsCount / totalCapacity) * 100) : 0;
    
    const subscriptions = db.getAll(STORAGE_KEYS.SUBSCRIPTIONS).filter((s: any) => !s.isDeleted && s.status === 'active');
    const plans = db.getAll(STORAGE_KEYS.PLANS);
    let mrr = 0;
    subscriptions.forEach((sub: any) => {
      const plan = plans.find((p: any) => p.id === sub.planId);
      if (plan) {
        mrr += (plan as any).price;
      }
    });

    const tickets = db.getAll(STORAGE_KEYS.TICKETS).filter((t: any) => !t.isDeleted);
    const openTicketsCount = tickets.filter((t: any) => t.status === 'open').length;
    
    const expiringPlansCount = subscriptions.filter((s: any) => {
      if(!s.endDate) return false;
      const end = new Date(s.endDate);
      const now = new Date();
      const diffTime = Math.abs(end.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 15;
    }).length;

    // Latest requests for list
    const latestRequests = [...ownerRequests].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    
    // Audit logs
    const auditLogs = db.getAll(STORAGE_KEYS.AUDIT_LOGS).filter((l: any) => !l.isDeleted);
    const recentAuditLogs = [...auditLogs].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    // Owners by plan
    const ownersByPlan = plans.map((p: any) => {
      const count = subscriptions.filter((s: any) => s.planId === p.id).length;
      return { plan: p.name, count };
    });

    return {
      activeOwnersCount,
      pendingRequestsCount,
      activePropertiesCount,
      totalTenantsCount,
      mrr,
      occupancyPercentage,
      openTicketsCount,
      expiringPlansCount,
      latestRequests,
      recentAuditLogs,
      ownersByPlan
    };
  }
};
