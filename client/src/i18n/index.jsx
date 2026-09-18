import { useEffect, useMemo, useState } from "react";
import en from "./locales/en";
import fr from "./locales/fr";
import rw from "./locales/rw";
import { LanguageContext } from "./context";

const locales = { en, fr, rw };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("minidepo-language");
    if (stored && locales[stored]) return stored;
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("minidepo-language", language);
    document.documentElement.lang = language === "en" ? "en" : language === "fr" ? "fr" : "rw";
  }, [language]);

  const value = useMemo(() => {
    const dictionary = locales[language] || en;
    const t = (key, vars) => {
      let text = dictionary[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([name, val]) => {
          text = text.replace(`{${name}}`, val);
        });
      }
      return text;
    };
    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}