'use client';
import { useEffect, useState } from 'react';
import { platformApi } from '@/lib/api/platform';
import { Users, FileText, Building2, UserCircle, CreditCard, Activity, Ticket, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BarChart } from '@/components/ui/charts/BarChart';

const MOCK_ACQUISITION_DATA = [
  { month: 'Mar', tenants: 120 },
  { month: 'Apr', tenants: 180 },
  { month: 'May', tenants: 250 },
  { month: 'Jun', tenants: 310 },
  { month: 'Jul', tenants: 450 },
  { month: 'Aug', tenants: 600 }
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would be an async fetch
    const data = platformApi.getDashboardStats();
    setStats(data);
  }, []);

  if (!stats) return <div className="animate-pulse">Loading dashboard...</div>;

  const kpis = [
    { label: 'TOTAL OWNERS', value: stats.activeOwnersCount, icon: Users, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-subtle)]', trend: '+12% vs last month', trendUp: true },
    { label: 'PENDING REQUESTS', value: stats.pendingRequestsCount, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]', trend: '-2% vs last month', trendUp: false },
    { label: 'ACTIVE PROPERTIES', value: stats.activePropertiesCount, icon: Building2, color: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)]', trend: '+5% vs last month', trendUp: true },
    { label: 'TOTAL TENANTS', value: stats.totalTenantsCount, icon: UserCircle, color: 'text-[var(--info)]', bg: 'bg-[var(--info-bg)]', trend: '+18% vs last month', trendUp: true },
    { label: 'MRR (DUMMY)', value: `₹${(stats.mrr/1000).toFixed(1)}k`, icon: CreditCard, color: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)]', trend: '+8.4% vs last month', trendUp: true },
    { label: 'NETWORK OCCUPANCY', value: `${stats.occupancyPercentage}%`, icon: Activity, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-subtle)]', trend: '+2.1% vs last month', trendUp: true },
    { label: 'OPEN TICKETS', value: stats.openTicketsCount, icon: Ticket, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-bg)]', trend: '-14% vs last month', trendUp: false },
    { label: 'EXPIRING PLANS', value: stats.expiringPlansCount, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-bg)]', trend: 'Next 30 days', trendUp: null },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg,12px)] shadow-sm flex flex-col justify-between min-h-[120px] group hover:-translate-y-1 hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-[var(--radius-md,8px)] flex items-center justify-center ${kpi.bg} bg-opacity-20`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <span className="text-[11px] font-bold text-[var(--text-secondary)] tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{kpi.value}</div>
            </div>
            {kpi.trend && (
              <div className={`text-xs mt-4 font-medium ${kpi.trendUp === true ? 'text-[var(--success)]' : kpi.trendUp === false ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}`}>
                {kpi.trendUp === true ? '↑ ' : kpi.trendUp === false ? '↓ ' : ''}{kpi.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Requests */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="font-semibold text-[var(--text-primary)]">Latest Owner Requests</h3>
            <Link href="/superadmin/owner-requests" className="text-sm text-[var(--primary)] hover:underline flex items-center">View All <ArrowUpRight className="w-4 h-4 ml-1"/></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--primary-subtle)] text-[var(--text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stats.latestRequests.map((r: any) => (
                  <tr key={r.id} className="h-12 even:bg-black/5 dark:even:bg-white/[0.02] hover:bg-[var(--primary-subtle)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{r.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{r.businessName}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{r.city}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.status === 'pending' ? 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]' : 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.latestRequests.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-[var(--text-secondary)] h-12">No requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Acquisition Chart (Bar) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Tenant Acquisition</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-6">New tenants joining the platform.</p>
          <BarChart data={MOCK_ACQUISITION_DATA} xAxisKey="month" dataKey="tenants" color="var(--primary)" height={280} />
        </div>
      </div>
    </div>
  );
}
