import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, Mail, Menu, X, LogOut } from "lucide-react";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si un token est présent pour savoir si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

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
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">
                <img src="/logo.png" alt="Logo" />
              </span>
            </div>
            <span
              className={cn(
                "font-bold text-xl transition-colors",
                isScrolled ? "text-rwdm-blue dark:text-white" : "text-blue"
              )}
            >
              RWDM Academy
            </span>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={isActivePath("/")} scrolled={isScrolled}>
              Accueil
            </NavLink>
            <NavLink
              to="/about"
              active={isActivePath("/about")}
              scrolled={isScrolled}
            >
              <div className="flex items-center gap-1.5">
                <Info size={18} />
                <span>À propos</span>
              </div>
            </NavLink>
            <NavLink
              to="/contact"
              active={isActivePath("/contact")}
              scrolled={isScrolled}
            >
              <div className="flex items-center gap-1.5">
                <Mail size={18} />
                <span>Contact</span>
              </div>
            </NavLink>
            <Link
              to="/auth"
              className={cn(
                "py-2 px-6 rounded-full text-sm font-medium transition-all button-transition",
                "bg-rwdm-red text-white hover:bg-rwdm-red/90 shadow-md hover:shadow-lg"
              )}
            >
              Espace Admin
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
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-rwdm-darkblue shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <MobileNavLink
                to="/"
                active={isActivePath("/")}
                onClick={toggleMenu}
              >
                Accueil
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
      </header>

      {/* Bouton de déconnexion en bas à droite si connecté */}
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="fixed bottom-5 right-5 bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-all flex items-center"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </button>
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
        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-rwdm-red"
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
