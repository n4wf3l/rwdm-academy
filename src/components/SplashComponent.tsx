
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SplashComponentProps {
  onLanguageSelect: (language: 'fr' | 'nl' | 'en') => void;
}

const SplashComponent: React.FC<SplashComponentProps> = ({ onLanguageSelect }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Show language selector after initial animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      {!animationComplete ? (
        // Initial splash animation
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.div 
            className="h-40 w-40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <img src="/logo.png" alt="RWDM Academy Logo" width="80px"/>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-rwdm-blue mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            RWDM Academy
          </motion.h1>
          <motion.p 
            className="text-gray-600"
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
          className="max-w-md w-full"
        >
          <Card className="bg-white shadow-xl border-gray-100">
            <div className="p-5 flex justify-center">
              <motion.div 
                className="h-24 w-24 rounded-full flex items-center justify-center mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <img src="/logo.png" alt="RWDM Academy Logo" width="55" />
              </motion.div>
            </div>
            
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold text-rwdm-blue text-center mb-6 flex items-center justify-center gap-2">
                <Globe className="h-5 w-5" /> 
                <span>Sélectionnez votre langue</span>
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => onLanguageSelect('fr')}
                  className="bg-rwdm-blue text-white hover:bg-rwdm-blue/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Français
                </Button>

                <Button 
                  onClick={() => onLanguageSelect('nl')}
                  className="bg-rwdm-blue text-white hover:bg-rwdm-blue/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Nederlands
                </Button>
                
                <Button 
                  onClick={() => onLanguageSelect('en')}
                  className="bg-rwdm-blue text-white hover:bg-rwdm-blue/90 text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  English
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SplashComponent;
