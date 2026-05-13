"use client";

import { useLanguageContext } from "./LanguageProvider";
import { translations, TranslationKey } from "./translations";

export function useTranslation() {
  const { language, setLanguage } = useLanguageContext();
  
  const t = (key: TranslationKey) => {
    return translations[language][key] || translations["ko"][key] || key;
  };

  return { t, language, setLanguage };
}
