'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export function RequireStaff({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'staff') {
      router.replace('/staff/login');
      return;
    }
    if (session.mustChangePassword && !pathname.includes('/staff/first-login')) {
      router.replace('/staff/first-login');
      return;
    }
    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)]">Loading Staff Portal...</div>;
  return <>{children}</>;
}
