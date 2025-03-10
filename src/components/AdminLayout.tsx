
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40">
      {/* Header mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass-panel md:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="text-rwdm-blue dark:text-white font-semibold text-xl">Admin RWDM</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white dark:bg-rwdm-darkblue shadow-lg z-50 transition-transform duration-300 transform md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center space-x-2 p-6 border-b">
            <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="text-rwdm-blue dark:text-white font-semibold text-xl">Admin RWDM</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? "default" : "ghost"} 
                className={cn(
                  "w-full justify-start",
                  isActive('/dashboard') ? "bg-rwdm-blue hover:bg-rwdm-blue/90" : ""
                )}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Tableau de bord
              </Button>
            </Link>
            <Link to="/planning">
              <Button 
                variant={isActive('/planning') ? "default" : "ghost"} 
                className={cn(
                  "w-full justify-start",
                  isActive('/planning') ? "bg-rwdm-blue hover:bg-rwdm-blue/90" : ""
                )}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Planning
              </Button>
            </Link>
          </nav>
          
          <div className="p-4 border-t">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20">
                <LogOut className="mr-2 h-5 w-5" />
                Déconnexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 min-h-screen">
        <main className="container mx-auto px-4 pt-28 pb-20">
          {children}
        </main>
        
        <footer className="py-6 px-4 mt-8 glass-panel">
          <div className="container mx-auto text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Académie RWDM. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
