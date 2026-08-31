'use client';
import { useState, useEffect } from 'react';
import { platformApi } from '@/lib/api/platform';
import { TrendingUp, Users, Building2, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { DonutChart } from '@/components/ui/charts/DonutChart';

const MOCK_REVENUE_DATA = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 61000 },
  { month: 'Apr', revenue: 58000 },
  { month: 'May', revenue: 75000 },
  { month: 'Jun', revenue: 89000 },
  { month: 'Jul', revenue: 105000 }
];

const MOCK_PLAN_DATA = [
  { name: 'Basic', value: 45 },
  { name: 'Pro', value: 30 },
  { name: 'Enterprise', value: 15 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(platformApi.getDashboardStats());
  }, []);

  if (!stats) return <div className="animate-pulse p-6">Loading analytics...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Platform Analytics</h1>
        <p className="text-[var(--text-secondary)] text-sm">Real-time aggregate network performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network MRR', value: `₹${(stats.mrr/100000).toFixed(2)}L`, trend: '+12.5%', isUp: true, icon: CreditCard, color: 'text-[var(--success)]' },
          { label: 'Platform Occupancy', value: `${stats.occupancyPercentage}%`, trend: '+2.1%', isUp: true, icon: Activity, color: 'text-[var(--primary)]' },
          { label: 'Active Tenants', value: stats.totalTenantsCount.toLocaleString(), trend: '+45', isUp: true, icon: Users, color: 'text-[var(--info)]' },
          { label: 'Churn Rate', value: '1.2%', trend: '-0.3%', isUp: false, icon: TrendingUp, color: 'text-[var(--danger)]' } // simulated trend
        ].map((k, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg,12px)] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[var(--bg-page)] rounded-[var(--radius-md,8px)]">
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full ${k.isUp ? (k.label === 'Churn Rate' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--success-bg)] text-[var(--success)]') : 'bg-[var(--success-bg)] text-[var(--success)]'}`}>
                {k.trend} {k.isUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
              </div>
            </div>
            <div className="text-[28px] font-bold text-[var(--text-primary)]">{k.value}</div>
            <div className="text-[12px] text-[var(--text-secondary)] font-medium mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm p-5">
          <div className="mb-4">
            <h2 className="font-bold text-[var(--text-primary)]">Revenue Growth (MRR)</h2>
            <p className="text-xs text-[var(--text-secondary)]">Simulated month-over-month recurring revenue.</p>
          </div>
          <AreaChart data={MOCK_REVENUE_DATA} xAxisKey="month" dataKey="revenue" color="var(--primary)" height={300} />
        </div>

        {/* Plan Distribution Donut */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm p-5">
          <div className="mb-4">
            <h2 className="font-bold text-[var(--text-primary)]">Owners by Plan</h2>
            <p className="text-xs text-[var(--text-secondary)]">Distribution of active subscriptions.</p>
          </div>
          <DonutChart data={MOCK_PLAN_DATA} height={300} />
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Building2 className="w-4 h-4"/> Top Performing Properties (Simulated)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] text-[12px] uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Property Name</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold text-center">Beds</th>
                <th className="px-6 py-4 font-semibold text-center">Occupancy</th>
                <th className="px-6 py-4 font-semibold text-right">Revenue (MTD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="h-12 even:bg-black/5 dark:even:bg-white/[0.02] hover:bg-[var(--primary-subtle)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">Elite PG {i}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">Owner {i}</td>
                  <td className="px-6 py-4 text-center font-medium text-[var(--text-primary)]">{i * 20 + 50}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-full h-2">
                      <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: `${90 - i*5}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">{90 - i*5}%</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[var(--success)]">₹{(i*150000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}