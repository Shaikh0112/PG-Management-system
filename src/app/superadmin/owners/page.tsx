'use client';
import { useState, useEffect } from 'react';
import { ownersApi } from '@/app/owner/lib/api/owners';
import { Search, Filter, MoreVertical, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/utils/formatters';
import { StatusBadge } from '@/config/statusBadgeConfig';

export default function OwnersDirectoryPage() {
  const router = useRouter();
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setOwners(ownersApi.listOwners());
    setLoading(false);
  }, []);

  const filtered = owners.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.name.toLowerCase().includes(q) || o.businessName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">PG Owners Directory</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage registered owners and their platform usage.</p>
        </div>
        <Link href="/superadmin/create-owner" className="bg-[var(--primary)] text-white px-4 py-2 rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
          + Add New Owner
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--bg-card)] rounded-t-[var(--radius-lg,12px)]">
          <div className="flex gap-2">
            {['All', 'Active', 'Pending', 'Suspended'].map(f => (
              <button 
                key={f} 
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-[var(--radius-full,999px)] transition-colors ${statusFilter === f ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search by name, business, email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus,var(--primary))] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--primary-subtle)] text-[var(--text-secondary)] uppercase text-[12px] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Owner Info</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold text-center">Portfolio</th>
                <th className="px-6 py-4 font-semibold text-right">Collection</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">Loading owners...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No owners found</h3>
                    <p className="text-[var(--text-secondary)] text-sm">No owners match your current filters.</p>
                  </td>
                </tr>
              ) : filtered.map((o) => (
                <tr key={o.id} onClick={() => router.push(`/superadmin/owners/${o.id}`)} className="h-12 even:bg-black/5 dark:even:bg-white/[0.02] hover:bg-[var(--primary-subtle)] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">{o.name}</div>
                    <div className="text-[var(--text-secondary)] truncate max-w-[200px]">{o.businessName}</div>
                    <div className="text-[11px] text-[var(--text-disabled)] mt-0.5 truncate max-w-[200px]">{o.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-[var(--text-primary)] capitalize">{o.planId}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-medium text-[var(--text-primary)]">{o.propertiesCount} PGs</div>
                    <div className="text-[var(--text-secondary)] text-[12px]">{o.bedsCount} Beds ({o.occupancy}% full)</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[var(--success)]">
                    {formatINR(o.collectionThisMonth)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="transition-opacity">
                      <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-[var(--radius-md,8px)] transition-colors" title="Quick Delete">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}