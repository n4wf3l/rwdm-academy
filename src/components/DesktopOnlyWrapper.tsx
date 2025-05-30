import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const DesktopOnlyWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { t } = useTranslation();

  // Récupération du logo depuis la base de données
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        if (data.general.logo && data.general.logo.startsWith("/uploads/")) {
          setLogoUrl(data.general.logo);
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error("Erreur chargement logo :", err);
      }
    };
    fetchLogo();
  }, []);

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-6 bg-white dark:bg-black">
        <div className="h-20 w-20 mb-6 overflow-hidden flex items-center justify-center">
          <motion.img
            key={logoUrl || "/placeholder-logo.png"}
            src={logoUrl || "/placeholder-logo.png"}
            alt="Logo"
            className="h-full w-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (
                target.src !==
                window.location.origin + "/placeholder-logo.png"
              ) {
                target.src = "/placeholder-logo.png";
              }
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          {t("desktop_view_unavailable") || "Vue non disponible"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t("desktop_view_message") ||
            "Cette interface d'administration est uniquement accessible sur ordinateur."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopOnlyWrapper;
