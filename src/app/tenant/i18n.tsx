'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const en = {
  dashboard: 'Dashboard',
  mess: 'Mess Wallet',
  complaints: 'Complaints',
  documents: 'Documents',
  finance: 'Payments',
  profile: 'Profile',
  logout: 'Logout',
  welcome: 'Welcome',
  payRent: 'Pay Rent',
  raiseComplaint: 'Raise Complaint',
  recentActivity: 'Recent Activity'
};

const hi = {
  dashboard: 'डैशबोर्ड (Dashboard)',
  mess: 'मेस वॉलेट (Mess Wallet)',
  complaints: 'शिकायतें (Complaints)',
  documents: 'दस्तावेज़ (Documents)',
  finance: 'भुगतान (Payments)',
  profile: 'प्रोफ़ाइल (Profile)',
  logout: 'लॉग आउट (Logout)',
  welcome: 'स्वागत है',
  payRent: 'किराया दें',
  raiseComplaint: 'शिकायत दर्ज करें',
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

export const TenantI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('spg_ui_tenant_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('spg_ui_tenant_lang', newLang);
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

export const useTenantI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTenantI18n must be used within TenantI18nProvider');
  }
  return context;
};
