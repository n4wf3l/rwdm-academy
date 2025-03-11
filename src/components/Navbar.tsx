
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Info, Mail } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "py-3 bg-white/90 dark:bg-rwdm-darkblue/90 backdrop-blur-lg shadow-md" : "py-5 bg-transparent",
      className
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center shadow-md overflow-hidden">
            <img src="/logo.png" alt="RWDM Logo" className="h-full w-full object-cover" />
          </div>
          <span className={cn(
            "font-bold text-xl transition-colors",
            isScrolled ? "text-rwdm-blue dark:text-white" : "text-rwdm-blue dark:text-white"
          )}>
            RWDM Academy
          </span>
        </Link>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/" active={isActivePath('/')} scrolled={isScrolled}>
            Accueil
          </NavLink>
          <NavLink to="/about" active={isActivePath('/about')} scrolled={isScrolled}>
            <div className="flex items-center gap-1.5">
              <Info size={18} />
              <span>À propos</span>
            </div>
          </NavLink>
          <NavLink to="/contact" active={isActivePath('/contact')} scrolled={isScrolled}>
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
          className="block md:hidden text-rwdm-blue dark:text-white p-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-rwdm-darkblue shadow-lg"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <MobileNavLink to="/" active={isActivePath('/')} onClick={toggleMenu}>
              Accueil
            </MobileNavLink>
            <MobileNavLink to="/about" active={isActivePath('/about')} onClick={toggleMenu}>
              <div className="flex items-center gap-2">
                <Info size={18} />
                <span>À propos</span>
              </div>
            </MobileNavLink>
            <MobileNavLink to="/contact" active={isActivePath('/contact')} onClick={toggleMenu}>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>Contact</span>
              </div>
            </MobileNavLink>
            <Link 
              to="/auth"
              className="py-3 w-full rounded-lg bg-rwdm-red text-white text-center font-medium button-transition flex items-center justify-center"
              onClick={toggleMenu}
            >
              Espace Admin
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  scrolled: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, scrolled, children }) => (
  <Link 
    to={to} 
    className={cn(
      "relative text-sm font-medium transition-colors py-2 px-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/30",
      active 
        ? "text-rwdm-red" 
        : scrolled 
          ? "text-rwdm-blue/80 dark:text-blue/80 hover:text-rwdm-red" 
          : "text-rwdm-blue/90 dark:text-white/90 hover:text-rwdm-red dark:hover:text-rwdm-red"
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

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, onClick, children }) => (
  <Link 
    to={to} 
    className={cn(
      "py-3 px-4 rounded-lg text-base font-medium transition-colors",
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
