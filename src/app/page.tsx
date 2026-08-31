'use client';

import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import Link from 'next/link';
import { CheckCircle, Shield, Users, Bed, CreditCard, Bell, Bot, PenTool } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
            PG ko digital banao. <br className="hidden md:block" />
            <span className="text-[var(--primary)]">Rent, mess, safety</span> — ek system.
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            World-class Hostel Operating System designed for India. No more excel sheets, no more WhatsApp groups. Just one platform to manage your entire property empire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/owner-request" className="w-full sm:w-auto bg-[var(--primary)] text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1">
              Start as PG Owner
            </Link>
          </div>
        </section>

        {/* Roles Grid */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Everything for Everyone</h2>
            <p className="text-[var(--text-secondary)] mt-4">One system. 4 Isolated Roles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Owner', desc: 'Financials & properties', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' },
              { role: 'Manager', desc: 'Daily operations & students', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
              { role: 'Staff', desc: 'Cooks, guards, cleaners', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' },
              { role: 'Student', desc: 'Rent, mess & complaints', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' }
            ].map((r, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm flex flex-col items-start transition-all hover:shadow-md hover:-translate-y-1">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${r.color} mb-4`}>{r.role}</div>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{r.desc}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* USPs Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <CreditCard />, title: 'Pay-per-day Mess', desc: 'Students only pay for the meals they eat.' },
              { icon: <Bell />, title: 'SOS & Safety', desc: '1-click emergency alerts directly to manager.' },
              { icon: <Bed />, title: 'Vacant Bed Listing', desc: 'Share your availability publicly and get leads.' },
              { icon: <PenTool />, title: 'eSign Agreements', desc: 'Paperless rent agreements generated automatically.' },
              { icon: <Bot />, title: 'AI Matching', desc: 'Find the perfect roommate with AI suggestions.' }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[var(--primary)] shrink-0">{f.icon}</div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{f.title}</h4>
                  <p className="text-[var(--text-secondary)] text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-[var(--bg-card)] border border-[var(--border)] py-20 mt-16 rounded-[var(--radius-xl,16px)] mx-4 lg:mx-auto max-w-7xl mb-8 shadow-sm">
          <div className="px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-[var(--text-primary)]">How it works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4">
              <div className="flex-1">
                <div className="w-12 h-12 bg-[var(--bg-page)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-[var(--border)] text-[var(--text-primary)]">1</div>
                <h3 className="font-bold text-[var(--text-primary)]">Request</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Fill the owner request form</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-[var(--border)]"></div>
              <div className="flex-1">
                <div className="w-12 h-12 bg-[var(--bg-page)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-[var(--border)] text-[var(--text-primary)]">2</div>
                <h3 className="font-bold text-[var(--text-primary)]">Approval</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-2">SuperAdmin creates your account</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-[var(--border)]"></div>
              <div className="flex-1">
                <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg shadow-indigo-500/50 text-white">3</div>
                <h3 className="font-bold text-[var(--text-primary)]">Go Live</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Add PGs, Staff & Students</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* DEBUG BUTTON TO RESET LOCAL STORAGE */}
      <div className="fixed bottom-4 left-4 z-50">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              alert('Database Reset! Reloading...');
              window.location.reload();
            }
          }}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded shadow"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
