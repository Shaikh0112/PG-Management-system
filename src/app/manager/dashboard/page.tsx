'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession, clearSession } from '@/lib/auth/session';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { 
  Users, 
  BedDouble, 
  ClipboardCheck, 
  AlertCircle, 
  AlertTriangle,
  UserPlus, 
  Wallet, 
  Clock, 
  Lock,
  TrendingUp,
  Package,
  IndianRupee,
  PieChart
} from 'lucide-react';
import { StockRequest } from '@/app/staff/lib/api/stockRequests';
import { mealsApi, MealStatus } from '@/lib/api/meals';
import { Utensils } from 'lucide-react';

export default function ManagerDashboard() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { properties, selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kitchenRequests, setKitchenRequests] = useState<StockRequest[]>([]);
  const [readyMeals, setReadyMeals] = useState<MealStatus[]>([]);

  const loadData = () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    setStats(api.managerDashboard.getStats(selectedPropertyId));
    setKitchenRequests(api.stockRequests.getByProperty(selectedPropertyId).filter(r => ['pending'].includes(r.status)));
    setReadyMeals(mealsApi.getAllTodayStatuses(selectedPropertyId).filter(m => m.status === 'ready'));
    setLoading(false);
  };

  useEffect(() => {
    if (!ctxLoading) loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleAnnounceMeal = (mealType: 'Breakfast'|'Lunch'|'Dinner') => {
    if (!user || !selectedPropertyId) return;
    mealsApi.announceMeal(selectedPropertyId, mealType, user.id);
    loadData();
  };

  if (ctxLoading || loading) {
    return <div className="p-6 animate-pulse text-slate-400">Loading operational dashboard...</div>;
  }

  if (properties.length === 0 || !selectedPropertyId) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-6 border border-[var(--border)]">
          <Lock className="w-10 h-10 text-[var(--text-secondary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Property Assigned</h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          You have not been assigned to manage any PG yet. Please contact your PG Owner to grant you access to a property.
        </p>
        <button 
          onClick={() => {
            if(typeof window !== 'undefined'){ 
              clearSession(); 
              window.location.href='/'; 
            }
          }}
          className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-[var(--radius-md,8px)] transition-colors"
        >
          Logout for now
        </button>
      </div>
    );
  }

  const selectedProp = properties.find(p => p.id === selectedPropertyId);

  const widgets = [
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: Users, color: 'text-[var(--primary)]', bg: 'bg-[rgba(99,102,241,0.1)]' },
    { label: 'Vacant Beds', value: stats?.vacantBeds || 0, icon: BedDouble, color: 'text-[var(--success)]', bg: 'bg-[rgba(10,185,129,0.1)]' },
    { label: 'Today Check-ins', value: stats?.todayCheckins || 0, icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Open Complaints', value: stats?.openComplaints || 0, icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]' },
    { label: 'Pending Visitors', value: stats?.pendingVisitors || 0, icon: UserPlus, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]' },
    { label: 'Overdue Rent', value: stats?.overdueStudentsCount || 0, icon: Wallet, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]' },
    { label: 'Late Entries', value: stats?.lateEntries || 0, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]' },
    { label: 'Active SOS', value: stats?.activeSos || 0, icon: AlertCircle, color: 'text-white', bg: 'bg-red-600 animate-pulse' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Operational Overview for <span className="text-[var(--primary)] font-medium">{selectedProp?.name}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {widgets.map((w, i) => {
          const Icon = w.icon;
          return (
            <div key={i} className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 hover:-translate-y-1 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-16 h-16 ${w.bg} rounded-full blur-xl opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className={`p-2 rounded-lg ${w.bg}`}>
                  <Icon className={`w-5 h-5 ${w.color}`} />
                </div>
                <div className="text-xs font-medium text-[var(--text-secondary)] leading-tight">{w.label}</div>
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)] relative z-10">{w.value}</div>
            </div>
          );
        })}
      </div>

      {/* Meal Announcements */}
      {readyMeals.length > 0 && (
        <div className="mb-6 bg-[rgba(99,102,241,0.05)] border border-[var(--primary)] border-opacity-30 rounded-[var(--radius-lg,12px)] p-6">
          <h2 className="text-lg font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Meals Ready for Announcement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyMeals.map(meal => (
              <div key={meal.id} className="bg-[var(--bg-card)] border border-[var(--primary)] border-opacity-20 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[var(--primary-bg)] rounded-full flex items-center justify-center text-[var(--primary)] mb-3">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">{meal.mealType} is Ready!</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">The cook has prepared the meal.</p>
                <button 
                  onClick={() => handleAnnounceMeal(meal.mealType)}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Announce to Students
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kitchen Alerts */}
      {kitchenRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            Urgent Kitchen Requests ({kitchenRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitchenRequests.map(req => (
              <div key={req.id} className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-lg,12px)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{req.itemName}</h3>
                    <p className="text-sm text-[var(--danger)] font-medium">
                      Requested: {req.quantityRequested} {req.unit}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.1)] text-[var(--danger)] uppercase">
                    NEW REQUEST
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href="/manager/inventory" className="flex-1 bg-[var(--primary)] text-white px-3 py-2 rounded text-xs font-bold text-center hover:bg-[var(--primary-hover)] transition-colors">
                    Fulfill in Inventory
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/manager/students" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[rgba(99,102,241,0.05)] hover:border-[var(--primary)] transition-all">
            <div className="p-3 bg-[rgba(99,102,241,0.1)] rounded-full text-[var(--primary)]">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Add Student</span>
          </Link>
          <Link href="/manager/finance" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[rgba(16,185,129,0.05)] hover:border-[var(--success)] transition-all">
            <div className="p-3 bg-[rgba(16,185,129,0.1)] rounded-full text-[var(--success)]">
              <IndianRupee className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Collect Rent</span>
          </Link>
          <Link href="/manager/complaints" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[rgba(239,68,68,0.05)] hover:border-[var(--danger)] transition-all">
            <div className="p-3 bg-[rgba(239,68,68,0.1)] rounded-full text-[var(--danger)]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Complaints</span>
          </Link>
          <Link href="/manager/inventory" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[rgba(245,158,11,0.05)] hover:border-[var(--warning)] transition-all">
            <div className="p-3 bg-[rgba(245,158,11,0.1)] rounded-full text-[var(--warning)]">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Inventory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
