'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { IndianRupee, Plus, Receipt, AlertCircle, Loader2 } from 'lucide-react';
import { formatINR, formatDateOnly } from '@/lib/utils/formatters';
import { useToast } from '@/lib/ui/ToastContext';

export default function ManagerExpensesPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId, loading: propsLoading } = useManagerPropertyContext();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: 'maintenance',
    amount: '',
    description: ''
  });

  const loadExpenses = () => {
    if (!user || !selectedPropertyId) return;
    setLoading(true);
    // Fetch stats which includes expenses
    const stats = api.finance.getStats(user.id, selectedPropertyId);
    setExpenses(stats.expenses);
    setLoading(false);
  };

  useEffect(() => {
    if (!propsLoading && selectedPropertyId) {
      loadExpenses();
    }
  }, [propsLoading, selectedPropertyId, user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPropertyId) return;

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!formData.description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    setIsSubmitting(true);
    
    // Create expense
    api.finance.createExpense({
      propertyId: selectedPropertyId,
      category: formData.category as any,
      amount: Number(formData.amount),
      description: formData.description
    }, user.id);

    showToast('Expense logged successfully', 'success');
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ category: 'maintenance', amount: '', description: '' });
    loadExpenses(); // refresh list
  };

  if (propsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (!selectedPropertyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="w-16 h-16 text-[var(--warning)] mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Property Required</h2>
        <p className="text-[var(--text-secondary)] mt-2">Please select a property from the top menu to view or log expenses.</p>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    maintenance: 'Maintenance & Repairs',
    electricity: 'Electricity Bill',
    water: 'Water Bill',
    kitchen_stock: 'Groceries & Kitchen',
    cleaning: 'Cleaning & Housekeeping',
    staff_salary: 'Staff Salary',
    other: 'Other'
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Operating Expenses</h1>
          <p className="text-[var(--text-secondary)]">Log and track daily expenses for this property.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-[var(--radius-md,8px)] font-bold flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-colors shadow-lg shadow-[var(--primary-subtle)] w-fit"
        >
          <Plus className="w-5 h-5" /> Log Expense
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-input)]">
          <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--primary)]" /> Recent Expenses
          </h2>
        </div>
        
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] flex flex-col items-center">
            <Receipt className="w-12 h-12 mb-3 opacity-20" />
            <p>No expenses logged for this property yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-input)]/50 text-[var(--text-secondary)]">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                  <tr key={exp.id} className="hover:bg-[var(--bg-input)] transition-colors">
                    <td className="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                      {formatDateOnly(exp.date)}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[var(--text-primary)]">{exp.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-xs text-[var(--text-secondary)]">
                        {categoryLabels[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-[var(--danger)] flex items-center justify-end gap-1">
                        <IndianRupee className="w-3.5 h-3.5" /> {exp.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg,12px)] w-full max-w-md shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-input)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Log New Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    required
                  >
                    {Object.entries(categoryLabels).filter(([k]) => k !== 'staff_salary').map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="e.g. 500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="What was this expense for?"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] font-bold hover:bg-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-[var(--radius-md,8px)] font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
