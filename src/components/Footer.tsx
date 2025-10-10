// src/components/Footer.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  FileText,
  BookOpen,
  Cookie,
  Facebook,
  Instagram,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { API_BASE, resolveMediaUrl, fetchConfig } from "@/lib/api-config";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [logo, setLogo] = useState<string>("/logo.png");
  const [clubName, setClubName] = useState<{ FR: string; NL: string; EN: string }>({
    FR: "",
    NL: "",
    EN: "",
  });
  const [clubAddress, setClubAddress] = useState<{ FR: string; NL: string; EN: string }>({
    FR: "",
    NL: "",
    EN: "",
  });
  const [commune, setCommune] = useState<{ [key: string]: string }>({});
  const [country, setCountry] = useState<{ [key: string]: string }>({});
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const currentLang = localStorage.getItem("language")?.toUpperCase() || "FR";
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  const getLocalizedValue = (
    field: { [key: string]: string } | undefined,
    lang: string
  ): string => {
    if (!field) return "";
    return (
      field[lang] ||
      field["FR"] ||
      Object.entries(field).find(([key]) => isNaN(Number(key)))?.[1] ||
      ""
    );
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings`, fetchConfig);
        const data = await res.json();
        const general = data?.general || {};

        // Logo - récupérer via fetch pour éviter les problèmes CORS
        if (general.logo) {
          try {
            const imageResponse = await fetch(general.logo, {
              credentials: 'omit' // Pas de credentials pour les images
            });
            
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const dataUrl = URL.createObjectURL(blob);
              setLogo(dataUrl);
              console.log("✅ Footer: Logo chargé en Data URL");
            } else {
              console.log("❌ Footer: Échec du chargement de l'image, utilisation du placeholder");
              setLogo("/logo.png");
            }
          } catch (imageError) {
            console.error("❌ Footer: Erreur lors du chargement de l'image:", imageError);
            setLogo("/logo.png");
          }
        } else {
          setLogo("/logo.png");
        }

        setClubName(general.clubName || { FR: "", NL: "", EN: "" });
        setClubAddress(general.clubAddress || { FR: "", NL: "", EN: "" });
        setPostalCode(general.postalCode || "");

        const communeEntries = Object.entries(general.commune || {})
          .filter(([key]) => isNaN(Number(key)))
          .map<[string, string]>(([key, value]) => [key, String(value)]);
        setCommune(Object.fromEntries(communeEntries));

        const countryEntries = Object.entries(general.country || {})
          .filter(([key]) => isNaN(Number(key)))
          .map<[string, string]>(([key, value]) => [key, String(value)]);
        setCountry(Object.fromEntries(countryEntries));

        setEmail(general.email || "");
        setFacebookUrl(general.facebookUrl || "");
        setInstagramUrl(general.instagramUrl || "");

        setIsLoaded(true);
      } catch (error) {
        console.error("Erreur chargement footer :", error);
        setLogo("/logo.png");
        setIsLoaded(true);
      }
    };

    fetchSettings();
    
    // Cleanup function pour libérer les blob URLs
    return () => {
      if (logo && logo.startsWith('blob:')) {
        URL.revokeObjectURL(logo);
      }
    };
  }, []);

  return (
    <>
      {!isLoaded ? (
        <div className="min-h-[350px] opacity-0">Chargement...</div>
      ) : (
        <footer
          className={cn(
            "py-8 px-4 mt-8 bg-gray-100 dark:bg-rwdm-darkblue/60 min-h-[300px]",
            className
          )}
        >
          <div className="container mx-auto min-h-[350px]">
            {/* Slogan motion centré */}
            <motion.p
              className="text-gray-600 text-3xl mt-2 text-center"
              style={{ fontFamily: "'Dancing Script', cursive" }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              A legend never <span style={{ color: "red" }}>dies</span>
            </motion.p>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              {/* Bloc identité */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.img
                    key={logo}
                    src={logo}
                    alt={clubName[currentLang] || "Logo"}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                    width={40}
                    height={40}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    onError={(e) => {
                      console.error("❌ Footer: Erreur d'affichage du logo");
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                  <h3 className="font-bold text-xl text-rwdm-blue dark:text-white">
                    {clubName[currentLang] || "RWDM Academy"}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("footer_description")}
                </p>
              </div>

              {/* Bloc contact */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-rwdm-blue dark:text-white">
                  {t("contact")}
                </h3>
                <address className="not-italic text-gray-600 dark:text-gray-300 text-sm">
                  <p>{getLocalizedValue(clubAddress, currentLang)}</p>
                  <p>
                    <span className="font-medium">{postalCode}</span>{" "}
                    {getLocalizedValue(commune, currentLang)}
                  </p>
                  <p>{getLocalizedValue(country, currentLang)}</p>
                  <p className="mt-2">
                    {email ? (
                      <a href={`mailto:${email}`} className="hover:underline">
                        {email}
                      </a>
                    ) : (
                      t("email_unavailable")
                    )}
                  </p>
                </address>
                <div className="flex space-x-4 mt-4">
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-gray-600 hover:text-pink-500 transition-colors"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bloc légal */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-rwdm-blue dark:text-white">
                  {t("legal_info")}
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                  <li>
                    <Link
                      to="/legal"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {t("privacy_policy")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=terms"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {t("terms_and_conditions")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=legal"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t("legal_notice")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=cookies"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <Cookie className="h-4 w-4 mr-2" />
                      {t("cookie_policy")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {clubName[currentLang] || "RWDM Academy"}.{" "}
              {t("all_rights_reserved")}
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
