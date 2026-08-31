'use client';

import { useEffect, useState } from 'react';
import { useStudentContext } from '@/app/student/components/StudentContext';
import { studentOperationsApi } from '@/lib/api/studentOperations';
import Link from 'next/link';
import { IndianRupee, MapPin, Bell, Utensils, Zap, TriangleAlert } from 'lucide-react';

export default function StudentDashboard() {
  const { profile, loading } = useStudentContext();
  const [menu, setMenu] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setMenu(studentOperationsApi.getTodayMenu(profile.propertyId));
      setNotices(studentOperationsApi.getNotices(profile.propertyId).slice(0, 3));
    }
  }, [profile]);

  if (loading || !profile) return <div className="p-4 md:p-6 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Room Info */}
      <div className="bg-[var(--primary)] text-white rounded-[var(--radius-lg,12px)] p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><MapPin className="w-32 h-32" /></div>
        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1">Your Accommodation - {profile.propertyName || 'PG'}</p>
          <h2 className="text-3xl font-black mb-4">Room {profile.roomNumber || '-'} <span className="text-xl font-normal text-white/80 ml-2">Bed {profile.bedCode || '-'}</span></h2>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded text-sm font-bold backdrop-blur-sm">
            PG Score: {profile.pgScore || 0}/100
          </div>
        </div>
      </div>

      <div className={`grid ${profile.hasMessFacility ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Dues */}
        <Link href="/student/rent" className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 flex flex-col justify-between hover:border-[var(--primary)] hover:-translate-y-1 transition-all shadow-sm group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[var(--danger-bg)] rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="text-[var(--text-secondary)] font-medium mb-3 flex items-center gap-1.5 relative z-10"><IndianRupee className="w-5 h-5 text-[var(--danger)]"/> Rent & Invoices</div>
          <div className={`text-3xl font-black relative z-10 ${profile.duesAmount > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
            ₹{profile.duesAmount || 0}
            <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">{profile.duesAmount > 0 ? 'Pending Dues' : 'Cleared'}</div>
          </div>
          <div className="mt-4 relative z-10">
            {profile.duesAmount > 0 ? (
              <span className="inline-flex items-center justify-center w-full bg-[var(--primary)] text-white text-sm font-bold py-2.5 rounded shadow hover:bg-[var(--primary-hover)] transition-colors">
                Pay Rent Now &rarr;
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-full bg-[var(--bg-input)] text-[var(--text-primary)] text-sm font-bold py-2.5 rounded hover:bg-[var(--border)] transition-colors">
                View History &rarr;
              </span>
            )}
          </div>
        </Link>
        
        {/* Mess Subscription Status (Only show if subscribed) */}
        {profile.hasMessFacility && (
          <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 flex flex-col justify-between hover:border-[var(--primary)] hover:-translate-y-1 transition-all shadow-sm group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl opacity-80 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="text-[var(--text-secondary)] font-medium mb-3 flex items-center gap-1.5 relative z-10"><Utensils className="w-5 h-5 text-yellow-500"/> Mess Facility</div>
            <div className="text-2xl font-black text-[var(--text-primary)] relative z-10">
              Subscribed
            </div>
            <div className="text-sm text-[var(--text-secondary)] font-medium mt-3 relative z-10">
              Charges included in rent
            </div>
          </div>
        )}
      </div>

      {/* SOS Button */}
      <Link href="/student/sos" className="block w-full bg-[#7f1d1d] text-white text-center py-4 rounded-[var(--radius-lg,12px)] font-black text-lg shadow-lg hover:bg-[#991b1b] transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-900/50">
        <TriangleAlert className="w-6 h-6 text-red-400" /> EMERGENCY SOS
      </Link>

      <div className={`grid ${profile.hasMessFacility ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Today's Menu (Only if subscribed) */}
        {profile.hasMessFacility && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-[var(--primary)]"/> Today's Menu
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-[var(--bg-input)] rounded">
                <span className="text-[var(--text-secondary)]">Breakfast</span>
                <span className="font-medium text-[var(--text-primary)]">{menu?.breakfast || 'TBD'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[var(--bg-input)] rounded">
                <span className="text-[var(--text-secondary)]">Lunch</span>
                <span className="font-medium text-[var(--text-primary)]">{menu?.lunch || 'TBD'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[var(--bg-input)] rounded">
                <span className="text-[var(--text-secondary)]">Dinner</span>
                <span className="font-medium text-[var(--text-primary)]">{menu?.dinner || 'TBD'}</span>
              </div>
            </div>
            <Link href="/student/mess" className="block mt-4 text-center text-sm font-bold text-[var(--primary)] py-2 border border-[var(--primary)] rounded hover:bg-[var(--primary-subtle)] transition-colors">
              Manage Meals
            </Link>
          </div>
        )}

        {/* Notices */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[var(--primary)]"/> Recent Notices
          </h3>
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="p-3 border-l-2 border-[var(--primary)] bg-[var(--bg-input)] rounded-r text-sm">
                <div className="font-bold text-[var(--text-primary)]">{n.title}</div>
                <div className="text-[var(--text-secondary)] mt-1 truncate">{n.message}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-2">{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No recent notices.</p>}
          </div>
          <Link href="/student/notices" className="inline-block mt-4 text-sm font-bold text-[var(--primary)] hover:underline">
            View All &rarr;
          </Link>
        </div>
      </div>

      {/* Refer a Friend Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[var(--radius-lg,12px)] p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-1">🎁 Refer a Friend & Get 20% Off!</h3>
          <p className="text-sm text-emerald-50 mb-4 max-w-md">
            Refer a friend to our PG. When they move in, you get a 20% flat discount on your next month's rent.
          </p>
          {profile.pendingReferralRewards > 0 && (
            <div className="mb-4 inline-flex items-center gap-2 bg-white text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
              🎉 You have {profile.pendingReferralRewards} pending 20% Off rewards!
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <h4 className="text-sm font-bold mb-3">Submit Friend's Details</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const phone = formData.get('phone') as string;
              // We simulate creating the enquiry by calling the api directly, in real app would use a proper endpoint
              import('@/lib/api').then(({ api }) => {
                api.managerEnquiries.create({
                  propertyId: profile.propertyId,
                  name,
                  phone,
                  referredByStudentId: profile.userId,
                  notes: `Referred by existing student: ${profile.user?.name || 'Friend'} (Room: ${profile.roomNumber})`
                });
                alert('Referral submitted successfully! You will get 20% off when they join.');
                (e.target as HTMLFormElement).reset();
              });
            }} className="flex flex-col sm:flex-row gap-3">
              <input name="name" required type="text" placeholder="Friend's Name" className="flex-1 bg-white/20 border border-white/30 text-white placeholder-emerald-100 px-3 py-2 rounded focus:outline-none focus:border-white text-sm" />
              <input name="phone" required type="tel" placeholder="Friend's Phone" className="flex-1 bg-white/20 border border-white/30 text-white placeholder-emerald-100 px-3 py-2 rounded focus:outline-none focus:border-white text-sm" />
              <button type="submit" className="bg-white text-emerald-600 font-bold px-4 py-2 rounded shadow hover:bg-emerald-50 transition-colors whitespace-nowrap text-sm">
                Submit Referral
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}
