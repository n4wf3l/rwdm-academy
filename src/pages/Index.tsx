import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormSelector, { FormType } from "../components/FormSelector";
import FormWrapper from "../components/FormWrapper";
import AnimatedTransition from "../components/AnimatedTransition";
import SplashComponent from "../components/SplashComponent";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Index = () => {
  // Restaurer la sélection du formulaire depuis localStorage (par défaut "registration")
  const [currentForm, setCurrentForm] = useState<FormType>(
    () => (localStorage.getItem("currentForm") as FormType) || "registration"
  );

  const [formData, setFormData] = useState<{ [key: string]: any }>(() => {
    const savedData = localStorage.getItem("formData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const { t } = useTranslation();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem("preferredLanguage");
    if (hasSelectedLanguage) {
      setShowSplash(false);
    } else {
      setTimeout(() => {
        setShowSplash(true);
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) {
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Mettre à jour `localStorage` quand l'utilisateur change de formulaire
  const handleFormChange = (formType: FormType) => {
    setCurrentForm(formType);
    localStorage.setItem("currentForm", formType);
  };

  // Sauvegarde automatique des données de formulaire
  const handleFormDataChange = (key: string, value: any) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };
      localStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Restaurer la langue sélectionnée
  const handleLanguageSelect = (language: "fr" | "nl" | "en") => {
    localStorage.setItem("preferredLanguage", language);
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      {showSplash ? (
        <SplashComponent onLanguageSelect={handleLanguageSelect} />
      ) : (
        <>
          <Navbar />

          <main className="container mx-auto px-4 pt-28 pb-20 flex-grow">
            <AnimatedTransition
              show={pageLoaded}
              animateIn="animate-slide-down"
              animateOut="animate-fade-out"
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3">
                  RWDM Academy
                </h1>

                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {t("welcome")}
                </p>
              </motion.div>
            </AnimatedTransition>

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

            {/* Légende des champs */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto space-y-1 text-center">
              <p>{t("champ")}</p>

              <div className="flex items-center justify-center space-x-1">
                <Info className="h-4 w-4 text-gray-500" />
                <p>{t("champ2")}</p>
              </div>
            </div>

            {/* ✅ On passe `formData` et `handleFormDataChange` pour gérer les données */}
            <FormWrapper
              formType={currentForm}
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          </main>

          <Footer />

          <Toaster />
        </>
      )}
    </div>
  );
};

export default Index;
