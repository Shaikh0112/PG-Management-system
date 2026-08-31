import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function SuperAdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-[var(--danger-bg)] rounded-full flex items-center justify-center mb-6 border border-[var(--danger)]">
        <ShieldAlert className="w-10 h-10 text-[var(--danger)]" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">404 - Page Not Found</h1>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        The superadmin page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/superadmin/dashboard" 
        className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-[var(--radius-md,8px)] font-medium hover:bg-[var(--primary-hover)] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
