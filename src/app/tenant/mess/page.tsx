'use client';

import { useState, useEffect } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { useTenantContext } from '@/components/tenant/TenantContext';
import { getSession } from '@/lib/auth/session';
import { Zap, Utensils, CheckCircle, XCircle } from 'lucide-react';

export default function TenantMessPage() {
  const { profile } = useTenantContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [wallet, setWallet] = useState(0);
  const [menu, setMenu] = useState<any>(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState('500');

  const loadData = () => {
    if (profile) {
      setWallet(tenantOperationsApi.getWalletBalance(profile.tenantId || profile.userId));
      setMenu(tenantOperationsApi.getTodayMenu(profile.propertyId));
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleRecharge = () => {
    if (!session || !profile) return;
    tenantOperationsApi.rechargeWallet(profile.tenantId || profile.userId, parseInt(amount), session.id);
    alert('Wallet recharged! (Mock)');
    setShowRecharge(false);
    loadData();
  };

  const handleOrder = (type: 'breakfast'|'lunch'|'dinner', cost: number) => {
    if (!session || !profile) return;
    try {
      tenantOperationsApi.orderMeal(profile.tenantId || profile.userId, profile.propertyId, type, cost, session.id);
      alert(`Ordered ${type}. ₹${cost} deducted from wallet.`);
      loadData();
    } catch (e: any) {
      alert(e.message);
      setShowRecharge(true);
    }
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  const meals = [
    { type: 'breakfast', label: 'Breakfast', menu: menu?.breakfast, cost: 40 },
    { type: 'lunch', label: 'Lunch', menu: menu?.lunch, cost: 70 },
    { type: 'dinner', label: 'Dinner', menu: menu?.dinner, cost: 70 },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Mess Operations</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your meals and mess wallet.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Zap className="w-7 h-7 text-yellow-500" />
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)] font-medium">Wallet Balance</div>
            <div className="text-3xl font-black text-[var(--text-primary)]">₹{wallet}</div>
          </div>
        </div>
        <button onClick={() => setShowRecharge(true)} className="w-full md:w-auto px-6 py-2 bg-[var(--primary)] text-white rounded font-bold shadow-sm hover:bg-[var(--primary-hover)] transition-colors">
          Recharge Wallet
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[var(--primary)]"/> Today's Menu
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {meals.map(m => (
            <div key={m.type} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[var(--bg-input)] transition-colors">
              <div>
                <div className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-1">{m.label}</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{m.menu || 'To be decided'}</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Cost: ₹{m.cost}</div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => alert('Skipped meal.')} className="flex-1 md:flex-none px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-input)]">
                  Skip
                </button>
                <button onClick={() => handleOrder(m.type, m.cost)} className="flex-1 md:flex-none px-4 py-2 bg-[var(--success)] text-white rounded font-bold shadow-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4"/> Eat (₹{m.cost})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-[var(--radius-lg,12px)] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500"/> Recharge Wallet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border)] px-4 py-2 rounded font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" />
              </div>
              <div className="flex gap-2 pt-2">
                {[500, 1000, 2000].map(amt => (
                  <button key={amt} onClick={() => setAmount(amt.toString())} className="flex-1 py-1 border border-[var(--border)] rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-input)]">₹{amt}</button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowRecharge(false)} className="flex-1 px-4 py-2 bg-[var(--bg-input)] text-[var(--text-primary)] rounded font-medium">Cancel</button>
              <button onClick={handleRecharge} className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded font-bold shadow-sm">Pay Mock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
