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
  const [currentForm, setCurrentForm] = useState<FormType>(
    () => (localStorage.getItem("currentForm") as FormType) || "registration"
  );
  const [formData, setFormData] = useState<{ [key: string]: any }>(() => {
    const savedData = localStorage.getItem("formData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const { t } = useTranslation();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem("language");
    if (!hasSelectedLanguage) {
      setShowSplash(true);
    } else {
      setPageLoaded(true);
    }
  }, []);

  const handleLanguageSelect = (language: "fr" | "nl" | "en") => {
    localStorage.setItem("language", language);
    window.dispatchEvent(new Event("language-changed"));
    setShowSplash(false);
    setTimeout(() => {
      setPageLoaded(true);
    }, 100);
  };

  const handleFormChange = (formType: FormType) => {
    setCurrentForm(formType);
    localStorage.setItem("currentForm", formType);
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const formElement = document.getElementById("form-start");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  };

  const handleFormDataChange = (key: string, value: any) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };
      localStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Helmet>
        <title>RWDM Academy – Rejoignez l'élite du football belge</title>
        <meta
          name="description"
          content="Accédez aux formulaires officiels de l'académie RWDM : inscription, tests de sélection, décharge de responsabilité, déclaration d'accident et certificat de guérison."
        />
        <meta
          name="keywords"
          content="RWDM, académie, inscription, football, tests de sélection, accident, certificat, décharge, jeunes talents, Bruxelles"
        />
        <meta name="author" content="RWDM Academy" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rwdmacademy.be/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rwdmacademy.be" />
        <meta
          property="og:title"
          content="RWDM Academy – Formulaires officiels"
        />
        <meta
          property="og:description"
          content="Accédez aux formulaires de l'académie RWDM : demande d'inscription, participation aux tests de sélection, et déclarations officielles."
        />
        <meta
          property="og:image"
          content="https://rwdmacademy.be/images/og-image.jpg"
        />
        <meta property="og:site_name" content="RWDM Academy" />
        <meta property="og:locale" content="fr_BE" />
        <meta
          property="article:publisher"
          content="https://www.facebook.com/RWDMAcademy/"
        />
        <meta
          property="article:author"
          content="https://www.instagram.com/rwdm_academy/"
        />
      </Helmet>

      {showSplash && (
        <SplashComponent onLanguageSelect={handleLanguageSelect} />
      )}

      {pageLoaded && (
        <>
          <Navbar />
          <main className="container mx-auto px-4 pt-28 pb-20 flex-grow">
            <AnimatedTransition show={pageLoaded} className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3 relative inline-block">
                  RWDM Academy
                </h1>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("welcome")}
              </p>
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

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto space-y-1 text-center">
              <p>{t("champ")}</p>
              <div className="flex items-center justify-center space-x-1">
                <Info className="h-4 w-4 text-gray-500" />
                <p>{t("champ2")}</p>
              </div>
            </div>

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
