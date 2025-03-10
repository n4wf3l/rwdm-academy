
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const SplashScreen = () => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show language selector after splash screen animation
    const timer = setTimeout(() => {
      setShowLanguageSelector(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = (language: 'fr' | 'nl' | 'en') => {
    // Store selected language in localStorage
    localStorage.setItem('preferredLanguage', language);
    // Navigate to home page after language selection
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
            className="h-40 w-40 rounded-full bg-rwdm-red flex items-center justify-center mb-8 mx-auto shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <span className="text-white font-bold text-6xl"><img src="logo.png" alt="" /></span>
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
        // Enhanced language selector
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white/10 backdrop-blur-lg shadow-xl border-white/20">
            <div className="p-5 flex justify-center">
              <motion.div 
                className="h-24 w-24 rounded-full bg-rwdm-red flex items-center justify-center mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-white font-bold text-4xl"><img src="logo.png" alt="" /></span>
              </motion.div>
            </div>
            
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
                <Globe className="h-5 w-5" /> 
                <span>Sélectionnez votre langue</span>
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => handleLanguageSelect('fr')}
                  className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  <span className="mr-2">🇫🇷</span> Français
                </Button>
                <Button 
                  onClick={() => handleLanguageSelect('nl')}
                  className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  <span className="mr-2">🇧🇪</span> Nederlands
                </Button>
                <Button 
                  onClick={() => handleLanguageSelect('en')}
                  className="bg-white text-rwdm-blue hover:bg-white/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  <span className="mr-2">🇬🇧</span> English
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SplashScreen;
