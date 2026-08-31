'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { staffOperationsApi } from '@/lib/api/staffOperations';
import { getSession } from '@/lib/auth/session';

interface StaffContextType {
  propertyId: string | null;
  staffRole: string | null;
  loading: boolean;
}

const StaffContext = createContext<StaffContextType>({
  propertyId: null,
  staffRole: null,
  loading: true
});

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'staff') {
      const profile = staffOperationsApi.getStaffProfile(session.id);
      if (profile) {
        setPropertyId(session.assignedPropertyIds?.[0] || null);
        setStaffRole(profile.staffType || 'cook'); // default fallback
      }
    }
    setLoading(false);
  }, []);

  return (
    <StaffContext.Provider value={{ propertyId, staffRole, loading }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaffContext = () => useContext(StaffContext);
