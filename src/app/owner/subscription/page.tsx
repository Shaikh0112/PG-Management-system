'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useToast } from '@/lib/ui/ToastContext';
import { Crown, CheckCircle2, Building, Users, Bed, CreditCard, ShieldCheck, Loader2, X, AlertCircle } from 'lucide-react';

export default function OwnerSubscriptionPage() {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  
  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Form State
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const loadSubscriptionData = () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch owner and plan data
    const ownerRecord = api.owners.listOwners().find((o: any) => o.userId === user.id);
    const plans = api.plans.listPlans();
    
    const activePlan = ownerRecord?.planId && ownerRecord.planId !== 'none' && ownerRecord.planId !== 'None' 
      ? plans.find(p => p.id === ownerRecord.planId || `plan_${p.id}` === ownerRecord.planId || p.id === `plan_${ownerRecord.planId}`)
      : null;

    // Actual usage logic:
    const propsCount = api.properties.listByOwner(user.id).length;
    const staffCount = api.team.listByOwner(user.id).length;
    const tenantsCount = api.tenants.listByOwner(user.id).length; 

    setAllPlans(plans);
    setData({
      ownerRecord,
      plan: activePlan,
      usage: {
        properties: propsCount,
        staff: staffCount,
        tenants: tenantsCount
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user?.id]);

  const handleOpenPaymentModal = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentForm({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.ownerRecord?.id || !selectedPlan) return;
    
    setProcessingPayment(true);
    
    // Simulate Payment Gateway Delay
    setTimeout(() => {
      try {
        api.owners.upgradePlan(data.ownerRecord.id, selectedPlan.id);
        showToast('success', 'Payment successful! Your plan has been upgraded.');
        setPaymentModalOpen(false);
        loadSubscriptionData(); // Reload UI with new plan
      } catch (err: any) {
        showToast('error', err.message || 'Payment processing failed.');
      } finally {
        setProcessingPayment(false);
      }
    }, 2000); // 2 seconds delay
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { plan, usage } = data;

  const getMeterColor = (current: number, max: number) => {
    const ratio = max === 0 ? 0 : current / max;
    if (ratio >= 0.9) return 'bg-[var(--danger)]';
    if (ratio >= 0.75) return 'bg-[var(--warning)]';
    return 'bg-[var(--primary)]';
  };

  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Subscription & Billing</h1>
          <p className="text-[12px] font-medium text-[var(--text-secondary)] mt-1">Manage your plan, quotas, and billing</p>
        </div>
      </div>

      {/* Active Plan & Usage */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Current Plan Overview */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[var(--text-primary)]">Current Plan</h2>
                <div className="text-[14px] text-[var(--primary)] font-semibold">{plan ? plan.name : 'No Active Plan'}</div>
              </div>
            </div>
            
            {plan ? (
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                You are currently on the {plan.name} plan. This plan allows you to manage up to {plan.maxProperties === 999 ? 'Unlimited' : plan.maxProperties} properties and {plan.maxBeds === 9999 ? 'Unlimited' : plan.maxBeds} beds.
              </p>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                You do not have an active plan. Please purchase a subscription to unlock PG management features.
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-[var(--text-secondary)]">Status</span>
                <span className={`font-semibold flex items-center gap-1 ${plan ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {plan ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {plan ? 'Active' : 'Inactive - Pending Purchase'}
                </span>
              </div>
              {plan && (
                <>
                  <div className="w-px h-8 bg-[var(--border)]"></div>
                  <div className="flex flex-col">
                    <span className="text-[var(--text-secondary)]">Billing Cycle</span>
                    <span className="font-semibold text-[var(--text-primary)]">Monthly</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Usage Meters */}
          <div className="space-y-5 bg-[var(--bg-page)] p-5 rounded-[var(--radius-md)] border border-[var(--border)]">
            <h3 className="font-semibold text-[14px] text-[var(--text-primary)] mb-4">Resource Usage</h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)] flex items-center gap-1"><Building className="w-3 h-3"/> Properties</span>
                <span className="font-medium text-[var(--text-primary)]">{usage.properties} / {plan ? (plan.maxProperties === 999 ? '∞' : plan.maxProperties) : 0}</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getMeterColor(usage.properties, plan?.maxProperties || 0)} transition-all duration-500`} 
                     style={{ width: `${Math.min(100, plan && plan.maxProperties > 0 ? (usage.properties / plan.maxProperties) * 100 : 0)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)] flex items-center gap-1"><Users className="w-3 h-3"/> Staff Accounts</span>
                <span className="font-medium text-[var(--text-primary)]">{usage.staff} / {plan ? (plan.maxStaff === 999 ? '∞' : plan.maxStaff) : 0}</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getMeterColor(usage.staff, plan?.maxStaff || 0)} transition-all duration-500`} 
                     style={{ width: `${Math.min(100, plan && plan.maxStaff > 0 ? (usage.staff / plan.maxStaff) * 100 : 0)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-[var(--border)]" />

      {/* Pricing / Upgrade Plans Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2">Upgrade Your Plan</h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Unlock more properties, higher staff limits, and advanced features by upgrading to a higher tier plan. Payments are processed securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((p) => {
            const isActive = plan?.id === p.id;

            return (
              <div 
                key={p.id} 
                className={`relative bg-[var(--bg-card)] border rounded-[var(--radius-lg)] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                  ${isActive ? 'border-[var(--primary)] shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-[var(--border)]'}
                `}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Current Plan
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">{p.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-[28px] font-bold text-[var(--text-primary)]">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">/mo</span>
                  </div>
                </div>

                {/* Plan Limits */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-[14px] text-[var(--text-secondary)]">
                    <Building className="w-4 h-4 text-[var(--primary)]" />
                    <span>Up to <strong>{p.maxProperties === 999 ? 'Unlimited' : p.maxProperties}</strong> Properties</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[var(--text-secondary)]">
                    <Bed className="w-4 h-4 text-[var(--primary)]" />
                    <span>Up to <strong>{p.maxBeds === 9999 ? 'Unlimited' : p.maxBeds}</strong> Beds</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[var(--text-secondary)]">
                    <Users className="w-4 h-4 text-[var(--primary)]" />
                    <span>Up to <strong>{p.maxStaff === 999 ? 'Unlimited' : p.maxStaff}</strong> Staff</span>
                  </div>
                  
                  {/* Features */}
                  {p.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-[14px] text-[var(--text-secondary)]">
                      <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                      <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOpenPaymentModal(p)}
                  disabled={isActive}
                  className={`w-full py-3 px-4 rounded-[var(--radius-md)] text-[14px] font-bold flex items-center justify-center gap-2 transition-all
                    ${isActive 
                      ? 'bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)] cursor-not-allowed'
                      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:shadow-lg'
                    }
                  `}
                >
                  {isActive ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Pay ₹{p.price.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Modal */}
      {paymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-md border border-[var(--border)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-page)]">
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Checkout</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">You are upgrading to the <strong className="text-[var(--primary)]">{selectedPlan.name}</strong> plan</p>
              </div>
              <button 
                onClick={() => !processingPayment && setPaymentModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
                disabled={processingPayment}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
              
              {/* Order Summary */}
              <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] flex justify-between items-center mb-6">
                <span className="text-[14px] font-medium text-[var(--text-secondary)]">Total Amount to Pay</span>
                <span className="text-[20px] font-bold text-[var(--text-primary)]">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Name on Card</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={paymentForm.cardName}
                  onChange={e => setPaymentForm({...paymentForm, cardName: e.target.value})}
                  disabled={processingPayment}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                    value={paymentForm.cardNumber}
                    onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value.replace(/\D/g, '')})}
                    disabled={processingPayment}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <CreditCard className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Expiry (MM/YY)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentForm.expiry}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                      setPaymentForm({...paymentForm, expiry: val})
                    }}
                    disabled={processingPayment}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">CVV</label>
                  <input 
                    type="password" 
                    required
                    placeholder="***"
                    maxLength={3}
                    value={paymentForm.cvv}
                    onChange={e => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '')})}
                    disabled={processingPayment}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processingPayment}
                className="w-full mt-2 py-3 bg-[var(--primary)] text-white text-[14px] font-bold rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing Secure Payment...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Pay ₹{selectedPlan.price.toLocaleString('en-IN')}</>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
