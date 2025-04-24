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
    const fetchClubName = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
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
      fetch("http://localhost:5000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Données utilisateur reçues :", data); // 👈
          setUser({ firstName: data.firstName, lastName: data.lastName });
          localStorage.setItem("adminId", data.id);
        })
        .catch((err) =>
          console.error("Erreur lors de la récupération de l'utilisateur:", err)
        );
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();

        if (data.general.logo) {
          if (data.general.logo.startsWith("/uploads/")) {
            setLogoUrl(data.general.logo); // 👈 URL relative directement utilisable
          } else if (data.general.logo.startsWith("/uploads/")) {
            setLogoUrl(`http://localhost:5000${data.general.logo}`); // fichier uploadé
          } else {
            setLogoUrl(null);
          }
        }
      } catch (err) {
        console.error("Erreur chargement logo :", err);
      }
    };

    fetchLogo();
  }, []);

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
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const changeLanguage = (lang: "fr" | "nl" | "en") => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("language-changed"));
    navigate(location.pathname + location.search); // rester sur la même page
  };

  return (
    <>
      <header
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
                  src={logoUrl} // Pas besoin de forcer "http://localhost:5000"
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
                  "RWDM Academy"}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-rwdm-red dark:hover:text-white transition">
                  <Globe className="h-4 w-4" />
                  <span>{langLabels[currentLang]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="mt-1 z-[9999]">
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
              </DropdownMenu>
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
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white dark:bg-rwdm-darkblue shadow-lg overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <MobileNavLink
                  to="/"
                  active={isActivePath("/")}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center gap-2">
                    <Home size={18} />
                    <span>Accueil</span>
                  </div>
                </MobileNavLink>

                <MobileNavLink
                  to="/about"
                  active={isActivePath("/about")}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center gap-2">
                    <Info size={18} />
                    <span>À propos</span>
                  </div>
                </MobileNavLink>

                <MobileNavLink
                  to="/contact"
                  active={isActivePath("/contact")}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center gap-2">
                    <Mail size={18} />
                    <span>Contact</span>
                  </div>
                </MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

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
