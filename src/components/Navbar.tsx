
import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass-panel",
      className
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <span className="text-rwdm-blue dark:text-white font-semibold text-xl">RWDM Academy</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            to="/" 
            className="text-sm font-medium text-rwdm-blue/70 dark:text-white/70 hover:text-rwdm-blue dark:hover:text-white transition-colors"
          >
            Accueil
          </Link>
          <Link 
            to="#" 
            className="text-sm font-medium text-rwdm-blue/70 dark:text-white/70 hover:text-rwdm-blue dark:hover:text-white transition-colors"
          >
            À propos
          </Link>
          <Link 
            to="#" 
            className="text-sm font-medium text-rwdm-blue/70 dark:text-white/70 hover:text-rwdm-blue dark:hover:text-white transition-colors"
          >
            Contact
          </Link>
          <Link 
            to="/auth"
            className="ml-4 py-1.5 px-4 bg-rwdm-blue text-white rounded-full text-sm font-medium button-transition hover:bg-rwdm-blue/90"
          >
            Authentification
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
