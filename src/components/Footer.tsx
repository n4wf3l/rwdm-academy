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

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [logo, setLogo] = useState("/logo.png");
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
  const { t, lang } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  const getLocalizedValue = (
    field: { [key: string]: string } | undefined,
    lang: string
  ): string => {
    if (!field) return "";

    // Priorité : langue actuelle, fallback FR, puis première clé non numérique
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
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        const general = data.general || {};

        setLogo(general.logo || "/logo.png");
        setClubName(general.clubName || {});
        setClubAddress(general.clubAddress || {});
        setPostalCode(general.postalCode || "");
        setCommune(
          Object.fromEntries(
            Object.entries(general.commune || {}).filter(([key]) =>
              isNaN(Number(key))
            )
          ) as Record<string, string>
        );
        setCountry(
          Object.fromEntries(
            Object.entries(general.country || {}).filter(([key]) =>
              isNaN(Number(key))
            )
          ) as Record<string, string>
        );
        setEmail(general.email || "");
        setFacebookUrl(general.facebookUrl || "");
        setInstagramUrl(general.instagramUrl || "");

        // Marquer comme chargé
        setIsLoaded(true);
      } catch (error) {
        console.error("Erreur chargement footer :", error);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logo || "/placeholder-logo.png"}
                    alt={clubName?.[currentLang] || "Logo"}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                    width={40}
                    height={40}
                  />

                  <h3 className="font-bold text-xl text-rwdm-blue dark:text-white">
                    {clubName?.[currentLang] || "RWDM Academy"}
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
                      t("email_unavailable") || "Email indisponible"
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
                  {t("legal_info") || "Informations Légales"}
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                  <li>
                    <Link
                      to="/legal"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      <span>
                        {t("privacy_policy") || "Politique de Confidentialité"}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=terms"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>
                        {t("terms_and_conditions") ||
                          "Conditions Générales d'Utilisation"}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=legal"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{t("legal_notice") || "Mentions Légales"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal?tab=cookies"
                      className="inline-flex items-center hover:text-rwdm-red transition-colors"
                    >
                      <Cookie className="h-4 w-4 mr-2" />
                      <span>
                        {t("cookie_policy") || "Politique de Cookies"}
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>
                &copy; {new Date().getFullYear()}{" "}
                {clubName?.[currentLang] || "RWDM Academy"}.{" "}
                {t("all_rights_reserved") || "Tous droits réservés."}
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
};
export default Footer;
