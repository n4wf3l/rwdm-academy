import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  File,
  Menu,
  X,
  UserCircleIcon,
  BarChart,
  Settings,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ firstName: "", lastName: "", role: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = localStorage.getItem("language") || "fr";
  const { t } = useTranslation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const langLabels = {
    fr: "Français",
    nl: "Nederlands",
    en: "English",
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        if (data.general.logo.startsWith("/uploads/")) {
          setLogoUrl(data.general.logo);
        } else {
          setLogoUrl(null); // ou une URL distante si tu gères les fichiers côté serveur
        }
      } catch (err) {
        console.error("Erreur chargement logo :", err);
      }
    };

    fetchLogo();
  }, []);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Récupération des infos utilisateur depuis le backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
        console.log("👤 Utilisateur connecté :", data); // ← ajoute ça ici
      })
      .catch((err) =>
        console.error("Erreur lors de la récupération de l'utilisateur:", err)
      );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40">
      {/* Bloc utilisateur fixe en haut à droite */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white dark:bg-rwdm-darkblue p-2 rounded shadow">
        <span className="text-gray-800 dark:text-white font-medium">
          {user.firstName} {user.lastName}
        </span>
        <div className="relative flex items-center justify-center">
          <div className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping"></div>
          <div className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></div>
        </div>
      </div>

      {/* Header mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass-panel md:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-rwdm-red flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="text-rwdm-blue dark:text-white font-semibold text-xl">
              Admin RWDM
            </span>
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
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white dark:bg-rwdm-darkblue shadow-lg z-50 transition-transform duration-300 transform md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            {/* Ligne supérieure : logo + titre */}
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/" className="flex items-center">
                <ArrowLeft size={24} className="text-rwdm-blue" />
              </Link>

              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 flex items-center justify-center text-white font-bold text-xl">
                  {logoUrl ? (
                    <img
                      src={logoUrl} // ✅ URL relative comme "/uploads/monlogo.png"
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src="/placeholder-logo.png" // 🔁 fallback si aucun logo uploadé
                      alt="Logo par défaut"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                <span className="text-rwdm-blue dark:text-white font-semibold text-xl">
                  {t("admin_panel")}
                </span>
              </div>
            </div>

            {/* Ligne inférieure : choix de langue centré */}
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-rwdm-red dark:hover:text-white transition">
                  <Globe className="h-4 w-4" />
                  <span>{langLabels[currentLang]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="mt-1 z-[9999]">
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.setItem("language", "fr");
                      window.dispatchEvent(new Event("language-changed"));
                    }}
                  >
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.setItem("language", "nl");
                      window.dispatchEvent(new Event("language-changed"));
                    }}
                  >
                    Nederlands
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.setItem("language", "en");
                      window.dispatchEvent(new Event("language-changed"));
                    }}
                  >
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {/* Liens de navigation */}
            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive("/dashboard")
                    ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                    : ""
                )}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {t("admin_dashboard")}
              </Button>
            </Link>
            <Link to="/documents">
              <Button
                variant={isActive("/documents") ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive("/documents")
                    ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                    : ""
                )}
              >
                <File className="mr-2 h-5 w-5" />
                {t("admin_documents")}
              </Button>
            </Link>
            <Link to="/planning">
              <Button
                variant={isActive("/planning") ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive("/planning")
                    ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                    : ""
                )}
              >
                <Calendar className="mr-2 h-5 w-5" />
                {t("admin_planning")}
              </Button>
            </Link>
            <Link to="/members">
              <Button
                variant={isActive("/members") ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive("/members")
                    ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                    : ""
                )}
              >
                <UserCircleIcon className="mr-2 h-5 w-5" />
                {t("admin_members")}
              </Button>
            </Link>
            {user.role === "owner" && (
              <Link to="/graphics">
                <Button
                  variant={isActive("/graphics") ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive("/graphics")
                      ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                      : ""
                  )}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  {t("admin_graphics")}
                </Button>
              </Link>
            )}
            {["owner", "superadmin"].includes(user.role) && (
              <Link to="/settings">
                <Button
                  variant={isActive("/settings") ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive("/settings")
                      ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                      : ""
                  )}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  {t("admin_settings")}
                </Button>
              </Link>
            )}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {t("admin_logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 min-h-screen">
        <main className="container mx-auto px-4 pt-28 pb-20">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
