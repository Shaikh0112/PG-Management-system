import { ownersApi } from './owners';
import { platformApi } from './platform';
import { authApi } from './auth';
import { auditApi } from './audit';
import { ownerRequestsApi } from './ownerRequests';
import { enquiriesApi } from './enquiries';
import { settingsApi } from './settings';
import { plansApi } from './plans';
import { ticketsApi } from './tickets';
import { propertiesApi } from './properties';
import { dashboardApi } from './dashboard';
import { roomsApi } from './rooms';
import { bedsApi } from './beds';
import { teamApi } from './team';
import { studentsApi } from './students';
import { financeApi } from './finance';
import { reportsApi } from './reports';
import { messApi } from './mess';
import { foodApi } from './food';
import { stockApi } from './stock';
import { stockRequestsApi } from './stockRequests';
import { managerDashboardApi } from './managerDashboard';
import { managerEnquiriesApi } from './managerEnquiries';
import { managerCheckinApi } from './managerCheckin';
import { managerOperationsApi } from './managerOperations';
import { staffOperationsApi } from './staffOperations';
import { studentOperationsApi } from './studentOperations';
import { parentOperationsApi } from './parentOperations';
import { pricingApi } from './pricing';
import { payrollApi } from './payroll';

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
