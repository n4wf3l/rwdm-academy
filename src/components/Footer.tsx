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
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [logo, setLogo] = useState<string | null>("/logo.png");
  const [clubName, setClubName] = useState<{
    FR: string;
    NL: string;
    EN: string;
  }>({
    FR: "",
    NL: "",
    EN: "",
  });
  const [clubAddress, setClubAddress] = useState<{
    FR: string;
    NL: string;
    EN: string;
  }>({
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

  const apiBase =
    process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

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
        const res = await fetch(`${apiBase}/api/settings`);
        const data = await res.json();
        const general = data.general || {};

        // Logo: utiliser la méthode Base64 comme dans AdminLayout
        if (general.logo && general.logo.startsWith("/uploads/")) {
          try {
            // Récupérer l'image en Base64
            const imageResponse = await fetch(
              `${apiBase}/api/file-as-base64?path=${encodeURIComponent(
                general.logo
              )}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (imageResponse.ok) {
              const base64Data = await imageResponse.text();
              setLogo(`data:image/png;base64,${base64Data}`);
              console.log("✅ Footer: Logo chargé avec succès en Base64");
            } else {
              console.error(
                "❌ Footer: Erreur lors du chargement du logo en Base64"
              );
              setLogo("/logo.png");
            }
          } catch (err) {
            console.error(
              "❌ Footer: Erreur lors de la conversion Base64:",
              err
            );
            setLogo("/logo.png");
          }
        } else {
          setLogo("/logo.png"); // Logo par défaut
        }

        setClubName(general.clubName || { FR: "", NL: "", EN: "" });
        setClubAddress(general.clubAddress || { FR: "", NL: "", EN: "" });
        setPostalCode(general.postalCode || "");
        const communeEntries = Object.entries(general.commune || {})
          .filter(([key]) => isNaN(Number(key)))
          .map<[string, string]>(([key, value]) => [key, String(value)]);
        setCommune(Object.fromEntries(communeEntries));
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
            {/* --- Votre motion.p centré en haut du footer --- */}
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
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.img
                    key={logo || "/logo.png"}
                    src={logo || "/logo.png"}
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
                    {clubName[currentLang] || "Daring Brussels Academy"}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("footer_description")}
                </p>
              </div>

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
              &copy; {new Date().getFullYear()} {clubName[currentLang]}.{" "}
              {t("all_rights_reserved")}
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
