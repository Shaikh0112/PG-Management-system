'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { useManagerPropertyContext } from '@/components/manager/ManagerPropertyContext';
import { Plus, Search, Phone, Calendar, IndianRupee, UserPlus, Lock, MessageCircle, AlertTriangle, Mail, Home, Tag, Copy } from 'lucide-react';
import { Enquiry, EnquiryStatus } from '@/lib/api/managerEnquiries';
import { useRouter } from 'next/navigation';

export default function ManagerEnquiriesPage() {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTab, setActiveTab] = useState<'pipeline' | 'lost'>('pipeline');
  const [waMenuEnquiry, setWaMenuEnquiry] = useState<Enquiry | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', expectedMoveIn: '', budget: '', notes: ''
  });

  const loadData = () => {
    if (ctxLoading || !selectedPropertyId) return;
    setLoading(true);
    const data = api.managerEnquiries.listByProperty(selectedPropertyId);
    setEnquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPropertyId) return;
    
    api.managerEnquiries.create({
      ...formData,
      propertyId: selectedPropertyId,
      assignedManagerId: user.id,
      budget: parseInt(formData.budget) || 0
    });
    
    setShowAddModal(false);
    setFormData({ name: '', phone: '', email: '', expectedMoveIn: '', budget: '', notes: '' });
    loadData();
  };

  const handleStatusChange = (id: string, status: EnquiryStatus) => {
    if (!user) return;
    
    let lossReason = undefined;
    if (status === 'lost') {
      const reason = window.prompt('Why was this lead lost? (e.g. Budget, No Beds, Location)');
      if (reason === null) return; // Cancelled
      lossReason = reason || 'Unspecified';
    }
    
    api.managerEnquiries.updateStatus(id, status, user.id, lossReason);
    loadData();
  };

  const handleConvertToCheckin = (enquiryId: string) => {
    router.push(`/manager/check-in?enquiryId=${enquiryId}`);
  };

  const openWhatsAppMsg = (phone: string, text: string) => {
    const encoded = encodeURIComponent(text);
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encoded}`, '_blank');
  };

  const handleRoomAvailable = () => {
    if (!waMenuEnquiry) return;
    const msg = `Hello ${waMenuEnquiry.name}, a bed matching your requirements is now available at our PG. Let us know if you are still looking to book!`;
    openWhatsAppMsg(waMenuEnquiry.phone, msg);
    setWaMenuEnquiry(null);
  };

  const handleRentOffer = () => {
    if (!waMenuEnquiry) return;
    const msg = `Hello ${waMenuEnquiry.name}, we are running a special discount offer on rent right now! Check out the attached image for details. Let us know if you're interested.`;
    // We open WA with text. The user has to manually attach the image.
    alert("WhatsApp will now open with the text. Please manually attach your Offer Image in the chat window!");
    openWhatsAppMsg(waMenuEnquiry.phone, msg);
    setWaMenuEnquiry(null);
  };

  if (ctxLoading) return <div className="p-6 animate-pulse text-[var(--text-secondary)]">Loading...</div>;

  if (!selectedPropertyId) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-6 border border-[var(--border)]">
          <Lock className="w-10 h-10 text-[var(--text-secondary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Select a Property</h2>
        <p className="text-[var(--text-secondary)]">You need an assigned property to manage enquiries.</p>
      </div>
    );
  }

  const columns: { id: EnquiryStatus, label: string }[] = [
    { id: 'new', label: 'New Lead' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'visited', label: 'Visited' },
    { id: 'interested', label: 'Interested' },
    { id: 'booked', label: 'Booked' }
  ];

  const filteredEnquiries = enquiries.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.phone.includes(searchQuery)
  );
  
  const activeEnquiries = filteredEnquiries.filter(e => e.status !== 'lost' && e.status !== 'converted');
  const lostEnquiries = filteredEnquiries.filter(e => e.status === 'lost');

  const renderCardContactActions = (enq: Enquiry) => (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border)]">
      <button 
        onClick={() => setWaMenuEnquiry(enq)}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#25D366]/10 text-[#1DA851] rounded border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors text-xs font-bold"
      >
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </button>
      {enq.email && (
        <a 
          href={`mailto:${enq.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[var(--primary-bg)] text-[var(--primary)] rounded border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 transition-colors text-xs font-bold"
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Enquiries Pipeline</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage leads and follow-ups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] shrink-0">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'pipeline' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Active Pipeline
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'lost' 
              ? 'border-[var(--danger)] text-[var(--danger)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Lost Leads & Follow-ups
          {lostEnquiries.length > 0 && (
            <span className="bg-[var(--danger)] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{lostEnquiries.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'pipeline' ? (
        /* Kanban Board */
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {columns.map(col => {
              const columnEnquiries = activeEnquiries.filter(e => e.status === col.id);
              return (
                <div key={col.id} className="w-80 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] shrink-0 max-h-full">
                  <div className="p-4 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex items-center justify-between shrink-0">
                    <h3 className="font-semibold text-[var(--text-primary)]">{col.label}</h3>
                    <span className="bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs font-bold px-2 py-0.5 rounded-full">
                      {columnEnquiries.length}
                    </span>
                  </div>
                  
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-[var(--border)]">
                    {columnEnquiries.map(enq => (
                      <div key={enq.id} className="bg-[var(--bg-page)] border border-[var(--border)] p-4 rounded-xl shadow-sm hover:border-[var(--primary-subtle)] transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-[var(--text-primary)] truncate pr-2">{enq.name}</h4>
                        </div>
                        
                        {enq.referredByTenantId && (
                          <div className="mb-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            🎁 Referred by Student
                          </div>
                        )}

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{enq.phone}</span>
                          </div>
                          {(enq.budget || 0) > 0 && (
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>₹{(enq.budget || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {enq.notes && (
                          <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] p-2 rounded text-xs mb-3">
                            <span className="font-semibold text-[var(--warning)] block mb-0.5">Requirements:</span>
                            <span className="text-[var(--text-secondary)] leading-relaxed">{enq.notes}</span>
                          </div>
                        )}

                        {renderCardContactActions(enq)}

                        <div className="flex items-center gap-2 pt-3 mt-auto">
                          <select 
                            value={enq.status}
                            onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                            className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                          >
                            {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            <option value="lost" className="text-[var(--danger)]">Mark as Lost</option>
                          </select>
                          <button 
                            onClick={() => handleConvertToCheckin(enq.id)}
                            title="Convert to Check-in"
                            className="p-1.5 bg-[var(--success-bg)] text-[var(--success)] rounded border border-[var(--success)] hover:bg-green-900 transition-colors shrink-0"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {columnEnquiries.length === 0 && (
                      <div className="text-center text-xs text-[var(--text-secondary)] py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Lost & Follow-ups View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lostEnquiries.map(enq => (
            <div key={enq.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{enq.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[rgba(239,68,68,0.1)] text-[var(--danger)] rounded-full">Lost</span>
                </div>
                
                {enq.referredByTenantId && (
                  <div className="mb-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    🎁 Referred by Student
                  </div>
                )}

                <div className="space-y-1 mb-4">
                  <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {enq.phone}
                  </p>
                </div>

                {enq.notes && (
                  <div className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] p-3 rounded-lg mb-4">
                    <span className="text-xs font-semibold text-[var(--warning)] block uppercase tracking-wider mb-1">Student Requirements</span>
                    <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{enq.notes}</span>
                  </div>
                )}

                <div className="bg-[var(--danger-bg)] p-3 rounded-lg border border-[var(--danger)]/20 mb-4">
                  <p className="text-xs font-semibold text-[var(--danger)] uppercase tracking-wider mb-1">Reason for Loss</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{enq.lossReason || 'Not specified'}</p>
                </div>
              </div>

              <div>
                {renderCardContactActions(enq)}
                
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <select 
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-2 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="lost">Status: Lost</option>
                    <option value="new">Move to New</option>
                    <option value="contacted">Move to Contacted</option>
                    <option value="interested">Move to Interested</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {lostEnquiries.length === 0 && (
            <div className="col-span-full text-center p-12 text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl">
              <p className="font-medium text-lg">No lost leads</p>
              <p className="text-sm mt-1">Great job! All your leads are active or converted.</p>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Action Menu Modal */}
      {waMenuEnquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[rgba(99,102,241,0.02)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                WhatsApp Message
              </h2>
              <button onClick={() => setWaMenuEnquiry(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                &times;
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)] mb-2">Select a smart message to send to <span className="font-bold text-[var(--text-primary)]">{waMenuEnquiry.name}</span>:</p>
              
              <button 
                onClick={handleRoomAvailable}
                className="w-full flex items-start gap-3 p-3 bg-[var(--bg-input)] hover:bg-[var(--primary-bg)] border border-[var(--border)] hover:border-[var(--primary)] rounded-xl transition-all text-left group"
              >
                <div className="p-2 bg-[var(--bg-card)] rounded-lg group-hover:text-[var(--primary)] text-[var(--text-secondary)]">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Room Available</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">"Hello, a bed matching your requirements is now available..."</p>
                </div>
              </button>

              <button 
                onClick={handleRentOffer}
                className="w-full flex items-start gap-3 p-3 bg-[var(--bg-input)] hover:bg-[rgba(16,185,129,0.05)] border border-[var(--border)] hover:border-[var(--success)] rounded-xl transition-all text-left group"
              >
                <div className="p-2 bg-[var(--bg-card)] rounded-lg group-hover:text-[var(--success)] text-[var(--text-secondary)]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Rent Offer</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">"Hello, we are running a special discount offer..."</p>
                </div>
              </button>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-input)]">
              <button onClick={() => setWaMenuEnquiry(null)} className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--border)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[rgba(99,102,241,0.02)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Enquiry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                &times;
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">WhatsApp / Phone *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" placeholder="10 digit number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" placeholder="optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Move-in Date</label>
                  <input type="date" value={formData.expectedMoveIn} onChange={e => setFormData({...formData, expectedMoveIn: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Budget (₹)</label>
                  <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Student Requirements</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none resize-none h-24"
                  placeholder="e.g. Single room needed, location too far, budget issue..."
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--border)] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md,8px)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
