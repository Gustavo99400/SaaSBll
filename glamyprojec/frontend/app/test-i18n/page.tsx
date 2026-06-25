'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/app/lib/LocaleContext';

export default function TestI18nPage() {
  const { t } = useTranslation();
  const { locale, changeLocale, formatCurrency, formatDate, formatNumber } = useLocale();

  const testDate = new Date();
  const testAmount = 1500.50;
  const testQuantity = 9876543;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 md:p-16 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
            🌐 i18n & l10n Test Lab
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t('test.title')}
          </h1>
          <p className="text-slate-400 text-sm">
            {t('test.desc')}
          </p>
        </div>

        {/* Language Selection Buttons */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {t('test.selectedLang')}: <span className="text-white font-mono">{locale.toUpperCase()}</span>
          </span>
          <div className="flex gap-2 w-full max-w-sm justify-center">
            {(['es', 'en', 'pt', 'fr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLocale(lang)}
                className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all shadow-md text-sm border ${
                  locale === lang
                    ? 'bg-rose-600 text-white border-rose-500 scale-105'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'es' && 'Español (ES)'}
                {lang === 'en' && 'English (EN)'}
                {lang === 'pt' && 'Português (PT)'}
                {lang === 'fr' && 'Français (FR)'}
              </button>
            ))}
          </div>
        </div>

        {/* Translation & Formatting Demonstrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Static/Dynamic i18n Translation */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              1. Traducción (i18n)
            </span>
            <h3 className="text-white font-semibold">
              {t('test.testText')}
            </h3>
            <p className="text-xs text-slate-500 mt-auto font-mono">
              Key: test.testText
            </p>
          </div>

          {/* Card 2: Date Localization (l10n) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              2. Localización de Fechas (l10n)
            </span>
            <h3 className="text-white font-bold text-lg">
              {formatDate(testDate)}
            </h3>
            <p className="text-xs text-slate-500 mt-auto font-mono">
              Format: Long Date (date-fns)
            </p>
          </div>

          {/* Card 3: Currency Localization (l10n) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. Localización de Divisas (l10n)
            </span>
            <h3 className="text-emerald-400 font-bold text-2xl">
              {formatCurrency(testAmount)}
            </h3>
            <p className="text-xs text-slate-500 mt-auto font-mono">
              Locale Currencies: PEN / USD / BRL / EUR
            </p>
          </div>

          {/* Card 4: Number Localization (l10n) */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              4. Localización de Números (l10n)
            </span>
            <h3 className="text-purple-400 font-bold text-xl">
              {formatNumber(testQuantity)}
            </h3>
            <p className="text-xs text-slate-500 mt-auto font-mono">
              Format: Standard Intl.NumberFormat
            </p>
          </div>
        </div>

        {/* Navigation back */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs">
          <Link href="/" className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
            ← Volver al Panel de Control
          </Link>
          <span className="text-slate-500">
            VII Semestre — Ingeniería Web
          </span>
        </div>

      </div>
    </div>
  );
}
