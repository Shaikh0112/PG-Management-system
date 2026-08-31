import { ownersApi } from '@/app/owner/lib/api/owners';
import { platformApi } from '@/app/superadmin/lib/api/platform';
import { authApi } from './auth';
import { auditApi } from '@/app/superadmin/lib/api/audit';
import { ownerRequestsApi } from '@/app/superadmin/lib/api/ownerRequests';
import { enquiriesApi } from './enquiries';
import { settingsApi } from '@/app/superadmin/lib/api/settings';
import { plansApi } from '@/app/superadmin/lib/api/plans';
import { ticketsApi } from '@/app/superadmin/lib/api/tickets';
import { propertiesApi } from '@/app/owner/lib/api/properties';
import { dashboardApi } from '@/app/owner/lib/api/dashboard';
import { roomsApi } from '@/app/owner/lib/api/rooms';
import { bedsApi } from '@/app/owner/lib/api/beds';
import { teamApi } from '@/app/owner/lib/api/team';
import { studentsApi } from '@/app/student/lib/api/students';
import { financeApi } from '@/app/owner/lib/api/finance';
import { reportsApi } from '@/app/owner/lib/api/reports';
import { messApi } from '@/app/student/lib/api/mess';
import { foodApi } from '@/app/staff/lib/api/food';
import { stockApi } from '@/app/staff/lib/api/stock';
import { stockRequestsApi } from '@/app/staff/lib/api/stockRequests';
import { managerDashboardApi } from '@/app/manager/lib/api/managerDashboard';
import { managerEnquiriesApi } from '@/app/manager/lib/api/managerEnquiries';
import { managerCheckinApi } from '@/app/manager/lib/api/managerCheckin';
import { managerOperationsApi } from '@/app/manager/lib/api/managerOperations';
import { staffOperationsApi } from '@/app/staff/lib/api/staffOperations';
import { studentOperationsApi } from '@/app/student/lib/api/studentOperations';
import { parentOperationsApi } from '@/app/student/lib/api/parentOperations';
import { pricingApi } from '@/app/superadmin/lib/api/pricing';
import { payrollApi } from '@/app/owner/lib/api/payroll';

export const api = {
  auth: authApi,
  audit: auditApi,
  ownerRequests: ownerRequestsApi,
  enquiries: enquiriesApi,
  platform: platformApi,
  owners: ownersApi,
  settings: settingsApi,
  plans: plansApi,
  tickets: ticketsApi,
  properties: propertiesApi,
  dashboard: dashboardApi,
  rooms: roomsApi,
  beds: bedsApi,
  team: teamApi,
  payroll: payrollApi,
  students: studentsApi,
  finance: financeApi,
  reports: reportsApi,
  mess: messApi,
  food: foodApi,
  stock: stockApi,
  stockRequests: stockRequestsApi,
  managerDashboard: managerDashboardApi,
  managerEnquiries: managerEnquiriesApi,
  managerCheckin: managerCheckinApi,
  managerOperations: managerOperationsApi,
  staffOperations: staffOperationsApi,
  studentOperations: studentOperationsApi,
  parentOperations: parentOperationsApi,
  pricing: pricingApi
};

export default api;
