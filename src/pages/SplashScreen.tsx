
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SplashScreen = () => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Afficher le sélecteur de langue après animation du splash screen
    const timer = setTimeout(() => {
      setShowLanguageSelector(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = (language: 'fr' | 'nl' | 'en') => {
    // On pourrait stocker la langue dans localStorage ou context
    localStorage.setItem('preferredLanguage', language);
    // Naviguer vers la page d'accueil après sélection de la langue
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rwdm-blue to-rwdm-darkblue flex flex-col items-center justify-center p-4">
      {!showLanguageSelector ? (
        // Splash screen animation
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.div 
            className="h-40 w-40 rounded-full bg-rwdm-red flex items-center justify-center mb-8 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <span className="text-white font-bold text-6xl">R</span>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            RWDM Academy
          </motion.h1>
          <motion.p 
            className="text-white/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Bienvenue • Welkom • Welcome
          </motion.p>
        </motion.div>
      ) : (
        // Language selector
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Choisissez votre langue
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={() => handleLanguageSelect('fr')}
              className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6"
            >
              Français
            </Button>
            <Button 
              onClick={() => handleLanguageSelect('nl')}
              className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6"
            >
              Nederlands
            </Button>
            <Button 
              onClick={() => handleLanguageSelect('en')}
              className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6"
            >
              English
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SplashScreen;
