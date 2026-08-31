'use client';

import { useState } from 'react';
import { useTenantContext } from '@/app/tenant/components/TenantContext';
import { FileText, Download, CheckCircle, X, ExternalLink } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export default function TenantDocumentsPage() {
  const { profile } = useTenantContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [showAgreement, setShowAgreement] = useState(false);

  if (!profile) return <div className="p-4">Loading...</div>;

  const docs = [
    { id: 1, name: 'PG Agreement Document', type: 'PDF', status: 'Verified' },
    { id: 2, name: 'Aadhar Card (Front/Back)', type: 'Image', status: 'Verified' },
    { id: 3, name: 'College/Company ID', type: 'Image', status: 'Pending Verification' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">My Documents</h1>
        <p className="text-sm text-[var(--text-secondary)]">Your uploaded KYC and agreement documents.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-input)]">
          <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            Uploaded Documents
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {docs.map(d => (
            <div key={d.id} className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[var(--bg-input)] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--bg-input)] rounded flex items-center justify-center shrink-0 border border-[var(--border)]">
                  <FileText className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{d.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] px-2 py-0.5 rounded">{d.type}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${d.status === 'Verified' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                      {d.status === 'Verified' && <CheckCircle className="w-3 h-3" />}
                      {d.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(d.id === 1) setShowAgreement(true);
                  else alert('Download started');
                }}
                className="text-sm font-medium text-[var(--primary)] flex items-center gap-2 hover:underline w-full md:w-auto justify-center md:justify-end py-2 md:py-0 border md:border-0 border-[var(--border)] rounded mt-2 md:mt-0"
              >
                {d.id === 1 ? <><ExternalLink className="w-4 h-4" /> View Agreement</> : <><Download className="w-4 h-4" /> Download</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white text-black font-serif w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded shadow-2xl relative">
            <div className="sticky top-0 bg-gray-100 border-b border-gray-300 p-3 flex justify-between items-center z-10">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4"/> Digital Agreement Viewer</h2>
              <button onClick={() => setShowAgreement(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest">Rental Agreement</h1>
                <p className="text-sm text-gray-600 mt-1">Smart PG Management Systems</p>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed text-gray-800">
                <p>
                  This Rental Agreement is made and entered into on <strong>{profile.agreementTimestamp ? new Date(profile.agreementTimestamp).toLocaleDateString('en-IN') : 'N/A'}</strong>, by and between the Property Management and <strong>{session?.name || '[Tenant Name]'}</strong> (hereinafter referred to as the "Tenant").
                </p>
                <h3 className="font-bold text-base mt-4">1. Premises</h3>
                <p>The Tenant agrees to lease the bed assigned in Room {profile.roomNumber} under the standard occupancy terms.</p>
                
                <h3 className="font-bold text-base mt-4">2. Rent & Deposit</h3>
                <p>The agreed monthly rent is ₹{profile.rentAmount || '0'}. Rent must be paid on or before the agreed rent cycle date every month. A standard security deposit was collected before move-in.</p>
                
                <h3 className="font-bold text-base mt-4">3. House Rules & Notice</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tenant must serve the mandatory notice period before vacating.</li>
                  <li>Visitors are allowed strictly within visiting hours.</li>
                  <li>Any damages to the premises will be deducted from the deposit.</li>
                </ul>
                
                <div className="mt-8 pt-8 border-t border-gray-300 grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-b border-gray-400 h-10 w-48 flex items-end">
                      <span className="italic font-bold text-gray-800">Smart PG Management</span>
                    </div>
                    <div className="mt-2 text-xs uppercase font-bold text-gray-500">Authorized Signatory</div>
                  </div>
                  <div>
                    {profile.agreementAccepted ? (
                      <div className="h-10 text-[var(--success)] font-bold italic flex items-end">
                        Digitally Accepted ({new Date(profile.agreementTimestamp || Date.now()).toLocaleDateString('en-IN')})
                      </div>
                    ) : (
                      <div className="border-b border-gray-400 h-10 w-48 text-red-500 italic flex items-end text-sm">Not Signed</div>
                    )}
                    <div className="mt-2 text-xs uppercase font-bold text-gray-500">Tenant Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
