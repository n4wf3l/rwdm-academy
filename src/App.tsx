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
import FormSubmissionSuccess from "./pages/FormSubmissionSuccess";
import Legal from "./pages/Legal";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const AuthRedirect = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />; // Redirige si déjà connecté
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* ✅ Router doit englober les routes */}
        <Router>
          <ScrollToTop /> {/* ✅ Ici, il s'exécute après chaque navigation */}
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
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/members" element={<Members />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/graphics" element={<Graphics />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/settings" element={<Settings />} />
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
