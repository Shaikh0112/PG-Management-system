'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useOwnerPropertyContext } from '@/components/owner/OwnerPropertyContext';
import { BarChart3, PieChart, Download, Building, Users, AlertCircle } from 'lucide-react';

export default function OwnerReportsPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId } = useOwnerPropertyContext();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const data = api.reports.getOwnerReport(user.id, selectedPropertyId);
    setReport(data);
    setLoading(false);
  }, [user?.id, selectedPropertyId]);

  const handleExport = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `pg_report_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  if (loading || !report) return <div className="p-6 animate-pulse">Loading reports...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Analytics & Reports</h1>
          <p className="text-sm text-[var(--text-secondary)]">Insights into occupancy, collections, and complaints.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-2 rounded-[var(--radius-md,8px)] font-medium hover:border-[var(--primary)] transition-colors flex items-center gap-2 text-sm shadow-sm justify-center"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Occupancy Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 hover:border-[var(--primary-subtle)] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[rgba(99,102,241,0.1)] text-[var(--primary)] rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Occupancy Rate</h3>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-[var(--primary)]">{report.occupancyRate}%</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-2 mb-2">
            <div className="bg-[var(--primary)] h-2 rounded-full" style={{ width: `${report.occupancyRate}%` }}></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{report.occupiedBeds} out of {report.totalBeds} beds occupied</p>
        </div>

        {/* Collection Efficiency Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 hover:border-[var(--success)] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[rgba(16,185,129,0.1)] text-[var(--success)] rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Collection Efficiency</h3>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-[var(--success)]">{report.collectionEfficiency}%</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-2 mb-2">
            <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: `${report.collectionEfficiency}%` }}></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Of total generated invoices this month</p>
        </div>

        {/* Complaints Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 hover:border-[var(--warning)] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--warning-bg)] text-[var(--warning)] rounded-lg border border-[var(--warning)]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Open Complaints</h3>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-[var(--warning)]">{report.openComplaints}</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-2 mb-2">
            <div className="bg-[var(--warning)] h-2 rounded-full w-1/3"></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Total {report.totalComplaints} complaints filed historically</p>
        </div>
      </div>
    </div>
  );
}
