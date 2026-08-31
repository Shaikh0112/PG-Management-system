'use client';
import { useState, useEffect } from 'react';
import { plansApi, Plan } from '@/lib/api/plans';
import { Check, Edit, X, Save } from 'lucide-react';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const loadPlans = () => {
    setPlans(plansApi.listPlans());
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!editPlan) return;
    plansApi.updatePlan(editPlan.id, editPlan);
    setEditPlan(null);
    loadPlans();
  };

  if (loading) return <div className="animate-pulse p-6">Loading plans...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Subscription Plans</h1>
        <p className="text-[var(--text-secondary)] text-sm">Manage pricing and limits for SaaS subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm flex flex-col hover:shadow-lg transition-shadow">
            <div className={`p-6 border-b border-[var(--border)] text-center ${plan.id === 'platinum' ? 'bg-[rgba(99,102,241,0.05)]' : ''}`}>
              <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase">{plan.name}</h2>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-[var(--text-primary)]">₹{plan.price.toLocaleString()}</span>
                <span className="text-[var(--text-secondary)] font-medium">/mo</span>
              </div>
              <button 
                onClick={() => setEditPlan(plan)}
                className="mt-6 w-full py-2 border border-[var(--primary)] text-[var(--primary)] font-medium rounded-[var(--radius-md,8px)] hover:bg-[var(--primary)] hover:text-white transition-colors"
              >
                Edit Configuration
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Max Properties</span>
                  <span className="font-bold text-[var(--text-primary)]">{plan.maxProperties === 999 ? 'Unlimited' : plan.maxProperties}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Max Beds</span>
                  <span className="font-bold text-[var(--text-primary)]">{plan.maxBeds === 9999 ? 'Unlimited' : plan.maxBeds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Max Staff</span>
                  <span className="font-bold text-[var(--text-primary)]">{plan.maxStaff === 999 ? 'Unlimited' : plan.maxStaff}</span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Included Features</div>
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                    <Check className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="capitalize">{f.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase">Edit {editPlan.name} Plan</h3>
              <button onClick={() => setEditPlan(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Monthly Price (₹)</label>
                <input type="number" required min="0" value={editPlan.price} onChange={e=>setEditPlan({...editPlan, price: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2.5 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Properties</label>
                  <input type="number" required min="1" value={editPlan.maxProperties} onChange={e=>setEditPlan({...editPlan, maxProperties: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Beds</label>
                  <input type="number" required min="1" value={editPlan.maxBeds} onChange={e=>setEditPlan({...editPlan, maxBeds: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Staff</label>
                  <input type="number" required min="1" value={editPlan.maxStaff} onChange={e=>setEditPlan({...editPlan, maxStaff: parseInt(e.target.value)})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] p-2 rounded-[var(--radius-md,8px)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditPlan(null)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-md">Cancel</button>
                <button type="submit" className="px-6 py-2 flex items-center gap-2 text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-md"><Save className="w-4 h-4"/> Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}