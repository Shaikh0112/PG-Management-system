'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const en = {
  dashboard: 'Dashboard',
  ownerRequests: 'Owner Requests',
  owners: 'PG Owners',
  tickets: 'Tickets',
  subscriptions: 'Subscriptions',
  reports: 'Reports',
  settings: 'Settings',
  logout: 'Logout',
  welcome: 'Welcome',
  quickActions: 'Quick Actions',
  recentActivity: 'Recent Activity'
};

const hi = {
  dashboard: 'डैशबोर्ड (Dashboard)',
  ownerRequests: 'मालिक अनुरोध (Owner Requests)',
  owners: 'पीजी मालिक (PG Owners)',
  tickets: 'टिकट (Tickets)',
  subscriptions: 'सब्सक्रिप्शन (Subscriptions)',
  reports: 'रिपोर्ट (Reports)',
  settings: 'सेटिंग्स (Settings)',
  logout: 'लॉग आउट (Logout)',
  welcome: 'स्वागत है',
  quickActions: 'त्वरित कार्रवाई',
  recentActivity: 'हाल की गतिविधि'
};

const dictionaries = { en, hi };
export type DictKey = keyof typeof en;

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const SuperadminI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('spg_ui_superadmin_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('spg_ui_superadmin_lang', newLang);
  };

  const t = (key: DictKey): string => {
    return dictionaries[lang][key] || dictionaries.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useSuperadminI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useSuperadminI18n must be used within SuperadminI18nProvider');
  }
  return context;
};
