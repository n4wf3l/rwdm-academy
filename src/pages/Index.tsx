
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormSelector, { FormType } from '../components/FormSelector';
import FormWrapper from '../components/FormWrapper';
import AnimatedTransition from '../components/AnimatedTransition';
import SplashComponent from '../components/SplashComponent';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [currentForm, setCurrentForm] = useState<FormType>('registration');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Check if user has already selected a language
  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem("preferredLanguage");
    if (hasSelectedLanguage) {
      setShowSplash(false);
    }
    
    // Simulate a page load animation after splash screen or if language already selected
    if (!showSplash) {
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showSplash]);
  
  const handleFormChange = (formType: FormType) => {
    setCurrentForm(formType);
  };
  
  const handleLanguageSelect = (language: 'fr' | 'nl' | 'en') => {
    localStorage.setItem('preferredLanguage', language);
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
                  Bienvenue sur la plateforme officielle d'inscription de la RWDM Academy. 
                  Veuillez sélectionner le type de formulaire que vous souhaitez compléter.
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
            
            <FormWrapper formType={currentForm} />
          </main>
          
          <Footer />
          
          <Toaster />
        </>
      )}
    </div>
  );
};

export default Index;
