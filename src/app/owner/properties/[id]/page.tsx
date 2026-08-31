'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Property } from '@/app/owner/lib/api/properties';
import { getSession } from '@/lib/auth/session';
import { ArrowLeft, Building2, Trash2, Users, Bed, Settings, AlertTriangle, IndianRupee, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/storage/db';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { PricingRule } from '@/lib/types/contract';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const user = typeof window !== 'undefined' ? getSession() : null;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // Optional: load some basic room data to preview
  const [roomsCount, setRoomsCount] = useState(0);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', startMonth: 1, endMonth: 1, adjustmentType: 'percentage' as 'percentage'|'fixed', adjustmentValue: 0 });

  useEffect(() => {
    if (user && id) {
      const prop = api.properties.getById(id);
      if (!prop || prop.ownerId !== user.id) {
        router.replace('/owner/properties');
        return;
      }
      setProperty(prop);
      
      const allRooms = db.getAll<any>(STORAGE_KEYS.ROOMS);
      const myRooms = allRooms.filter(r => r.propertyId === id && !r.isDeleted);
      setRoomsCount(myRooms.length);
      setPricingRules(api.pricing.listByProperty(id));
      
      const team = api.team.listByOwner(user.id);
      const propertyManagers = team.filter((m: any) => m.user.assignedPropertyIds?.includes(id) && (m.profile.staffType === 'manager' || m.user.role === 'manager'));
      setManagers(propertyManagers);
    }
    setLoading(false);
  }, [id, user?.id, router]);

  if (loading) return <div className="p-6 animate-pulse">Loading property details...</div>;
  if (!property) return null; // handled by redirect

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this property? All associated rooms and data will be lost.')) {
      db.update(STORAGE_KEYS.PROPERTIES, property.id, { isDeleted: true });
      router.push('/owner/properties');
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if(user && property) {
      const rule = api.pricing.create({...newRule, propertyId: property.id}, user.id);
      setPricingRules([rule, ...pricingRules]);
      setShowAddRule(false);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (user && confirm('Delete this pricing rule?')) {
      api.pricing.delete(ruleId, user.id);
      setPricingRules(pricingRules.filter(r => r.id !== ruleId));
    }
  };

  const coverPhoto = property.photos?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/owner/properties" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">{property.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{property.city} • {property.type.toUpperCase()}</p>
        </div>
      </div>

      {/* Header Image */}
      <div className="w-full h-48 md:h-64 rounded-[var(--radius-lg,12px)] overflow-hidden relative border border-[var(--border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <div className="text-sm font-medium opacity-90 mb-1">{property.address}, {property.pincode}</div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
            <span className="bg-[var(--primary)] px-2 py-1 rounded-md">{property.floorsCount} Floors</span>
            {property.messEnabled && <span className="bg-[var(--success)] px-2 py-1 rounded-md">Mess Enabled</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Property Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-[var(--text-secondary)] uppercase font-medium mb-1">Night Entry</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{property.nightEntryTime}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] uppercase font-medium mb-1">Notice Period</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{property.noticePeriodDays} Days</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] uppercase font-medium mb-1">Rent Cycle</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{property.rentCycleDate}st of Month</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] uppercase font-medium mb-1">Deposit</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">₹{property.defaultDeposit}</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.length > 0 ? (
                  property.amenities.map(am => (
                    <span key={am} className="px-3 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-full text-xs font-medium text-[var(--text-primary)]">
                      {am}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">No amenities listed.</span>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Description</h3>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {property.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Quick Actions / Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/owner/rooms" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 hover:shadow-lg transition-all group cursor-pointer block">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                  <Bed className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-[var(--text-primary)]">{roomsCount}</span>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Manage Rooms</h3>
              <p className="text-xs text-[var(--text-secondary)]">View and manage beds, pricing, and availability.</p>
            </Link>

            <Link href="/owner/team" className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 hover:shadow-lg transition-all group cursor-pointer block">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[var(--success)] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Assigned Team</h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage managers, wardens, and staff for this PG.</p>
            </Link>
          </div>
          
          {/* Dynamic Pricing Rules */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Seasonal Pricing Rules</h2>
              <button onClick={() => setShowAddRule(!showAddRule)} className="text-sm bg-[var(--primary-subtle)] text-[var(--primary)] px-3 py-1.5 rounded-[var(--radius-md,8px)] font-medium flex items-center gap-1 hover:bg-[rgba(99,102,241,0.15)] transition-colors">
                {showAddRule ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {showAddRule ? 'Cancel' : 'Add Rule'}
              </button>
            </div>
            
            {showAddRule && (
              <form onSubmit={handleAddRule} className="mb-6 p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)] bg-[var(--bg-page)] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Rule Name</label>
                    <input required type="text" value={newRule.name} onChange={e=>setNewRule({...newRule, name: e.target.value})} placeholder="e.g. Summer Hike" className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Month (1-12)</label>
                    <input required type="number" min="1" max="12" value={newRule.startMonth} onChange={e=>setNewRule({...newRule, startMonth: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Month (1-12)</label>
                    <input required type="number" min="1" max="12" value={newRule.endMonth} onChange={e=>setNewRule({...newRule, endMonth: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Type</label>
                    <select value={newRule.adjustmentType} onChange={e=>setNewRule({...newRule, adjustmentType: e.target.value as any})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Value (+ or -)</label>
                    <input required type="number" value={newRule.adjustmentValue} onChange={e=>setNewRule({...newRule, adjustmentValue: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[var(--primary-hover)]">Save Rule</button>
              </form>
            )}

            {pricingRules.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No seasonal rules defined. Standard room rates will apply year-round.</p>
            ) : (
              <div className="space-y-3">
                {pricingRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-[var(--radius-md,8px)] bg-[var(--bg-input)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{rule.name}</h4>
                      <div className="text-xs text-[var(--text-secondary)]">Months: {rule.startMonth} to {rule.endMonth}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${rule.adjustmentValue >= 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                        {rule.adjustmentValue > 0 ? '+' : ''}{rule.adjustmentValue}{rule.adjustmentType === 'percentage' ? '%' : ' INR'}
                      </span>
                      <button onClick={() => handleDeleteRule(rule.id)} className="text-[var(--danger)] hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Settings & Danger Zone */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[var(--text-secondary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Assigned Managers</h2>
            </div>
            
            {managers.length > 0 ? (
              <div className="space-y-4">
                {managers.map(m => (
                  <div key={m.user.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{m.user.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{m.user.phone} • {m.user.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--text-secondary)] mb-4">No managers assigned to this property yet.</div>
            )}
            
            <Link href="/owner/team" className="block text-center w-full mt-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors">
              Assign Manager
            </Link>
          </div>

          <div className="bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)] rounded-[var(--radius-lg,12px)] p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--danger)]">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Danger Zone</h2>
            </div>
            <p className="text-xs text-[var(--danger)] opacity-80 mb-4">
              Once you delete a property, there is no going back. Please be certain.
            </p>
            <button 
              onClick={handleDelete}
              className="w-full bg-[var(--danger)] text-white font-bold py-2 rounded-[var(--radius-md,8px)] shadow-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
