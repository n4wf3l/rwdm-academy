// src/pages/Index.tsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormSelector, { FormType } from "../components/FormSelector";
import FormWrapper from "../components/FormWrapper";
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
import RegistrationForm from "@/components/RegistrationForm";
import SelectionTestsForm from "@/components/SelectionTestsForm";
import AccidentReportForm from "@/components/AccidentReportForm";
import ResponsibilityWaiverForm from "@/components/ResponsibilityWaiverForm";

const Index: React.FC = () => {
  // États
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormType>(
    () => (localStorage.getItem("currentForm") as FormType) || "registration"
  );
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem("formData");
    return saved ? JSON.parse(saved) : {};
  });
  const [formMaintenanceStates, setFormMaintenanceStates] = useState({
    registration: false,
    selectionTests: false,
    accidentReport: false,
    waiver: false,
  });
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [clubName, setClubName] = useState<{
    FR: string;
    NL: string;
    EN: string;
  }>({
    FR: "",
    NL: "",
    EN: "",
  });

  // Translation hook
  const { t } = useTranslation();

  // Constante avant tous les useEffect
  const currentLang = localStorage.getItem("language") || "fr";

  // Tous les useEffects ensemble
  useEffect(() => {
    // Charger les états de maintenance
    fetch("http://localhost:5000/api/form-maintenance")
      .then((res) => res.json())
      .then((data) => {
        setFormMaintenanceStates(data.states);
      })
      .catch((error) => {
        console.error("Erreur chargement maintenance:", error);
      });
  }, []);

  // Fetch club name
  useEffect(() => {
    const fetchClubName = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        setClubName(data.general.clubName);
      } catch (err) {
        console.error("Erreur lors du chargement du nom du club :", err);
      }
    };

    fetchClubName();
  }, []);

  // ─── 1) Charger le flag maintenance depuis l'API ─────────────────────────
  useEffect(() => {
    fetch("http://localhost:5000/api/settings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        setMaintenanceMode(Boolean(data.maintenanceMode));
      })
      .catch(() => {
        setMaintenanceMode(false);
      });
  }, []);

  // ─── 2) Gérer le Splash / chargement de la langue ────────────────────────
  useEffect(() => {
    const hasLang = localStorage.getItem("language");
    if (!hasLang) {
      setShowSplash(true);
    } else {
      setPageLoaded(true);
    }
  }, []);

  // Handlers et autres fonctions
  const handleLanguageSelect = (lang: "fr" | "nl" | "en") => {
    localStorage.setItem("language", lang);
    window.dispatchEvent(new Event("language-changed"));
    setShowSplash(false);
    setTimeout(() => setPageLoaded(true), 100);
  };

  // ─── 3) Handlers Formulaire ─────────────────────────────────────────────
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

  // Rendu du formulaire
  const renderForm = () => {
    // Ajoutez un console.log pour débugger
    console.log("Current form:", currentForm);
    console.log("Maintenance states:", formMaintenanceStates);

    // Vérifier l'état de maintenance du formulaire actuel
    if (formMaintenanceStates[currentForm]) {
      console.log("Form is in maintenance");
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

    // Si pas en maintenance, afficher le formulaire approprié
    switch (currentForm) {
      case "registration":
        return (
          <RegistrationForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case "selectionTests":
        return (
          <SelectionTestsForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case "accidentReport":
        return (
          <AccidentReportForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case "waiver":
        return (
          <ResponsibilityWaiverForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      default:
        return null;
    }
  };

  // ─── 4) Tant que le flag n'est pas chargé, ne rien afficher ─────────────
  if (maintenanceMode === null) return null;

  // ─── 5) Si mode maintenance activé, on affiche uniquement MaintenancePage ─
  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {/* on centre verticalement ici */}
        <main className="flex-grow flex items-center justify-center">
          <MaintenancePage />
        </main>
        <Footer />
      </div>
    );
  }

  // Le reste du rendu reste inchangé
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Helmet>
        <title>RWDM Academy – Rejoignez l'élite du football belge</title>
        <meta
          name="description"
          content="Accédez aux formulaires officiels de l'académie RWDM : inscription, tests de sélection, décharge de responsabilité, déclaration d'accident et certificat de guérison."
        />
        {/* ... autres balises meta OG ... */}
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
                <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3 inline-block">
                  {clubName[currentLang?.toUpperCase() as "FR" | "NL" | "EN"] ||
                    "RWDM Academy"}
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
