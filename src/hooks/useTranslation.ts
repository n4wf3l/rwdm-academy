import { useEffect, useState } from "react";
import { translations } from "@/lib/i18n";

export const useTranslation = () => {
  const [lang, setLang] = useState<"fr" | "nl" | "en">(() => {
    const stored = localStorage.getItem("language");
    if (stored === "fr" || stored === "nl" || stored === "en") {
      return stored;
    }
    return "fr";
  });

  // Synchronise localStorage et déclenche l'événement si tu changes depuis setLang
  useEffect(() => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("language-changed"));
  }, [lang]);

  // Écoute les changements de langue depuis d'autres parties du site
  useEffect(() => {
    const handleLanguageChange = () => {
      const stored = localStorage.getItem("language");
      if (stored === "fr" || stored === "nl" || stored === "en") {
        setLang(stored);
      }
    };

    window.addEventListener("language-changed", handleLanguageChange);
    return () => {
      window.removeEventListener("language-changed", handleLanguageChange);
    };
  }, []);

  const t = (key: keyof (typeof translations)["fr"]) => {
    return translations[lang][key] || key;
  };

  return { t, lang, setLang };
};
