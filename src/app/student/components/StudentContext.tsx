'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { studentOperationsApi } from '@/lib/api/studentOperations';
import { getSession } from '@/lib/auth/session';

interface StudentContextType {
  profile: any | null;
  loading: boolean;
}

const StudentContext = createContext<StudentContextType>({
  profile: null,
  loading: true
});

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'student') {
      const p = studentOperationsApi.getProfile(session.id);
      setProfile(p);
    }
    setLoading(false);
  }, []);

  return (
    <StudentContext.Provider value={{ profile, loading }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudentContext = () => useContext(StudentContext);
