'use client';
import { useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { api } from '@/lib/api';
import { MapPin, Wifi, Wind, ShieldCheck, Coffee } from 'lucide-react';

export default function VacantPropertyPage() {
  const [enquired, setEnquired] = useState(false);

  const handleEnquire = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    api.enquiries.create({
      propertyId: 'prop_patna',
      name: fd.get('name') as string,
      phone: fd.get('phone') as string,
      message: fd.get('message') as string,
    });
    setEnquired(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">
      <Navbar />
      
      {/* Hero Image Placeholder */}
      <div className="h-64 md:h-96 w-full bg-slate-800 relative">
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium">
          [Property Photo Placeholder]
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Sharma PG Patna</h1>
                <p className="text-[var(--text-secondary)] flex items-center gap-1 mt-2">
                  <MapPin className="w-4 h-4" /> Boring Road, Patna, Bihar
                </p>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 border border-green-200">
                ★ 4.9 Hygiene
              </div>
            </div>
            
            <p className="text-[var(--text-primary)] leading-relaxed mt-6">
              Welcome to Sharma PG, the most premium boys hostel in Patna. Fully furnished rooms, high-speed Wi-Fi, and homely food. Experience comfort away from home.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border border-[var(--border)] rounded-2xl text-slate-600 bg-slate-50"><Wifi className="mb-2 w-6 h-6 text-[var(--primary)]"/> <span className="font-medium text-sm">Wi-Fi</span></div>
              <div className="flex flex-col items-center p-4 border border-[var(--border)] rounded-2xl text-slate-600 bg-slate-50"><Wind className="mb-2 w-6 h-6 text-[var(--primary)]"/> <span className="font-medium text-sm">AC</span></div>
              <div className="flex flex-col items-center p-4 border border-[var(--border)] rounded-2xl text-slate-600 bg-slate-50"><ShieldCheck className="mb-2 w-6 h-6 text-[var(--primary)]"/> <span className="font-medium text-sm">CCTV</span></div>
              <div className="flex flex-col items-center p-4 border border-[var(--border)] rounded-2xl text-slate-600 bg-slate-50"><Coffee className="mb-2 w-6 h-6 text-[var(--primary)]"/> <span className="font-medium text-sm">Mess</span></div>
            </div>
          </div>
          
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Available Beds</h2>
            <div className="border border-[var(--border)] rounded-2xl divide-y">
              {[1, 2, 3].map((b) => (
                <div key={b} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div>
                    <h4 className="font-bold text-lg text-[var(--text-primary)]">2-Sharing Room</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Attached Washroom</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--primary)] text-lg">₹6,000 <span className="text-sm text-[var(--text-secondary)] font-normal">/mo</span></p>
                    <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-wider">Available</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border)] sticky top-24">
            <h3 className="font-bold text-2xl mb-6 text-[var(--text-primary)]">Interested?</h3>
            {enquired ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">✓</div>
                <h4 className="font-bold text-xl text-[var(--text-primary)]">Enquiry Sent!</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-2">The manager will call you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquire} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">Your Name</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-slate-50 focus:bg-[var(--bg-card)]" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">Phone Number</label>
                  <input required name="phone" type="tel" className="w-full px-4 py-3 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-slate-50 focus:bg-[var(--bg-card)]" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">Message (Optional)</label>
                  <textarea name="message" rows={3} className="w-full px-4 py-3 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-slate-50 focus:bg-[var(--bg-card)]"></textarea>
                </div>
                <button type="submit" className="w-full bg-[var(--text-primary)] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg hover:-translate-y-0.5 mt-2">
                  Book a Visit
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
