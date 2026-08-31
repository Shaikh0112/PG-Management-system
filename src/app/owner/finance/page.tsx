'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { Wallet, IndianRupee, TrendingDown, TrendingUp, Receipt, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Invoice, Payment, Expense } from '@/app/owner/lib/api/finance';
import { formatINR, formatDateOnly } from '@/lib/utils/formatters';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function OwnerFinancePage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId } = useOwnerPropertyContext();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices' | 'expenses'>('payments');

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    const data = api.finance.getStats(user.id, selectedPropertyId);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id, selectedPropertyId]);

  if (loading || !stats) {
    return <div className="p-6 animate-pulse">Loading finance data...</div>;
  }

  const netProfit = stats.revenue - stats.totalExpenses;
  const profitMargin = stats.revenue > 0 ? ((netProfit / stats.revenue) * 100).toFixed(1) : 0;
  const isProfitable = netProfit >= 0;

  // Group expenses by category for pie chart
  const expenseCategories = stats.expenses.reduce((acc: any, exp: Expense) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  
  const expenseLabels = Object.keys(expenseCategories).map(k => k.replace('_', ' ').toUpperCase());
  const expenseSeries = Object.values(expenseCategories) as number[];

  // Chart configs
  const expensePieOptions: any = {
    chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
    labels: expenseLabels,
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'],
    stroke: { show: false },
    theme: { mode: 'dark' },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: { show: true, formatter: (val: number) => `₹${val.toLocaleString()}` },
            total: {
              show: true,
              label: 'Total Expenses',
              formatter: () => `₹${stats.totalExpenses.toLocaleString()}`
            }
          }
        }
      }
    },
    legend: { position: 'bottom' }
  };

  // Mocking 6-month trend for Income vs Expense bar chart (since we don't have full historical data yet)
  const trendOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yaxis: { title: { text: '₹ (INR)' } },
    fill: { opacity: 1 },
    colors: ['#10b981', '#ef4444'], // Green for Income, Red for Expense
    theme: { mode: 'dark' },
    tooltip: { y: { formatter: (val: number) => `₹${val.toLocaleString()}` } }
  };
  
  const trendSeries = [
    { name: 'Income', data: [45000, 52000, 48000, 60000, 58000, stats.revenue] },
    { name: 'Expenses', data: [20000, 22000, 18000, 25000, 24000, stats.totalExpenses] }
  ];

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Financial Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track enterprise-grade financial metrics, revenue, and expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--primary)] transition-colors flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Record Expense
          </button>
        </div>
      </div>

      {/* Advanced Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Total Revenue */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--success)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-[var(--text-secondary)]">Total Revenue</div>
            <div className="p-1.5 bg-[var(--success-bg)] text-[var(--success)] rounded-md border border-[var(--success)]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--success)] transition-colors">
            {formatINR(stats.revenue)}
          </div>
          <div className="flex items-center text-xs text-[var(--success)] font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% from last month
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--danger)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-[var(--text-secondary)]">Total Expenses</div>
            <div className="p-1.5 bg-[var(--danger-bg)] text-[var(--danger)] rounded-md border border-[var(--danger)]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--danger)] transition-colors">
            {formatINR(stats.totalExpenses)}
          </div>
          <div className="flex items-center text-xs text-[var(--danger)] font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +5% from last month
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-[var(--text-secondary)]">Net Profit</div>
            <div className="p-1.5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-md border border-[var(--primary)]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {formatINR(netProfit)}
          </div>
          <div className={`flex items-center text-xs font-medium ${isProfitable ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {isProfitable ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            {profitMargin}% Profit Margin
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--warning)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-[var(--text-secondary)]">Pending Dues</div>
            <div className="p-1.5 bg-[var(--warning-bg)] text-[var(--warning)] rounded-md border border-[var(--warning)]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--warning)] transition-colors">
            {formatINR(stats.pendingDues)}
          </div>
          <div className="flex items-center text-xs text-[var(--warning)] font-medium cursor-pointer hover:underline">
            View defaulters list &rarr;
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Income vs Expense (6 Months Trend)</h3>
          <div className="h-[300px]">
            <Chart options={trendOptions} series={trendSeries} type="bar" height="100%" />
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Expense Breakdown</h3>
          <div className="h-[300px] flex items-center justify-center">
            {expenseSeries.length > 0 ? (
              <Chart options={expensePieOptions} series={expenseSeries} type="donut" height="100%" />
            ) : (
              <div className="text-[var(--text-secondary)] text-sm">No expenses recorded yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {[
            { id: 'payments', label: 'Recent Income', icon: Receipt },
            { id: 'expenses', label: 'Recent Expenses', icon: TrendingDown },
            { id: 'invoices', label: 'All Invoices', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
                  activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)]" />}
              </button>
            );
          })}
        </div>

        <div className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto">
          {activeTab === 'payments' && (
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs uppercase border-b border-[var(--border)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Source / Student</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Ref No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stats.payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[var(--text-secondary)]">No income records found.</td>
                  </tr>
                ) : (
                  stats.payments.map((p: Payment) => (
                    <tr key={p.id} className="hover:bg-[var(--bg-page)] transition-colors">
                      <td className="px-6 py-4 text-[var(--text-primary)]">{formatDateOnly(p.date)}</td>
                      <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{p.studentId === 'dummy' ? 'Unknown Student' : p.studentId}</td>
                      <td className="px-6 py-4 uppercase text-xs font-bold text-[var(--text-secondary)]">{p.method.replace('_', ' ')}</td>
                      <td className="px-6 py-4 font-bold text-[var(--success)]">+{formatINR(p.amount)}</td>
                      <td className="px-6 py-4 text-xs font-mono">{p.referenceNo || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'expenses' && (
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs uppercase border-b border-[var(--border)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stats.expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[var(--text-secondary)]">No expense records found.</td>
                  </tr>
                ) : (
                  stats.expenses.map((e: Expense) => (
                    <tr key={e.id} className="hover:bg-[var(--bg-page)] transition-colors">
                      <td className="px-6 py-4 text-[var(--text-primary)]">{formatDateOnly(e.date)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[var(--bg-input)] rounded border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          {e.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] max-w-xs truncate">{e.description}</td>
                      <td className="px-6 py-4 font-bold text-[var(--danger)]">-{formatINR(e.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          
          {activeTab === 'invoices' && (
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs uppercase border-b border-[var(--border)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Due Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stats.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[var(--text-secondary)]">No invoices found.</td>
                  </tr>
                ) : (
                  stats.invoices.map((i: Invoice) => (
                    <tr key={i.id} className="hover:bg-[var(--bg-page)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{i.month}</td>
                      <td className="px-6 py-4 text-[var(--text-primary)]">{formatDateOnly(i.dueDate)}</td>
                      <td className="px-6 py-4 font-bold">{formatINR(i.amount)}</td>
                      <td className="px-6 py-4">
                        {i.status.toLowerCase() === 'paid' ? <span className="text-[var(--success)] bg-[var(--success-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--success)]">Paid</span> :
                         i.status.toLowerCase() === 'pending' ? <span className="text-[var(--warning)] bg-[var(--warning-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--warning)]">Pending</span> :
                         <span className="text-[var(--danger)] bg-[var(--danger-bg)] px-2 py-1 rounded text-xs font-semibold border border-[var(--danger)]">Overdue</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
