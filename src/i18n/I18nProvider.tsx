import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { en } from './locales/en';
import { ko } from './locales/ko';

export type Locale = 'en' | 'ko';

export type TranslationKeys = keyof typeof en;
type TranslationRecord = Record<TranslationKeys, string>;

const LOCALE_STORAGE_KEY = 'ion_locale';

const translations: Record<Locale, TranslationRecord> = { en, ko };

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKeys, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectBrowserLocale(): Locale {
  // Check localStorage first
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'ko') return saved;
  } catch { /* noop */ }

  // Check browser language
  const lang = navigator.language?.toLowerCase() || '';
  if (lang.startsWith('ko')) return 'ko';

  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectBrowserLocale);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch { /* noop */ }
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState(prev => prev === 'en' ? 'ko' : 'en');
  }, []);

  const t = useCallback(
    (key: TranslationKeys, params?: Record<string, string>): string => {
      let text = translations[locale][key];
      if (text === undefined) {
        // Fallback to English
        text = translations.en[key] ?? key;
      }
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
