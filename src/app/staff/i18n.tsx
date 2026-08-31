'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const en = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  complaints: 'Complaints',
  mess: 'Mess Orders',
  attendance: 'Attendance',
  gateLogs: 'Gate Logs',
  visitors: 'Visitors',
  settings: 'Settings',
  logout: 'Logout',
  welcome: 'Welcome',
  pendingTasks: 'Pending Tasks',
  recentActivity: 'Recent Activity',
  cook: 'Food & Menu',
  tasks: 'Tasks',
  stock: 'Kitchen Stock'
};

const hi = {
  dashboard: 'डैशबोर्ड (Dashboard)',
  inventory: 'इन्वेंटरी (Inventory)',
  complaints: 'शिकायतें (Complaints)',
  mess: 'मेस ऑर्डर्स (Mess Orders)',
  attendance: 'उपस्थिति (Attendance)',
  gateLogs: 'गेट लॉग्स (Gate Logs)',
  visitors: 'आगंतुक (Visitors)',
  settings: 'सेटिंग्स (Settings)',
  logout: 'लॉग आउट (Logout)',
  welcome: 'स्वागत (Welcome)',
  pendingTasks: 'लंबित कार्य',
  recentActivity: 'हाल की गतिविधि',
  cook: 'भोजन और मेनू (Food & Menu)',
  tasks: 'कार्य (Tasks)',
  stock: 'किचन का सामान (Kitchen Stock)'
};

const dictionaries = { en, hi };
export type DictKey = keyof typeof en;

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const StaffI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('spg_ui_staff_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('spg_ui_staff_lang', newLang);
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

export const useStaffI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useStaffI18n must be used within StaffI18nProvider');
  }
  return context;
};
