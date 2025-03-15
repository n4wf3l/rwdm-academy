
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Members from "./pages/Members";
import Documents from "./pages/Documents";
import Graphics from "./pages/Graphics";
import NotFound from "./pages/NotFound";
import FormSubmissionSuccess from "./pages/FormSubmissionSuccess";
import Legal from "./pages/Legal";

const queryClient = new QueryClient();

function App() {
  // Check if user has selected a language
  const hasSelectedLanguage = localStorage.getItem("preferredLanguage");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect to splash screen if no language selected */}
            <Route
              path="/"
              element={
                hasSelectedLanguage ? <Index /> : <Navigate to="/welcome" />
              }
            />
            <Route path="/welcome" element={<SplashScreen />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/graphics" element={<Graphics />} />
            <Route path="/planning" element={<Planning />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
