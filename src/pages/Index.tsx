import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
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
    // ✅ Corrigé
    const hasSelectedLanguage = localStorage.getItem("language");
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

    // 👉 Scroll vers le formulaire uniquement sur mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const formElement = document.getElementById("form-start");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 200); // petit délai pour laisser le DOM s'actualiser
    }
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
    localStorage.setItem("language", language);
    window.dispatchEvent(new Event("language-changed")); // Pour le hook
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Helmet>
        <title>RWDM Academy – Rejoignez l'élite de la formation belge</title>
        <meta
          name="description"
          content="Inscrivez-vous à l'académie RWDM et participez aux tests de sélection, tournois et événements pour jeunes talents."
        />
        <meta
          name="keywords"
          content="RWDM, académie, inscription, football, jeunes talents, tests, Bruxelles"
        />
        <meta name="author" content="RWDM Academy" />
        <meta
          property="og:title"
          content="RWDM Academy – Formulaire d'inscription"
        />
        <meta
          property="og:description"
          content="Participez aux tests de sélection de l'académie RWDM dès aujourd'hui."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rwdmacademy.be" />
        <meta
          property="og:image"
          content="https://rwdmacademy.be/images/og-image.jpg"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rwdmacademy.be/" />
      </Helmet>
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
                <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3 relative inline-block">
                  RWDM Academy
                  <motion.div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, \
      black 0%, black 50%, \
      red 50%, red 100%)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
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
            <div id="form-start">
              <FormWrapper
                formType={currentForm}
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />
            </div>
          </main>

          <Footer />

          <Toaster />
        </>
      )}
    </div>
  );
};

export default Index;
