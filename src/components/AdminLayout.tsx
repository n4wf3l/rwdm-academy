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
  UserIcon,
  Mail,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import ViewProfile from "@/components/members/ViewProfile"; // Nouvel import
import { format } from "date-fns";

interface AdminLayoutProps {
  children: React.ReactNode;
  newRequestsCount?: number;
}
interface User {
  firstName: string;
  lastName: string;
  role: string;
  profilePicture: string;
  email: string;
  function?: string;
  createdAt?: string;
  assignmentsCount?: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  newRequestsCount = 0,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    role: "",
    profilePicture: "",
    email: "",
  });

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false); // Nouvel état
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0); // Ajouté pour le compteur de rendez-vous du jour
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentLang = localStorage.getItem("language") || "fr";
  const { t } = useTranslation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const langLabels = {
    fr: "Français",
    nl: "Nederlands",
    en: "English",
  };

  // Récupération du logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        if (data.general.logo && data.general.logo.startsWith("/uploads/")) {
          setLogoUrl(data.general.logo);
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error("Erreur chargement logo :", err);
      }
    };
    fetchLogo();
  }, []);

  // Récupération des infos utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Si l'URL de la photo est relative, le modifier
        let profilePictureUrl = data.profilePicture;
        if (profilePictureUrl && profilePictureUrl.startsWith("/uploads/")) {
          profilePictureUrl = `http://localhost:5000${profilePictureUrl}`;
        }
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          profilePicture: profilePictureUrl,
          email: data.email,
          function: data.function, // Ajouté pour la fonction (profession)
          createdAt: data.createdAt, // Ajouté pour la date de création
          assignmentsCount: data.assignmentsCount,
        });
      })
      .catch((err) =>
        console.error("Erreur lors de la récupération de l'utilisateur:", err)
      );
  }, []);

  // Récupération des rendez-vous du jour
  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Erreur récupération rendez-vous");

        const data = await response.json();
        const today = format(new Date(), "yyyy-MM-dd");

        // Filtrer les rendez-vous pour aujourd'hui
        const todayAppointments = data.filter(
          (appointment) =>
            format(new Date(appointment.date), "yyyy-MM-dd") === today
        );

        setTodayAppointmentsCount(todayAppointments.length);
      } catch (error) {
        console.error("Erreur lors du fetch des rendez-vous du jour:", error);
      }
    };

    fetchTodayAppointments();

    // Rafraîchir toutes les 5 minutes
    const intervalId = setInterval(fetchTodayAppointments, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const confirmLogout = () => {
    localStorage.removeItem("token");
    toast({
      title: t("logout.success"),
      description: t("logout.message"),
    });
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

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
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="h-10 w-10 overflow-hidden shadow-md border bg-white flex items-center justify-center">
                  <motion.img
                    key={logoUrl || "/placeholder-logo.png"}
                    src={logoUrl || "/placeholder-logo.png"}
                    alt="Logo"
                    className="h-full w-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <motion.span
                  className="text-rwdm-blue dark:text-white font-semibold text-xl"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("admin_panel")}
                </motion.span>
              </motion.div>
            </div>

            {/* Choix de langue */}
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
                      toast({
                        title: t("language_changed_title"),
                        description: t("language_changed_desc"),
                      });
                    }}
                  >
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.setItem("language", "nl");
                      window.dispatchEvent(new Event("language-changed"));
                      toast({
                        title: t("language_changed_title"),
                        description: t("language_changed_desc"),
                      });
                    }}
                  >
                    Nederlands
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.setItem("language", "en");
                      window.dispatchEvent(new Event("language-changed"));
                      toast({
                        title: t("language_changed_title"),
                        description: t("language_changed_desc"),
                      });
                    }}
                  >
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start relative",
                  isActive("/dashboard")
                    ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                    : ""
                )}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {t("admin_dashboard")}
                <AnimatePresence>
                  {newRequestsCount > 0 && (
                    <motion.span
                      key="newRequestsBadge"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-2 right-3 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold w-5 h-5"
                    >
                      {newRequestsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
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

            {["owner", "superadmin"].includes(user.role) && (
              <Link to="/emails">
                <Button
                  variant={isActive("/emails") ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive("/emails")
                      ? "bg-rwdm-blue hover:bg-rwdm-blue/90"
                      : ""
                  )}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Emails
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
          </nav>

          {/* Bloc des rendez-vous du jour - PLACEZ-LE ICI */}
          <div className="mx-4 mb-4">
            <Link
              to="/planning"
              className="block cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {t("today_appointments")}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-200">
                      {todayAppointmentsCount}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {todayAppointmentsCount === 0
                        ? t("no_appointments_today")
                        : todayAppointmentsCount === 1
                        ? t("appointment_singular")
                        : t("appointments_plural")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Bloc en bas du sidebar */}
          <div className="p-4 border-t">
            <div className="flex flex-col items-center mb-4">
              <motion.img
                key={user.profilePicture || "default-avatar"}
                src={user.profilePicture || "/avatar.jpg"}
                alt="Avatar"
                className="h-12 w-12 rounded-full object-cover shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== window.location.origin + "/avatar.jpg") {
                    target.src = "/avatar.jpg";
                  }
                }}
              />

              <span className="mt-2 text-gray-800 dark:text-white font-medium">
                {user.firstName} {user.lastName}
              </span>
              {/* Affichage du rôle en utilisant les variants du Badge */}
              {user.role === "owner" && (
                <Badge variant="default">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}
              {user.role === "superadmin" && (
                <Badge variant="secondary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}
              {user.role === "admin" && (
                <Badge variant="outline">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}
            </div>
            {/* Remplacement du Link par un Button pour ouvrir le modal ViewProfile */}
            <Button
              variant="ghost"
              onClick={() => setProfileModalOpen(true)}
              className="flex w-full justify-start items-center text-gray-600 dark:text-gray-300 hover:bg-rwdm-blue/90 hover:text-white mb-4"
            >
              <UserIcon className="mr-2 h-5 w-5" />
              {t("account_button")}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white"
              onClick={() => setLogoutModalOpen(true)}
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

      {/* Modal de profil */}
      <ViewProfile
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />

      {/* Confirmation modal pour la déconnexion */}
      <ConfirmationDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          confirmLogout();
        }}
        title={t("logout_title")}
        message={t("logout_message")}
      />
    </div>
  );
};

export default AdminLayout;
