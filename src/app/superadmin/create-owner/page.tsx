'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ownerRequestsApi } from '@/app/superadmin/lib/api/ownerRequests';
import { ownersApi } from '@/app/owner/lib/api/owners';
import { AlertCircle, CheckCircle, Shield, Briefcase, User, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/ui/ToastContext';
import { InputError } from '@/lib/ui/InputError';

function CreateOwnerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdCreds, setCreatedCreds] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', address: '',
    businessName: '', gst: '', pan: '', expectedPgs: 1, expectedBeds: 50,
    temporaryPassword: '', mustChangePassword: true,
    planId: 'none', billingCycle: 'monthly',
    maxProperties: 0, maxBeds: 0, maxStaff: 0,
    features: ['student_portal', 'mess_basic']
  });

  useEffect(() => {
    if (requestId) {
      const req = ownerRequestsApi.getById(requestId);
      if (req) {
        
        let limits = { maxProperties: 0, maxBeds: 0, maxStaff: 0 };
        if (req.planId === 'basic') limits = { maxProperties: 1, maxBeds: 50, maxStaff: 2 };
        if (req.planId === 'pro') limits = { maxProperties: 3, maxBeds: 200, maxStaff: 10 };
        if (req.planId === 'enterprise') limits = { maxProperties: 999, maxBeds: 9999, maxStaff: 999 };
        
        setFormData(prev => ({
          ...prev,
          name: req.name || '',
          email: req.email || '',
          phone: req.phone || '',
          city: req.city || '',
          businessName: req.businessName || '',
          expectedPgs: req.pgCount || 1,
          expectedBeds: req.bedCount || 50,
          gst: req.gst || '',
          planId: req.planId || 'none',
          ...limits
        }));
      }
    }
  }, [requestId]);

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = e.target.value;
    let limits = { maxProperties: 0, maxBeds: 0, maxStaff: 0 };
    if (p === 'basic') limits = { maxProperties: 1, maxBeds: 50, maxStaff: 2 };
    if (p === 'pro') limits = { maxProperties: 3, maxBeds: 200, maxStaff: 10 };
    if (p === 'enterprise') limits = { maxProperties: 999, maxBeds: 9999, maxStaff: 999 };
    setFormData(prev => ({ ...prev, planId: p, ...limits }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.temporaryPassword || formData.temporaryPassword.length < 6) newErrors.temporaryPassword = 'Password must be at least 6 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors before submitting.', 'error');
      return;
    }

    setLoading(true);
    
    if(!formData.temporaryPassword) {
      setError('Temporary password is required.');
      setLoading(false);
      return;
    }

    try {
      const res = ownersApi.createOwner({ ...formData, requestId });
      setCreatedCreds({ email: formData.email, password: formData.temporaryPassword });
      setSuccess(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to create owner.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-[var(--success-bg)] border border-[var(--success)] p-8 rounded-[var(--radius-lg,12px)] text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-[var(--success)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Owner Created Successfully</h2>
          <p className="text-[var(--text-secondary)] mb-6">The owner account and subscription have been provisioned.</p>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-md text-left mb-6">
            <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-2">Secure Credentials</div>
            <div className="font-mono text-[var(--text-primary)]">Email: {createdCreds?.email}</div>
            <div className="font-mono text-[var(--text-primary)]">Password: {createdCreds?.password}</div>
          </div>
          
          <Link href="/superadmin/owners" className="inline-block bg-[var(--primary)] text-white font-medium px-6 py-3 rounded-md hover:bg-[var(--primary-hover)] transition-colors">
            Go to Owners Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create PG Owner</h1>
        <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2 mt-1">
          <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
          Owner self-signup nahi karta. Aap account banaake email+password doge.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Personal */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Personal Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
              <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className={`w-full p-2.5 rounded-md border ${errors.name ? 'border-[var(--danger)]' : 'border-[var(--border)]'} bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:ring-[var(--primary)]`} />
              <InputError message={errors.name} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Phone Number *</label>
              <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className={`w-full p-2.5 rounded-md border ${errors.phone ? 'border-[var(--danger)]' : 'border-[var(--border)]'} bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:ring-[var(--primary)]`} />
              <InputError message={errors.phone} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">City *</label>
              <input required type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Address</label>
              <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm" />
            </div>
          </div>
        </div>

        {/* Section 2: Business */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Business Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Business/Company Name *</label>
              <input required type="text" value={formData.businessName} onChange={e=>setFormData({...formData, businessName: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">GST Number (Optional)</label>
              <input type="text" value={formData.gst} onChange={e=>setFormData({...formData, gst: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">PAN Number (Optional)</label>
              <input type="text" value={formData.pan} onChange={e=>setFormData({...formData, pan: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm uppercase" />
            </div>
          </div>
        </div>

        {/* Section 3: Access */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Account Access</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Login Email *</label>
              <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className={`w-full p-2.5 rounded-md border ${errors.email ? 'border-[var(--danger)]' : 'border-[var(--border)]'} bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:ring-[var(--primary)]`} />
              <InputError message={errors.email} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Temporary Password *</label>
              <input type="text" value={formData.temporaryPassword} onChange={e=>setFormData({...formData, temporaryPassword: e.target.value})} className={`w-full p-2.5 rounded-md border ${errors.temporaryPassword ? 'border-[var(--danger)]' : 'border-[var(--border)]'} bg-[var(--bg-input)] text-[var(--text-primary)] text-sm font-mono focus:ring-[var(--primary)]`} placeholder="e.g. Temp@123" />
              <InputError message={errors.temporaryPassword} />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={formData.mustChangePassword} onChange={e=>setFormData({...formData, mustChangePassword: e.target.checked})} className="rounded text-[var(--primary)] focus:ring-[var(--primary)] bg-[var(--bg-input)] border-[var(--border)]" />
                <span className="text-sm text-[var(--text-primary)]">Force password change on first login</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Plan & Subscription */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-page)] border-b border-[var(--border)] p-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Subscription Plan</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Select Plan</label>
                <select value={formData.planId} onChange={handlePlanChange} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm">
                  <option value="none">No Plan (Require Purchase)</option>
                  <option value="basic">Basic (1 PG, 50 Beds)</option>
                  <option value="pro">Pro (3 PGs, 200 Beds)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Billing Cycle</label>
                <select value={formData.billingCycle} onChange={e=>setFormData({...formData, billingCycle: e.target.value})} className="w-full p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-md p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Max Properties</div>
                <input type="number" value={formData.maxProperties} onChange={e=>setFormData({...formData, maxProperties: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-[var(--border)] text-center font-bold text-lg text-[var(--text-primary)] focus:outline-none" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Max Beds</div>
                <input type="number" value={formData.maxBeds} onChange={e=>setFormData({...formData, maxBeds: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-[var(--border)] text-center font-bold text-lg text-[var(--text-primary)] focus:outline-none" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Max Staff</div>
                <input type="number" value={formData.maxStaff} onChange={e=>setFormData({...formData, maxStaff: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-[var(--border)] text-center font-bold text-lg text-[var(--text-primary)] focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border)] gap-4">
          <Link href="/superadmin/owners" className="px-6 py-2.5 border border-[var(--border)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--bg-card)] font-medium">Cancel</Link>
          <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] font-medium disabled:opacity-50">
            {loading ? 'Provisioning...' : 'Create Owner Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateOwnerPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading form...</div>}>
      <CreateOwnerForm />
    </Suspense>
  );
}
