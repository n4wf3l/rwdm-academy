// src/pages/Index.tsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormSelector, { FormType } from "../components/FormSelector";
import AnimatedTransition from "../components/AnimatedTransition";
import SplashComponent from "../components/SplashComponent";
import MaintenancePage from "../components/MaintenancePage";
import MaintenancePage2 from "../components/MaintenancePage2";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserGuideDialog from "@/components/dialogs/UserGuideDialog";
import { useTranslation } from "@/hooks/useTranslation";

// Lazy load des formulaires volumineux
const RegistrationForm = lazy(() => import("@/components/RegistrationForm"));
const SelectionTestsForm = lazy(
  () => import("@/components/SelectionTestsForm")
);
const AccidentReportForm = lazy(
  () => import("@/components/AccidentReportForm")
);
const ResponsibilityWaiverForm = lazy(
  () => import("@/components/ResponsibilityWaiverForm")
);

// Squelette de chargement
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8 w-full max-w-4xl mx-auto">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// URL de base de l'API
const API_BASE =
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

const Index: React.FC = () => {
  // États
  const [status, setStatus] = useState<{
    loading: boolean;
    maintenanceMode: boolean | null;
    formMaintenance: Record<string, boolean>;
    clubName: Record<string, string>;
  }>({
    loading: true,
    maintenanceMode: null,
    formMaintenance: {
      registration: false,
      selectionTests: false,
      accidentReport: false,
      waiver: false,
    },
    clubName: { FR: "", NL: "", EN: "" },
  });

  const [showSplash, setShowSplash] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormType>(
    () => (localStorage.getItem("currentForm") as FormType) || "registration"
  );
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem("formData");
    return saved ? JSON.parse(saved) : {};
  });
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Translation hook
  const { t } = useTranslation();
  const currentLang = localStorage.getItem("language")?.toUpperCase() || "FR";

  // Charger les données initiales en parallèle
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Précharger toutes les données en parallèle
        const [maintenanceRes, formMaintenanceRes, settingsRes] =
          await Promise.all([
            fetch(`${API_BASE}/api/settings`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }),
            fetch(`${API_BASE}/api/form-maintenance`),
            fetch(`${API_BASE}/api/settings`),
          ]);

        // Traiter toutes les réponses
        const maintenanceData = await maintenanceRes.json();
        const formMaintenanceData = await formMaintenanceRes.json();
        const settingsData = await settingsRes.json();

        // Mettre à jour l'état en une seule opération
        setStatus({
          loading: false,
          maintenanceMode: Boolean(maintenanceData.maintenanceMode),
          formMaintenance: formMaintenanceData.states || {
            registration: false,
            selectionTests: false,
            accidentReport: false,
            waiver: false,
          },
          clubName: settingsData.general?.clubName || {
            FR: "",
            NL: "",
            EN: "",
          },
        });
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
        // En cas d'erreur, ne pas bloquer l'UI
        setStatus((prev) => ({
          ...prev,
          loading: false,
          maintenanceMode: false,
        }));
      }
    };

    loadInitialData();

    // Vérifier si la langue est déjà définie
    const hasLang = localStorage.getItem("language");
    if (!hasLang) {
      setShowSplash(true);
    } else {
      setPageLoaded(true);
    }
  }, []); // Exécuté une seule fois au chargement

  // Handlers
  const handleLanguageSelect = (lang: "fr" | "nl" | "en") => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("language-changed"));
    setShowSplash(false);
    setTimeout(() => setPageLoaded(true), 100);
  };

  const handleFormChange = (form: FormType) => {
    setCurrentForm(form);
    localStorage.setItem("currentForm", form);
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document
          .getElementById("form-start")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  };

  const handleFormDataChange = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("formData", JSON.stringify(next));
      return next;
    });
  };

  // Rendu du formulaire avec Suspense pour le lazy loading
  const renderForm = () => {
    // Vérifier l'état de maintenance du formulaire actuel
    if (status.formMaintenance[currentForm]) {
      return (
        <MaintenancePage2
          formType={
            currentForm as
              | "registration"
              | "selectionTests"
              | "accidentReport"
              | "waiver"
          }
        />
      );
    }

    // Utilisation de Suspense pour tous les formulaires en lazy loading
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        {currentForm === "registration" && (
          <RegistrationForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        )}
        {currentForm === "selectionTests" && (
          <SelectionTestsForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        )}
        {currentForm === "accidentReport" && (
          <AccidentReportForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        )}
        {currentForm === "waiver" && (
          <ResponsibilityWaiverForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        )}
      </Suspense>
    );
  };

  // Interface de chargement au lieu de retourner null
  if (status.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20 flex-grow">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // Mode maintenance global
  if (status.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <MaintenancePage />
        </main>
        <Footer />
      </div>
    );
  }

  // Le reste du rendu reste similaire
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Helmet>
        <title>RWDM Academy – Rejoignez l'élite du football belge</title>
        <meta
          name="description"
          content="Accédez aux formulaires officiels de l'académie RWDM : inscription, tests de sélection, décharge de responsabilité, déclaration d'accident et certificat de guérison."
        />
        {/* Préconnexion pour réduire la latence de connexion au backend */}
        <link rel="preconnect" href={API_BASE} />
      </Helmet>

      {showSplash && (
        <SplashComponent onLanguageSelect={handleLanguageSelect} />
      )}

      {pageLoaded && (
        <>
          <Navbar />

          <main className="container mx-auto px-4 pt-28 pb-20 flex-grow">
            {/* Titre animé */}
            <AnimatedTransition show={pageLoaded} className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3 inline-block relative">
                  {status.clubName[currentLang as "FR" | "NL" | "EN"] ||
                    "RWDM Academy"}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, black 0%, black 50%, red 50%, red 100%)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </h1>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("welcome")}
              </p>

              {/* Note champ obligatoire */}
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto space-y-1 text-center">
                <p>{t("champ")}</p>
                <div className="flex items-center justify-center space-x-1">
                  <Info className="h-4 w-4 text-gray-500" />
                  <p>{t("champ2")}</p>
                </div>
              </div>

              {/* Bouton Guide d'utilisation */}
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setGuideModalOpen(true)}
                  className="flex items-center gap-2 bg-white dark:bg-rwdm-darkblue/60 hover:bg-rwdm-blue/90 hover:text-white rounded shadow"
                  variant="ghost"
                  size="sm"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-medium">{t("user_guide")}</span>
                </Button>
              </div>
            </AnimatedTransition>

            {/* Sélecteur de formulaire */}
            <AnimatedTransition
              show={pageLoaded}
              animateIn="animate-slide-up"
              animateOut="animate-fade-out"
              duration={600}
              className="mb-10"
            >
              <FormSelector
                currentForm={currentForm}
                onSelectForm={handleFormChange}
              />
            </AnimatedTransition>

            {/* Formulaire */}
            <div id="form-start">{renderForm()}</div>
          </main>

          <Footer />
          <Toaster />

          {/* Modal du Guide d'utilisation */}
          <UserGuideDialog
            open={guideModalOpen}
            onOpenChange={setGuideModalOpen}
          />
        </>
      )}
    </div>
  );
};

export default Index;
