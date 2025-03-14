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

const queryClient = new QueryClient();

function App() {
  // Check if user has selected a language
  const hasSelectedLanguage = localStorage.getItem("preferredLanguage");

  return (
    <div className="app">
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/success/:formType" element={<FormSubmissionSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
