import { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, getInitialLanguage } from '../i18n/languages';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('microgpt-language', language);

    // Set HTML lang attribute for accessibility and SEO
    document.documentElement.lang = language;

    // Set dir attribute for RTL languages (Arabic, Hebrew, etc.)
    const isRTL = LANGUAGES[language]?.rtl || false;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language]);

  // Get translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation missing
        value = translations.en;
        for (const k of keys) {
          value = value?.[k];
        }
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        break;
      }
    }

    return value || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    languageInfo: LANGUAGES[language],
    availableLanguages: Object.values(LANGUAGES)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
