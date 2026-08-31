'use client';
import { useState, useEffect } from 'react';
import { ownersApi } from '@/app/owner/lib/api/owners';
import { Search, Save, Settings2 } from 'lucide-react';

export default function FeatureFlagsPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // MOCK AVAILABLE FEATURES
  const availableFeatures = ['whatsapp_alerts', 'custom_domain', 'smart_meters', 'payment_gateway'];

  useEffect(() => {
    // For demo purposes, we'll map the subscription features into the owner object
    setOwners(ownersApi.listOwners());
    setLoading(false);
  }, []);

  const handleToggle = (ownerId: string, feature: string) => {
    alert(`Toggled ${feature} for owner ${ownerId}. (Simulated API Call)`);
  };

  const filtered = owners.filter(o => o.businessName.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse p-6">Loading feature flags...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Feature Flags</h1>
        <p className="text-[var(--text-secondary)] text-sm">Manage experimental and premium features per owner.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-page)] rounded-t-[var(--radius-lg,12px)]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Find owner..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] pl-9 pr-4 py-2 rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium bg-[var(--primary-subtle)] px-4 py-2 rounded-md hover:bg-[rgba(99,102,241,0.2)] transition-colors">
            <Settings2 className="w-4 h-4"/> Global Defaults
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-secondary)] text-[12px] uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold sticky left-0 bg-[var(--bg-card)] z-10">Owner</th>
                <th className="px-6 py-4 font-semibold text-center">Plan</th>
                {availableFeatures.map(f => (
                  <th key={f} className="px-6 py-4 font-semibold text-center border-l border-[var(--border)]">{f.replace('_', ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-[rgba(99,102,241,0.03)] transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-[var(--bg-card)] z-10 border-r border-[var(--border)]">
                    <div className="font-bold text-[var(--text-primary)] line-clamp-1">{o.businessName}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{o.id}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-[var(--bg-page)] border border-[var(--border)] rounded text-[11px] font-bold text-[var(--text-secondary)] uppercase">{o.planId}</span>
                  </td>
                  {availableFeatures.map(f => (
                    <td key={f} className="px-6 py-4 text-center border-l border-[var(--border)]">
                      <input 
                        type="checkbox" 
                        onChange={() => handleToggle(o.id, f)}
                        defaultChecked={Math.random() > 0.5} // Simulating random state for UI
                        className="w-4 h-4 text-[var(--primary)] bg-[var(--bg-input)] border-[var(--border)] rounded cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}