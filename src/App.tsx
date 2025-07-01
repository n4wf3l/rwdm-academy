import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SplashComponent from "@/components/SplashComponent"; // 👈 Ajoute ton Splash ici
import axios from "axios";
import MaintenancePage from "./components/MaintenancePage";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Members from "./pages/Members";
import Documents from "./pages/Documents";
import Graphics from "./pages/Graphics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import EmailSettingsPage from "./pages/EmailSettingsPage";

import FormSubmissionSuccess from "./pages/FormSubmissionSuccess";
import Legal from "./pages/Legal";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import DesktopOnlyWrapper from "./components/DesktopOnlyWrapper";

const queryClient = new QueryClient();

const AuthRedirect = ({ children }) => {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Token JWT invalide :", error);
      localStorage.removeItem("token");
      return children; // Token invalide, afficher l'écran de login
    }
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};
function App() {
  const [language, setLanguage] = useState<string | null>(() =>
    localStorage.getItem("language")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalMaintenance, setIsGlobalMaintenance] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
      } catch (error) {}
    }
  }, []);

  // DÉCOMMENTEZ CETTE PARTIE, elle est essentielle
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload.role?.toLowerCase();

        // Définir les routes par rôle
        const routesByRole = {
          admin: [
            "/dashboard",
            "/members",
            "/planning",
            "/documents",
            "/graphics",
          ],
          superadmin: [
            "/dashboard",
            "/members",
            "/planning",
            "/documents",
            "/graphics",
            "/settings",
            "/emails",
          ],
          owner: [
            "/dashboard",
            "/members",
            "/planning",
            "/documents",
            "/graphics",
            "/settings",
            "/emails",
          ],
        };

        // DÉCOMMENTER cette partie: ⚠️
        const allowedRoutes = routesByRole[userRole] || [];
        const isOnAllowedPage = allowedRoutes.includes(
          window.location.pathname
        );
        const isOnHomepage = window.location.pathname === "/";

        if (!isOnAllowedPage && !isOnHomepage) {
          console.log(
            `🛑 BLOCAGE: ${userRole} tente d'accéder à ${window.location.pathname}`
          );
          const dashboardUrl =
            window.location.hostname === "localhost"
              ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}/dashboard`
              : "https://daringbrusselsacademy.be/node/dashboard";

          window.location.href = dashboardUrl;
        }
      } catch (error) {
        console.error("Erreur lors du décodage du token :", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("language");
      if (newLang) setLanguage(newLang);
    };

    window.addEventListener("language-changed", handleLanguageChange);
    return () => {
      window.removeEventListener("language-changed", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = await axios.get("/api/settings");
        setIsGlobalMaintenance(Boolean(response.data.maintenanceMode));
      } catch (error) {
        console.error("Erreur lors de la vérification du mode maintenance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceStatus();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>; // Ou votre composant de chargement
  }

  // Si le site est en mode maintenance globale et l'utilisateur n'est pas connecté en tant qu'admin
  if (isGlobalMaintenance && !localStorage.getItem("token")) {
    return <MaintenancePage />;
  }

  if (!language) {
    return (
      <SplashComponent
        onLanguageSelect={(lang) => {
          localStorage.setItem("language", lang);
          setLanguage(lang);
        }}
      />
    );
  }

  // App principale une fois la langue sélectionnée
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/auth"
              element={
                <AuthRedirect>
                  <Auth />
                </AuthRedirect>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DesktopOnlyWrapper>
                    <Dashboard />
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <DesktopOnlyWrapper>
                    <Members />
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DesktopOnlyWrapper>
                    <Documents />
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/graphics"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <DesktopOnlyWrapper>
                    <Graphics />
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <DesktopOnlyWrapper>
                    <Planning /> {/* Correction ici */}
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["owner", "superadmin"]}>
                  <DesktopOnlyWrapper>
                    <Settings />
                  </DesktopOnlyWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/emails"
              element={
                <ProtectedRoute allowedRoles={["owner", "superadmin"]}>
                  <EmailSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/legal" element={<Legal />} />
            <Route
              path="/success/responsibilityWaiver"
              element={
                <FormSubmissionSuccess formType="responsibilityWaiver" />
              }
            />
            <Route
              path="/success/registration"
              element={<FormSubmissionSuccess formType="registration" />}
            />
            <Route
              path="/success/selectionTests"
              element={<FormSubmissionSuccess formType="selectionTests" />}
            />
            <Route
              path="/success/accidentReport"
              element={<FormSubmissionSuccess formType="accidentReport" />}
            />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
