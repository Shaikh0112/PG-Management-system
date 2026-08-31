'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { tenantOperationsApi } from '@/lib/api/tenantOperations';
import { getSession } from '@/lib/auth/session';

interface TenantContextType {
  profile: any | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  profile: null,
  loading: true
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'tenant') {
      const p = tenantOperationsApi.getProfile(session.id);
      setProfile(p);
    }
    setLoading(false);
  }, []);

  return (
    <TenantContext.Provider value={{ profile, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenantContext = () => useContext(TenantContext);
