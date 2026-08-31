import { db } from '../storage/db';
import { createId } from '../utils/id';
import { BaseEntity } from '../types';
import { teamApi } from './team';

export interface SalaryPayment extends BaseEntity {
  ownerId: string;
  staffId: string;
  staffName: string;
  role: string;
  month: number;
  year: number;
  amount: number;
  status: 'Paid';
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer';
  transactionId?: string;
  paymentDate: string;
}

export const payrollApi = {
  processPayment: (data: Omit<SalaryPayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'status' | 'paymentDate'>) => {
    const payment: SalaryPayment = {
      ...data,
      id: createId('pay'),
      status: 'Paid',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.ownerId,
      updatedBy: data.ownerId,
      isDeleted: false
    };
    db.insert('spg_salary_payments' as any, payment as any);

    // Automatically create an Expense for this salary payment
    const { financeApi } = require('./finance');
    const { propertiesApi } = require('./properties');
    const ownerProps = propertiesApi.listByOwner(data.ownerId);
    if (ownerProps.length > 0) {
      financeApi.createExpense({
        propertyId: ownerProps[0].id, // Assign to first property for now
        category: 'staff_salary',
        amount: data.amount,
        description: `Salary: ${data.staffName} (${data.role}) - ${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}`
      }, data.ownerId);
    }

    return payment;
  },

  getPayrollStatus: (ownerId: string, month: number, year: number) => {
    // Get all staff members for this owner
    const staffList = teamApi.listByOwner(ownerId);
    
    // Get all payments for this month/year
    const payments = db.getAll<SalaryPayment>('spg_salary_payments' as any)
      .filter(p => p.ownerId === ownerId && p.month === month && p.year === year && !p.isDeleted);

    // Merge staff with their payment status
    return staffList.map(member => {
      const payment = payments.find(p => p.staffId === member.profile.id);
      return {
        staff: {
          id: member.profile.id,
          name: member.user.name,
          phone: member.user.phone,
          staffType: member.profile.staffType,
          salary: member.profile.salary
        },
        isPaid: !!payment,
        paymentDetails: payment || null
      };
    });
  }
};
