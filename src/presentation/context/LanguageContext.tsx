import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type TranslationSchema } from '../../i18n';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationSchema) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('portfolio_lang');
      return saved === 'en' || saved === 'am' ? saved : 'en';
    } catch (_) { return 'en'; }
  });

  useEffect(() => {
    localStorage.setItem('portfolio_lang', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: keyof TranslationSchema): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
