'use client';

import { useState, useEffect } from 'react';
import { useOwnerPropertyContext } from '@/app/owner/components/OwnerPropertyContext';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { 
  Building2, Bed, Users, IndianRupee, DoorOpen, BarChart, TrendingUp, TrendingDown,
  PieChart, Filter, Activity, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function OwnerDashboard() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, loading: propsLoading } = useOwnerPropertyContext();
  
  const [filterPropId, setFilterPropId] = useState<string>('all');
  
  // Use dashboard API
  const globalMetrics = api.dashboard.getOwnerMetrics(user?.id || '', 'all');
  const propMetrics = api.dashboard.getOwnerMetrics(user?.id || '', filterPropId === 'all' ? properties[0]?.id || '' : filterPropId);

  useEffect(() => {
    if (filterPropId === 'all' && properties.length > 0) {
      setFilterPropId(properties[0].id);
    }
  }, [properties, filterPropId]);

  if (propsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-[rgba(99,102,241,0.1)] rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to SmartPG!</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          You haven't added any properties yet. Create your first PG to start managing students, rent, and staff.
        </p>
        <Link 
          href="/owner/properties/create"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          ➕ Create your first PG
        </Link>
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---
  const incomeTrendOptions: any = {
    chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
    colors: ['#10B981', '#EF4444'], // Success green for collected, Danger red for pending
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { 
      categories: propMetrics.collectionVsPending.map(d => d.month),
      labels: { style: { colors: '#94A3B8' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#94A3B8' },
        formatter: (val: number) => `₹${val.toLocaleString()}`
      }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    theme: { mode: 'dark' },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94A3B8' } },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => `₹${val.toLocaleString()}` } },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 90, 100] } }
  };
  
  const incomeTrendSeries = [
    { name: 'Collected', data: propMetrics.collectionVsPending.map(d => d.collected) },
    { name: 'Pending', data: propMetrics.collectionVsPending.map(d => d.pending) }
  ];

  const expenseBreakdownOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    labels: globalMetrics.expenseBreakdown.map(e => e.category.replace('_', ' ').toUpperCase()),
    colors: ['#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'],
    theme: { mode: 'dark' },
    plotOptions: {
      pie: {
        donut: { size: '75%', labels: { show: true, name: { color: '#94A3B8', fontSize: '12px' }, value: { color: '#F0F0FF', fontSize: '24px', fontWeight: 800, formatter: (val: number) => `₹${val.toLocaleString()}` } } }
      }
    },
    stroke: { show: false },
    legend: { position: 'right', labels: { colors: '#94A3B8' }, markers: { radius: 12 } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val: number) => `₹${val.toLocaleString()}` } }
  };

  const expenseBreakdownSeries = globalMetrics.expenseBreakdown.map(e => e.amount);

  const profitMargin = globalMetrics.thisMonthCollection > 0 
    ? Math.round((globalMetrics.netProfit / globalMetrics.thisMonthCollection) * 100) 
    : 0;

  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-300">
      
      {/* --------------------------------------------------------------------- */}
      {/* SECTION 1: EXECUTIVE FINANCIAL SUMMARY                                */}
      {/* --------------------------------------------------------------------- */}
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Executive Summary</h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mt-1">Global Financial Performance • {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* NET PROFIT CARD (HERO) */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[var(--primary)] to-indigo-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-700"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-2 opacity-80">
                  <BarChart className="w-6 h-6" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">True Net Profit</h2>
                </div>
                <div className="text-5xl md:text-7xl font-black tracking-tighter">
                  ₹{globalMetrics.netProfit.toLocaleString('en-IN')}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${profitMargin >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {profitMargin >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {profitMargin}% Margin
                  </div>
                  <span className="opacity-75">After all expenses</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[280px] bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1 border-b border-white/10 pb-2">Profit Calculation</div>
                
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="opacity-80">Total Revenue</span>
                  <span className="text-green-400">+ ₹{globalMetrics.thisMonthCollection.toLocaleString('en-IN')}</span>
                </div>
                
                {globalMetrics.expenseBreakdown.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-medium">
                    <span className="opacity-80 capitalize">{exp.category.replace('_', ' ')}</span>
                    <span className="text-red-400">- ₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}

                {globalMetrics.expenseBreakdown.length === 0 && (
                   <div className="text-xs opacity-50 italic text-center py-2">No expenses yet</div>
                )}
                
                <div className="border-t border-white/10 mt-1 pt-2 flex justify-between items-center text-base font-bold">
                  <span>Net Profit</span>
                  <span className={globalMetrics.netProfit >= 0 ? "text-green-400" : "text-red-400"}>= ₹{globalMetrics.netProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2: EXPENSES & INCOME CHARTS                                   */}
      {/* --------------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Where is my money going? (Expense Breakdown) */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[var(--warning)]" /> Expense Breakdown
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Where your money is going this month</p>
            </div>
          </div>
          
          {globalMetrics.expenseBreakdown && globalMetrics.expenseBreakdown.length > 0 ? (
            <div className="h-[280px] w-full flex items-center justify-center">
              {(typeof window !== 'undefined') && (
                <ReactApexChart options={expenseBreakdownOptions} series={expenseBreakdownSeries} type="donut" height={280} />
              )}
            </div>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <PieChart className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No expenses recorded yet</p>
            </div>
          )}
        </div>

        {/* Income Trend Chart */}
        <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--success)]" /> Revenue Health
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Collection vs Pending dues over time</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {(typeof window !== 'undefined') && (
              <ReactApexChart options={incomeTrendOptions} series={incomeTrendSeries} type="area" height={280} />
            )}
          </div>
        </div>
      </section>

      <hr className="border-[var(--border)]" />

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 3: PROPERTY SPECIFIC OPERATIONS                               */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[var(--primary)]" />
              Operational View
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Drill down into specific branch metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[var(--text-secondary)]" />
            <select
              value={filterPropId}
              onChange={(e) => setFilterPropId(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm min-w-[200px]"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Occupancy</div>
              <div className="text-3xl font-black text-[var(--text-primary)]">
                {propMetrics.occupancyPercent}%
              </div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">{propMetrics.occupiedBeds} / {propMetrics.totalBeds} Beds</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
               <Bed className="w-6 h-6 text-[var(--primary)]" />
            </div>
          </div>
          
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Vacant Beds</div>
              <div className="text-3xl font-black text-[var(--success)]">{propMetrics.vacantBeds}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Ready to rent</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
               <DoorOpen className="w-6 h-6 text-[var(--success)]" />
            </div>
          </div>
          
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Pending Rent</div>
              <div className="text-3xl font-black text-[var(--danger)]">₹{propMetrics.pendingRent.toLocaleString('en-IN')}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">To be collected</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[var(--danger-bg)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
               <AlertCircle className="w-6 h-6 text-[var(--danger)]" />
            </div>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Open Issues</div>
              <div className="text-3xl font-black text-[var(--warning)]">{propMetrics.openComplaints}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Active complaints</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[var(--warning-bg)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
               <Users className="w-6 h-6 text-[var(--warning)]" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
