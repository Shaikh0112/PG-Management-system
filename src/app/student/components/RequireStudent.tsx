'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export function RequireStudent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'student') {
      router.replace('/student/login');
      return;
    }
    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)]">Loading Student App...</div>;
  return <>{children}</>;
}
