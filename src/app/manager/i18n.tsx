'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const en = {
  dashboard: 'Dashboard',
  enquiries: 'Enquiries',
  checkin: 'Check-in Wizard',
  tenants: 'Tenants',
  complaints: 'Complaints',
  staff: 'Staff',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings',
  logout: 'Logout',
  welcome: 'Welcome',
  totalTenants: 'Total Tenants',
  vacantBeds: 'Vacant Beds',
  activeComplaints: 'Active Complaints',
  todayCheckins: 'Today Check-ins',
  recentActivity: 'Recent Activity'
};

const hi = {
  dashboard: 'डैशबोर्ड (Dashboard)',
  enquiries: 'पूछताछ (Enquiries)',
  checkin: 'चेक-इन विजार्ड (Check-in Wizard)',
  tenants: 'किरायेदार (Tenants)',
  complaints: 'शिकायतें (Complaints)',
  staff: 'कर्मचारी (Staff)',
  inventory: 'इन्वेंटरी (Inventory)',
  reports: 'रिपोर्ट (Reports)',
  settings: 'सेटिंग्स (Settings)',
  logout: 'लॉग आउट (Logout)',
  welcome: 'स्वागत है',
  totalTenants: 'कुल किरायेदार',
  vacantBeds: 'खाली बिस्तर',
  activeComplaints: 'सक्रिय शिकायतें',
  todayCheckins: 'आज के चेक-इन',
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

export const ManagerI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('spg_ui_manager_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('spg_ui_manager_lang', newLang);
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

export const useManagerI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useManagerI18n must be used within ManagerI18nProvider');
  }
  return context;
};
