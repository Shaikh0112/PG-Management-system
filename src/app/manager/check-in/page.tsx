'use client';

import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, FileText, Users, BedDouble, HeartHandshake, 
  Wallet, FileCheck, Key, Utensils, CheckCircle, ArrowRight, ArrowLeft, Lock 
} from 'lucide-react';
import { useToast } from '@/lib/ui/ToastContext';
import { InputError } from '@/lib/ui/InputError';

const WIZARD_STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Documents', icon: FileText },
  { id: 3, title: 'Parent', icon: Users },
  { id: 4, title: 'Room/Bed', icon: BedDouble },
  { id: 5, title: 'Compatibility', icon: HeartHandshake },
  { id: 6, title: 'Deposit', icon: Wallet },
  { id: 7, title: 'Agreement', icon: FileCheck },
  { id: 8, title: 'Credentials', icon: Key },
  { id: 9, title: 'Mess', icon: Utensils },
  { id: 10, title: 'Success', icon: CheckCircle }
];

function CheckinWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enquiryId = searchParams?.get('enquiryId') || '';
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  
  const [step, setStep] = useState(1);
  const [vacantBeds, setVacantBeds] = useState<any[]>([]);
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    enquiryId,
    personal: { name: '', email: '', phone: '', gender: 'Male', college: '', dob: '' },
    documents: { files: [] as any[], aadharNumber: '', panNumber: '' },
    parent: { name: '', phone: '', email: '' },
    room: { bedId: '' },
    compatibility: { sleepSchedule: 'normal', studyHabits: 'quiet' },
    deposit: { type: 'normal', rentAmount: '', loanPartner: '', stayDuration: '3' },
    agreement: { accepted: false },
    credentials: { password: 'Tenant@123' }
  });

  // Pre-fill from enquiry if passed
  useEffect(() => {
    if (enquiryId && selectedPropertyId) {
      const enq = api.managerEnquiries.getById(enquiryId);
      if (enq && enq.propertyId === selectedPropertyId) {
        setFormData(prev => ({
          ...prev,
          personal: { ...prev.personal, name: enq.name, phone: enq.phone, email: enq.email || '' },
          deposit: { ...prev.deposit, rentAmount: enq.budget ? enq.budget.toString() : '' }
        }));
      }
    }
  }, [enquiryId, selectedPropertyId]);

  // Fetch beds when entering step 4
  useEffect(() => {
    if (step === 4 && selectedPropertyId) {
      const beds = api.managerCheckin.getVacantBeds(selectedPropertyId);
      setVacantBeds(beds);
    }
  }, [step, selectedPropertyId]);

  // Compute Compatibility when entering step 5
  useEffect(() => {
    if (step === 5 && formData.room.bedId) {
      const bed = vacantBeds.find(b => b.id === formData.room.bedId);
      if (bed) {
        const score = api.managerCheckin.getCompatibilityScore(bed.roomId, null, formData.compatibility);
        setCompatibilityScore(score);
      }
    }
  }, [step, formData.room.bedId, formData.compatibility, vacantBeds]);

  const handleNext = () => {
    // Basic validation per step
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.personal.name.trim()) newErrors.name = 'Full Name is required';
      if (!formData.personal.phone.trim()) newErrors.phone = 'Phone number is required';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    if (step === 3) {
      if (!formData.parent.name.trim()) newErrors.parentName = 'Parent Name is required';
      if (!formData.parent.phone.trim()) newErrors.parentPhone = 'Parent Phone is required';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setErrors({});
    setStep(s => Math.min(s + 1, 10));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleCommit = async () => {
    if (!user || !selectedPropertyId) return;
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    api.managerCheckin.commitCheckin({
      ...formData,
      managerId: user.id,
      propertyId: selectedPropertyId
    });
    showToast('Check-in completed successfully', 'success');
    setIsSubmitting(false);
    handleNext(); // go to step 10
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading wizard...</div>;
  if (!selectedPropertyId) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-6 border border-[var(--border)]">
          <Lock className="w-10 h-10 text-[var(--text-secondary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Property Required</h2>
        <p className="text-[var(--text-secondary)]">Please assign or select a property before performing a check-in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Check-in Wizard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Onboard a new tenant to your property.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-hide">
        {WIZARD_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isPassed = s.id < step;
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]' : 
                isPassed ? 'border-[var(--success)] bg-[var(--success)] text-white' : 
                'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl,16px)] p-6 shadow-sm min-h-[400px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><User className="text-[var(--primary)]" /> Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
                <input type="text" value={formData.personal.name} onChange={e => {setFormData({...formData, personal: {...formData.personal, name: e.target.value}}); setErrors({...errors, name: ''});}} className={`w-full bg-[var(--bg-input)] border ${errors.name ? 'border-[var(--danger)]' : 'border-[var(--border)]'} rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none`} />
                <InputError error={errors.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                <input type="tel" value={formData.personal.phone} onChange={e => {setFormData({...formData, personal: {...formData.personal, phone: e.target.value}}); setErrors({...errors, phone: ''});}} className={`w-full bg-[var(--bg-input)] border ${errors.phone ? 'border-[var(--danger)]' : 'border-[var(--border)]'} rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none`} />
                <InputError error={errors.phone} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                <input type="email" value={formData.personal.email} onChange={e => setFormData({...formData, personal: {...formData.personal, email: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date of Birth</label>
                <input type="date" value={formData.personal.dob} onChange={e => setFormData({...formData, personal: {...formData.personal, dob: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Gender</label>
                <select value={formData.personal.gender} onChange={e => setFormData({...formData, personal: {...formData.personal, gender: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">College / Workplace</label>
                <input type="text" value={formData.personal.college} onChange={e => setFormData({...formData, personal: {...formData.personal, college: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><FileText className="text-[var(--primary)]" /> Documents</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Aadhar Number</label>
                <input 
                  type="text" 
                  placeholder="12-digit Aadhar" 
                  value={formData.documents.aadharNumber} 
                  onChange={e => setFormData({...formData, documents: {...formData.documents, aadharNumber: e.target.value}})} 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">PAN Number</label>
                <input 
                  type="text" 
                  placeholder="10-digit PAN (Optional)" 
                  value={formData.documents.panNumber} 
                  onChange={e => setFormData({...formData, documents: {...formData.documents, panNumber: e.target.value}})} 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none uppercase" 
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center bg-[rgba(99,102,241,0.02)] mt-4">
               <FileText className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-3" />
               <p className="text-[var(--text-secondary)] text-sm mb-4">Simulate file upload for Document Proofs.</p>
               <button 
                 onClick={() => setFormData({...formData, documents: { ...formData.documents, files: [{name: 'aadhar_front.jpg'}, {name: 'aadhar_back.jpg'}] }})}
                 className="px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] rounded text-sm hover:bg-[var(--primary-subtle)] transition-colors"
               >
                 {formData.documents.files.length > 0 ? 'Files Attached (2)' : 'Attach Dummy Files'}
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Users className="text-[var(--primary)]" /> Parent Details</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">A parent user will be automatically created and linked.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parent Name</label>
                <input type="text" value={formData.parent.name} onChange={e => {setFormData({...formData, parent: {...formData.parent, name: e.target.value}}); setErrors({...errors, parentName: ''});}} className={`w-full bg-[var(--bg-input)] border ${errors.parentName ? 'border-[var(--danger)]' : 'border-[var(--border)]'} rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none`} />
                <InputError error={errors.parentName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parent Phone</label>
                <input type="tel" value={formData.parent.phone} onChange={e => {setFormData({...formData, parent: {...formData.parent, phone: e.target.value}}); setErrors({...errors, parentPhone: ''});}} className={`w-full bg-[var(--bg-input)] border ${errors.parentPhone ? 'border-[var(--danger)]' : 'border-[var(--border)]'} rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none`} />
                <InputError error={errors.parentPhone} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Parent Email (Optional)</label>
                <input type="email" value={formData.parent.email} onChange={e => setFormData({...formData, parent: {...formData.parent, email: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><BedDouble className="text-[var(--primary)]" /> Select Vacant Bed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {vacantBeds.length === 0 ? (
                <div className="col-span-full text-[var(--text-secondary)] p-4 text-center bg-[var(--bg-input)] rounded-lg">
                  No vacant beds available in this property.
                </div>
              ) : (
                vacantBeds.map(bed => (
                  <button
                    key={bed.id}
                    onClick={() => setFormData({...formData, room: { bedId: bed.id }})}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.room.bedId === bed.id 
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' 
                        : 'border-[var(--border)] hover:border-[var(--primary-hover)] bg-[var(--bg-input)]'
                    }`}
                  >
                    <div className="font-bold text-[var(--text-primary)]">Room {bed.roomNumber}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Bed {bed.code}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><HeartHandshake className="text-[var(--primary)]" /> Roommate Compatibility</h2>
            
            <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Compatibility Score</h3>
                <p className="text-xs text-[var(--text-secondary)]">Based on lifestyle preferences vs occupying roommate.</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[var(--success-bg)] border-2 border-[var(--success)] flex items-center justify-center font-bold text-lg text-[var(--success)]">
                {compatibilityScore || '--'}%
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sleep Schedule</label>
                  <select value={formData.compatibility.sleepSchedule} onChange={e => setFormData({...formData, compatibility: {...formData.compatibility, sleepSchedule: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                    <option value="early">Early Bird</option><option value="normal">Normal</option><option value="late">Night Owl</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Study Habits</label>
                  <select value={formData.compatibility.studyHabits} onChange={e => setFormData({...formData, compatibility: {...formData.compatibility, studyHabits: e.target.value}})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                    <option value="quiet">Needs Absolute Quiet</option><option value="moderate">Moderate Noise OK</option><option value="loud">Loud / Group Study</option>
                  </select>
               </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Wallet className="text-[var(--primary)]" /> Deposit & Rent</h2>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Agreed Monthly Rent (₹)</label>
              <input type="number" value={formData.deposit.rentAmount} onChange={e => setFormData({...formData, deposit: {...formData.deposit, rentAmount: e.target.value}})} className="w-full max-w-sm bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Stay Duration (Months)</label>
              <select value={formData.deposit.stayDuration} onChange={e => setFormData({...formData, deposit: {...formData.deposit, stayDuration: e.target.value}})} className="w-full max-w-sm bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                {[1, 2, 3, 4, 5, 6, 9, 12].map(months => (
                  <option key={months} value={months.toString()}>{months} {months === 1 ? 'Month' : 'Months'}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Rent schedule will be generated automatically for this duration.</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Deposit Model</label>
              <div className="flex gap-4">
                <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-colors ${formData.deposit.type === 'normal' ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' : 'border-[var(--border)] bg-[var(--bg-input)]'}`}>
                  <input type="radio" name="dep" checked={formData.deposit.type === 'normal'} onChange={() => setFormData({...formData, deposit: {...formData.deposit, type: 'normal', loanPartner: ''}})} className="sr-only" />
                  <div className="font-bold text-[var(--text-primary)] mb-1">Normal Deposit</div>
                  <div className="text-xs text-[var(--text-secondary)]">Tenant pays upfront deposit.</div>
                </label>
                <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-colors ${formData.deposit.type === 'zero_deposit' ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' : 'border-[var(--border)] bg-[var(--bg-input)]'}`}>
                  <input type="radio" name="dep" checked={formData.deposit.type === 'zero_deposit'} onChange={() => setFormData({...formData, deposit: {...formData.deposit, type: 'zero_deposit'}})} className="sr-only" />
                  <div className="font-bold text-[var(--text-primary)] mb-1">Zero Deposit</div>
                  <div className="text-xs text-[var(--text-secondary)]">Financed by Loan Partner.</div>
                </label>
              </div>
            </div>

            {formData.deposit.type === 'zero_deposit' && (
              <div className="mt-4 animate-in fade-in">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Loan Partner</label>
                <select value={formData.deposit.loanPartner} onChange={e => setFormData({...formData, deposit: {...formData.deposit, loanPartner: e.target.value}})} className="w-full max-w-sm bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none">
                  <option value="">Select Partner</option>
                  <option value="Liquiloans">Liquiloans</option>
                  <option value="Eduvanz">Eduvanz</option>
                </select>
              </div>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><FileCheck className="text-[var(--primary)]" /> Digital Agreement</h2>
            
            <div className="bg-white text-black font-serif border border-gray-300 p-8 rounded shadow-inner max-h-96 overflow-y-auto">
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest">Rental Agreement</h1>
                <p className="text-sm text-gray-600 mt-1">Smart PG Management Systems</p>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed text-gray-800">
                <p>
                  This Rental Agreement is made and entered into on <strong>{new Date().toLocaleDateString('en-IN')}</strong>, by and between the Property Management and <strong>{formData.personal.name || '[Tenant Name]'}</strong> (hereinafter referred to as the "Tenant").
                </p>
                <h3 className="font-bold text-base mt-4">1. Premises</h3>
                <p>The Tenant agrees to lease the bed assigned in Room {vacantBeds.find(b=>b.id===formData.room.bedId)?.roomNumber || '[Room Number]'} under the standard occupancy terms.</p>
                
                <h3 className="font-bold text-base mt-4">2. Rent & Deposit</h3>
                <p>The agreed monthly rent is ₹{formData.deposit.rentAmount || '0'}. Rent must be paid on or before the agreed rent cycle date every month. {formData.deposit.type === 'zero_deposit' ? `A Zero Deposit model has been opted via ${formData.deposit.loanPartner}.` : 'A standard security deposit is required before move-in.'}</p>
                
                <h3 className="font-bold text-base mt-4">3. House Rules & Notice</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tenant must serve the mandatory notice period before vacating.</li>
                  <li>Visitors are allowed strictly within visiting hours.</li>
                  <li>Any damages to the premises will be deducted from the deposit.</li>
                </ul>
                
                <div className="mt-8 pt-8 border-t border-gray-300 grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-b border-gray-400 h-10 w-48"></div>
                    <div className="mt-2 text-xs uppercase font-bold text-gray-500">Authorized Signatory</div>
                  </div>
                  <div>
                    {formData.agreement.accepted ? (
                      <div className="h-10 text-[var(--success)] font-bold italic flex items-end">
                        Digitally Accepted
                      </div>
                    ) : (
                      <div className="border-b border-gray-400 h-10 w-48"></div>
                    )}
                    <div className="mt-2 text-xs uppercase font-bold text-gray-500">Tenant Signature</div>
                  </div>
                </div>
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 border border-[var(--primary)] rounded-lg bg-[var(--primary-subtle)] transition-colors">
              <input type="checkbox" checked={formData.agreement.accepted} onChange={e => setFormData({...formData, agreement: { accepted: e.target.checked }})} className="w-5 h-5 accent-[var(--primary)] cursor-pointer" />
              <span className="text-sm font-medium text-[var(--primary)]">I verify the tenant has read and accepts all legal terms and conditions.</span>
            </label>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Key className="text-[var(--primary)]" /> Credentials Setup</h2>
            <p className="text-sm text-[var(--text-secondary)]">Set a temporary password for the Tenant. They will be forced to change it on their first login.</p>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Temporary Password</label>
              <input type="text" value={formData.credentials.password} onChange={e => setFormData({...formData, credentials: { password: e.target.value }})} className="w-full max-w-sm bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] outline-none font-mono" />
            </div>

            <div className="bg-[var(--warning-bg)] border border-[var(--warning)] text-[var(--warning)] p-3 rounded-lg text-sm flex items-start gap-2">
               <Lock className="w-4 h-4 mt-0.5 shrink-0" />
               <p>System will enforce password reset when {formData.personal.email || 'tenant'} logs in.</p>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Utensils className="text-[var(--primary)]" /> Mess Wallet Initialization</h2>
            <div className="border-2 border-[var(--border)] rounded-xl p-8 text-center bg-[var(--bg-input)]">
               <div className="w-16 h-16 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--primary)]">
                 <Wallet className="w-8 h-8 text-[var(--primary)]" />
               </div>
               <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">Wallet Ready</h3>
               <p className="text-[var(--text-secondary)] text-sm mb-4">A mess wallet will be created for this tenant with ₹0 starting balance.</p>
               <div className="inline-block px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] font-mono font-bold text-xl">
                 ₹0.00
               </div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-4 animate-in zoom-in-95 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-[var(--success-bg)] rounded-full flex items-center justify-center mb-4 border-4 border-[var(--success)]">
              <CheckCircle className="w-10 h-10 text-[var(--success)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Check-in Complete!</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md">
              {formData.personal.name} has been successfully onboarded to Room {vacantBeds.find(b=>b.id===formData.room.bedId)?.roomNumber || '-'}. 
              Parent link created and mess wallet initialized.
            </p>
            <div className="flex gap-4">
               <button onClick={() => router.push('/manager/tenants')} className="px-6 py-2.5 bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--primary-subtle)] transition-colors">
                 Go to Tenants
               </button>
               <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
                 New Check-in
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 10 && (
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              step === 1 ? 'opacity-50 cursor-not-allowed text-[var(--text-secondary)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          {step < 9 ? (
            <button 
              onClick={handleNext}
              disabled={(step===4 && !formData.room.bedId) || (step===7 && !formData.agreement.accepted)}
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleCommit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-[var(--success)] text-white rounded-lg font-bold hover:bg-[var(--success-hover,green)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Committing...' : 'Complete Check-in'} <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerCheckinPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[var(--text-secondary)]">Loading...</div>}>
      <CheckinWizardContent />
    </Suspense>
  );
}
