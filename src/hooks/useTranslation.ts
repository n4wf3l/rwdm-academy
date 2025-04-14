// src/hooks/useTranslation.ts
import { useEffect, useState } from "react";
import { translations } from "@/lib/i18n";

export const useTranslation = () => {
  const [lang, setLang] = useState<"fr" | "nl" | "en">("fr");

  useEffect(() => {
    const stored = localStorage.getItem("language") as
      | "fr"
      | "nl"
      | "en"
      | null;
    if (stored && ["fr", "nl", "en"].includes(stored)) {
      setLang(stored);
    }
  }, []);

  const t = (key: keyof (typeof translations)["fr"]) => {
    return translations[lang][key] || key;
  };

  return { t, lang, setLang };
};
