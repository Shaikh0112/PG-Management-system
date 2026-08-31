'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Property } from '@/lib/api/properties';
import { getSession } from '@/lib/auth/session';

interface OwnerPropertyContextType {
  selectedPropertyId: string | 'all';
  setSelectedPropertyId: (id: string | 'all') => void;
  properties: Property[];
  loading: boolean;
  refreshProperties: () => void;
}

const OwnerPropertyContext = createContext<OwnerPropertyContextType>({
  selectedPropertyId: 'all',
  setSelectedPropertyId: () => {},
  properties: [],
  loading: true,
  refreshProperties: () => {},
});

export const useOwnerPropertyContext = () => useContext(OwnerPropertyContext);

export function OwnerPropertyProvider({ children }: { children: React.ReactNode }) {
  const user = typeof window !== 'undefined' ? getSession() : null;
  const [selectedPropertyId, setPropertyId] = useState<string | 'all'>('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'owner') {
      const props = api.properties.listByOwner(user.id);
      setProperties(props);
      
      const savedState = sessionStorage.getItem('spg_owner_ui_state');
      if (savedState) {
        setPropertyId(savedState);
      }
    }
    setLoading(false);
  }, [user?.id]);

  const refreshProperties = () => {
    if (user?.role === 'owner') {
      const props = api.properties.listByOwner(user.id);
      setProperties(props);
    }
  };

  const setSelectedPropertyId = (id: string | 'all') => {
    setPropertyId(id);
    sessionStorage.setItem('spg_owner_ui_state', id);
  };

  return (
    <OwnerPropertyContext.Provider value={{ selectedPropertyId, setSelectedPropertyId, properties, loading, refreshProperties }}>
      {children}
    </OwnerPropertyContext.Provider>
  );
}
