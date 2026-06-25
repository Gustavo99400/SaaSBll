'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from './i18n';
import { format } from 'date-fns';
import { es, enUS, pt, fr } from 'date-fns/locale';

type Language = 'es' | 'en' | 'pt' | 'fr';

interface LocaleContextProps {
  locale: Language;
  changeLocale: (lang: Language) => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string | number, formatStr?: string) => string;
  formatNumber: (value: number) => string;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only access localStorage on client side
    const savedLang = localStorage.getItem('glamy_lang') as Language;
    if (savedLang && ['es', 'en', 'pt', 'fr'].includes(savedLang)) {
      setLocale(savedLang);
      i18n.changeLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const changeLocale = (lang: Language) => {
    setLocale(lang);
    localStorage.setItem('glamy_lang', lang);
    i18n.changeLanguage(lang);
  };

  const formatCurrency = (value: number): string => {
    let currency = 'PEN';
    let currencyLocale = 'es-PE';

    switch (locale) {
      case 'en':
        currency = 'USD';
        currencyLocale = 'en-US';
        break;
      case 'pt':
        currency = 'BRL';
        currencyLocale = 'pt-BR';
        break;
      case 'fr':
        currency = 'EUR';
        currencyLocale = 'fr-FR';
        break;
      default:
        currency = 'PEN';
        currencyLocale = 'es-PE';
    }

    return new Intl.NumberFormat(currencyLocale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatDate = (date: Date | string | number, formatStr?: string): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    let dateLocale = es;
    let defaultFormat = 'dd MMMM yyyy';

    switch (locale) {
      case 'en':
        dateLocale = enUS;
        defaultFormat = 'MMMM dd, yyyy';
        break;
      case 'pt':
        dateLocale = pt;
        defaultFormat = "dd 'de' MMMM 'de' yyyy";
        break;
      case 'fr':
        dateLocale = fr;
        defaultFormat = 'd MMMM yyyy';
        break;
      default:
        dateLocale = es;
        defaultFormat = "dd 'de' MMMM 'de' yyyy";
    }

    return format(d, formatStr || defaultFormat, { locale: dateLocale });
  };

  const formatNumber = (value: number): string => {
    let numLocale = 'es-PE';
    switch (locale) {
      case 'en':
        numLocale = 'en-US';
        break;
      case 'pt':
        numLocale = 'pt-BR';
        break;
      case 'fr':
        numLocale = 'fr-FR';
        break;
      default:
        numLocale = 'es-PE';
    }
    return new Intl.NumberFormat(numLocale).format(value);
  };

  return (
    <LocaleContext.Provider value={{ locale, changeLocale, formatCurrency, formatDate, formatNumber }}>
      {/* Avoid hydration mismatch by rendering children only after mounting */}
      {mounted ? children : <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
