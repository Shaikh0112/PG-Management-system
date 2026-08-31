'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const en = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  rooms: 'Rooms',
  students: 'Students',
  finance: 'Finance',
  mess: 'Mess',
  reports: 'Reports',
  team: 'Team',
  subscription: 'Subscription',
  settings: 'Settings',
  logout: 'Logout',
  welcome: 'Welcome back',
  totalProperties: 'Total Properties',
  totalRevenue: 'Total Revenue',
  activeStudents: 'Active Students',
  vacantBeds: 'Vacant Beds',
  quickActions: 'Quick Actions',
  addProperty: 'Add Property',
  viewReports: 'View Reports',
  manageTeam: 'Manage Team',
  recentActivity: 'Recent Activity',
  noActivity: 'No recent activity.'
};

const hi = {
  dashboard: 'डैशबोर्ड (Dashboard)',
  properties: 'संपत्तियां (Properties)',
  rooms: 'कमरे (Rooms)',
  students: 'किरायेदार (Students)',
  finance: 'वित्तीय (Finance)',
  mess: 'मेस (Mess)',
  reports: 'रिपोर्ट (Reports)',
  team: 'टीम (Team)',
  subscription: 'सब्सक्रिप्शन (Subscription)',
  settings: 'सेटिंग्स (Settings)',
  logout: 'लॉग आउट (Logout)',
  welcome: 'वापसी पर स्वागत है',
  totalProperties: 'कुल संपत्तियां',
  totalRevenue: 'कुल आय',
  activeStudents: 'सक्रिय किरायेदार',
  vacantBeds: 'खाली बिस्तर',
  quickActions: 'त्वरित कार्रवाई',
  addProperty: 'संपत्ति जोड़ें',
  viewReports: 'रिपोर्ट देखें',
  manageTeam: 'टीम प्रबंधित करें',
  recentActivity: 'हाल की गतिविधि',
  noActivity: 'कोई हाल की गतिविधि नहीं।'
};

const dictionaries = { en, hi };
export type DictKey = keyof typeof en;

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: DictKey) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const OwnerI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('spg_ui_owner_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('spg_ui_owner_lang', newLang);
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

export const useOwnerI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useOwnerI18n must be used within OwnerI18nProvider');
  }
  return context;
};
