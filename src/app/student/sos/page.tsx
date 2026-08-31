'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentContext } from '@/app/student/components/StudentContext';
import { getSession } from '@/lib/auth/session';
import { TriangleAlert, ShieldAlert } from 'lucide-react';
import { studentOperationsApi } from '@/lib/api/studentOperations';

export default function StudentSosPage() {
  const router = useRouter();
  const { profile } = useStudentContext();
  const session = typeof window !== 'undefined' ? getSession() : null;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSos = () => {
    if (!profile || !session) return;
    setLoading(true);
    setTimeout(() => {
      studentOperationsApi.triggerSos(profile.studentId || profile.userId, profile.propertyId, session.id);
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-[var(--danger)] rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--danger)] mb-2">Manager Alerted!</h1>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            Your SOS has been recorded and sent to the Guard and Manager. Help is on the way.
          </p>
        </div>
        <button onClick={() => router.push('/student/dashboard')} className="mt-8 px-8 py-3 bg-[var(--bg-input)] text-[var(--text-primary)] rounded font-bold hover:bg-[var(--primary)] hover:text-white transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Emergency SOS</h1>
        <p className="text-[var(--text-secondary)]">Press the button below only in case of a genuine emergency.</p>
      </div>

      <button 
        onClick={handleSos}
        disabled={loading}
        className="relative group focus:outline-none focus:ring-4 focus:ring-red-500/50 rounded-full"
      >
        <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300"></div>
        <div className="relative w-48 h-48 bg-gradient-to-b from-red-500 to-red-700 rounded-full flex flex-col items-center justify-center text-white shadow-[inset_0_-10px_20px_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.5)] border-4 border-red-800/30 transform active:scale-95 transition-transform">
          <TriangleAlert className="w-16 h-16 mb-2" />
          <span className="font-black text-3xl tracking-widest uppercase text-white/90 drop-shadow-md">SOS</span>
        </div>
      </button>

      <div className="bg-[var(--warning-bg)] border border-[var(--warning)] p-4 rounded-[var(--radius-lg,12px)] text-[var(--warning)] text-sm">
        <strong>Warning:</strong> False alarms may result in a deduction of your PG score or penalties as per your agreement.
      </div>
    </div>
  );
}
