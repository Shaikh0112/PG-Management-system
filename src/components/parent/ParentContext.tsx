'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { parentOperationsApi } from '@/lib/api/parentOperations';
import { getSession } from '@/lib/auth/session';

interface ParentContextType {
  child: any | null;
  loading: boolean;
}

const ParentContext = createContext<ParentContextType>({
  child: null,
  loading: true
});

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [child, setChild] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'parent') {
      const c = parentOperationsApi.getLinkedChild(session.id);
      setChild(c);
    }
    setLoading(false);
  }, []);

  return (
    <ParentContext.Provider value={{ child, loading }}>
      {children}
    </ParentContext.Provider>
  );
}

export const useParentContext = () => useContext(ParentContext);
