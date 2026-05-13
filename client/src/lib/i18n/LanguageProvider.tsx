"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = sessionStorage.getItem("app_language") as Language;
    if (storedLang && (storedLang === "ko" || storedLang === "en")) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    sessionStorage.setItem("app_language", lang);
  };

  // Prevent hydration mismatch by optionally not rendering until mounted,
  // or just return children with default 'ko' before mount.
  // We'll just return children, the texts might flicker from 'ko' to 'en' on first load if 'en' is stored, 
  // but it's standard Next.js behavior for client-side sessionStorage.
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div style={{ visibility: mounted ? "visible" : "hidden" }} className="contents">
        {mounted ? children : children /* Rendering children but hiding them until mounted to avoid hydration mismatch if text differs */}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return context;
}
