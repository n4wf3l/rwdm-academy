import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Mail, Menu, X, LogOut, Home, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = localStorage.getItem("language") || "fr";
  const { t } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuModalOpen, setIsMobileMenuModalOpen] = useState(false);
  const langLabels = {
    fr: "Français",
    nl: "Nederlands",
    en: "English",
  };
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [clubName, setClubName] = useState<{
    FR: string;
    NL: string;
    EN: string;
  }>({
    FR: "",
    NL: "",
    EN: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Appliquer uniquement en mobile
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        setLastScrollY(currentScrollY);
      } else {
        setShowNavbar(true); // Toujours visible en desktop
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchClubName = async () => {
      try {
        const res = await fetch(
          "https://daringbrusselsacademy.be/node/api/settings"
        );
        const data = await res.json();
        setClubName(data.general.clubName);
      } catch (err) {
        console.error("Erreur lors du chargement du nom du club :", err);
      }
    };

    fetchClubName();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetch("https://daringbrusselsacademy.be/node/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser({ firstName: data.firstName, lastName: data.lastName });
          localStorage.setItem("adminId", data.id);
        })
        .catch((err) =>
          console.error("Erreur lors de la récupération de l'utilisateur:", err)
        );
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuModalOpen]);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // 1. Récupérer les paramètres généraux (dont le chemin du logo)
        const res = await fetch(
          "https://daringbrusselsacademy.be/node/api/settings"
        );
        const data = await res.json();

        if (
          data.general &&
          data.general.logo &&
          data.general.logo.startsWith("/uploads/")
        ) {
          console.log("✅ Logo trouvé dans les paramètres:", data.general.logo);

          // 2. Récupérer l'image en Base64
          const imageResponse = await fetch(
            `https://daringbrusselsacademy.be/node/api/file-as-base64?path=${encodeURIComponent(
              data.general.logo
            )}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (imageResponse.ok) {
            const base64Data = await imageResponse.text();
            // 3. Définir l'URL avec le contenu Base64
            setLogoUrl(`data:image/png;base64,${base64Data}`);
            console.log("✅ Logo chargé avec succès en Base64");
          } else {
            console.error("❌ Erreur lors du chargement du logo en Base64");
            setLogoUrl("/placeholder-logo.png");
          }
        } else {
          setLogoUrl("/placeholder-logo.png");
        }
      } catch (err) {
        console.error("❌ Erreur chargement logo:", err);
        setLogoUrl("/placeholder-logo.png");
      }
    };

    fetchLogo();
  }, []); // ✅ N'exécute qu'une seule fois au montage du composant

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    // 1) On déconnecte l’utilisateur
    localStorage.removeItem("token");
    setIsLoggedIn(false);

    // 2) On affiche le toast
    toast({
      title: t("logout.success"),
      description: t("logout.message"),
    });

    // 3) On redirige
    navigate("/");
  };

  const changeLanguage = (lang: "fr" | "nl" | "en") => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("language-changed"));
    navigate(location.pathname + location.search); // rester sur la même page
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // au montage
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "py-3 bg-white/90 dark:bg-rwdm-darkblue/90 backdrop-blur-lg shadow-md"
            : "py-5 bg-transparent",
          className
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="h-10 w-10 flex items-center justify-center">
              {logoUrl && (
                <motion.img
                  key={logoUrl} // Pour réinitialiser l'animation si le logo change
                  src={logoUrl}
                  alt="Logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="h-full w-full object-contain"
                />
              )}
            </Link>

            <div className="flex flex-col items-start space-y-1">
              <span
                className={cn(
                  "font-bold text-xl transition-colors",
                  isScrolled ? "text-rwdm-blue dark:text-white" : "text-blue"
                )}
              >
                {clubName[currentLang.toUpperCase() as "FR" | "NL" | "EN"] ||
                  "Daring Brussels Academy"}
              </span>

              {isMobile ? (
                <button
                  onClick={() => setIsLangModalOpen(true)}
                  className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-rwdm-red dark:hover:text-white transition"
                >
                  <Globe className="h-4 w-4" />
                  <span>{langLabels[currentLang]}</span>
                </button>
              ) : (
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={() => {
                        if (isMobile) setIsLangModalOpen(true);
                      }}
                      className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-rwdm-red dark:hover:text-white transition"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{langLabels[currentLang]}</span>
                    </DropdownMenuTrigger>

                    {!isMobile && (
                      <DropdownMenuContent
                        align="start"
                        className="mt-1 z-[9999]"
                      >
                        <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                          Français
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("nl")}>
                          Nederlands
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("en")}>
                          English
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={isActivePath("/")} scrolled={isScrolled}>
              <div className="flex items-center gap-1.5">
                <Home size={18} />
                <span>{t("home")}</span>
              </div>
            </NavLink>
            <NavLink
              to="/about"
              active={isActivePath("/about")}
              scrolled={isScrolled}
            >
              <div className="flex items-center gap-1.5">
                <Info size={18} />
                <span>{t("about")}</span>
              </div>
            </NavLink>
            <NavLink
              to="/contact"
              active={isActivePath("/contact")}
              scrolled={isScrolled}
            >
              <div className="flex items-center gap-1.5">
                <Mail size={18} />
                <span>{t("contact")}</span>
              </div>
            </NavLink>
            <Link
              to="/auth"
              className={cn(
                "py-2 px-6 rounded-full text-sm font-medium transition-all button-transition",
                "bg-rwdm-red text-white hover:bg-rwdm-red/90 shadow-md hover:shadow-lg"
              )}
            >
              {t("admin_space")}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="block md:hidden text-rwdm-blue dark:text-white"
            onClick={() => setIsMobileMenuModalOpen(true)}
            aria-label="Ouvrir menu mobile"
          >
            <Menu size={28} />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuModalOpen && (
            <motion.div
              key="mobile-links-modal"
              onClick={() => setIsMobileMenuModalOpen(false)}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* ❌ Croix toujours tout en haut à droite de l'écran */}
              <button
                onClick={() => setIsMobileMenuModalOpen(false)}
                className="absolute top-5 right-5 text-white hover:text-rwdm-red transition z-[10000]"
                aria-label="Fermer"
              >
                <X size={30} />
              </button>

              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center space-y-10 text-white text-[22px] font-light tracking-wider w-full px-8"
              >
                {[
                  { to: "/", label: t("home"), icon: <Home size={22} /> },
                  { to: "/about", label: t("about"), icon: <Info size={22} /> },
                  {
                    to: "/contact",
                    label: t("contact"),
                    icon: <Mail size={22} />,
                  },
                ].map(({ to, label, icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setIsMobileMenuModalOpen(false)}
                      className="relative flex items-center justify-center gap-3"
                    >
                      {icon}
                      <span>{label}</span>

                      {isActive && (
                        <motion.div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                          style={{
                            background:
                              "linear-gradient(to right, white 0%, white 50%, red 50%, red 100%)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Bloc utilisateur + bouton de déconnexion côte à côte en bas à droite */}
      {isLoggedIn && (
        <div className="hidden md:flex fixed bottom-5 right-5 z-50 items-center space-x-3">
          {/* Bouton Déconnexion */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transition-all duration-300 flex items-center group overflow-hidden"
          >
            <LogOut className="h-5 w-5 transition-all duration-300" />
            <span className="ml-2 whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300">
              {t("logout")}
            </span>
          </button>

          {/* Nom + rond vert */}
          <div className="flex items-center space-x-2 bg-white dark:bg-rwdm-darkblue p-2 rounded shadow">
            <span className="text-gray-800 dark:text-white font-medium">
              {user.firstName} {user.lastName}
            </span>
            <div className="relative flex items-center justify-center">
              <div className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping"></div>
              <div className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isLangModalOpen && (
          <motion.div
            key="language-modal"
            onClick={() => setIsLangModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ❌ Croix en haut à droite de l’écran */}
            <button
              onClick={() => setIsLangModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-rwdm-red transition z-[10000]"
              aria-label="Fermer"
            >
              <X size={28} />
            </button>

            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-6 w-full max-w-sm px-6"
            >
              {(["fr", "nl", "en"] as const).map((lang) => {
                const isActive = currentLang === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      changeLanguage(lang);
                      setIsLangModalOpen(false);
                    }}
                    className="relative text-white text-xl font-light tracking-wide hover:text-rwdm-red transition"
                  >
                    {langLabels[lang]}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                        style={{
                          background:
                            "linear-gradient(to right, white 0%, white 50%, red 50%, red 100%)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  scrolled: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  active,
  scrolled,
  children,
}) => (
  <Link
    to={to}
    className={cn(
      "relative text-sm font-medium transition-colors",
      active
        ? "text-rwdm-red"
        : scrolled
        ? "text-rwdm-blue/80 dark:text-blue/80 hover:text-rwdm-red"
        : "text-blue/90 hover:text-blue"
    )}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rwdm-red"
      />
    )}
  </Link>
);

interface MobileNavLinkProps {
  to: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  to,
  active,
  onClick,
  children,
}) => (
  <Link
    to={to}
    className={cn(
      "py-2 px-3 rounded-lg text-base font-medium",
      active
        ? "bg-rwdm-blue/10 text-rwdm-blue dark:bg-white/10 dark:text-white"
        : "text-rwdm-blue/80 dark:text-white/80 hover:bg-rwdm-blue/5 dark:hover:bg-white/5"
    )}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
