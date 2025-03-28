import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SplashComponentProps {
  onLanguageSelect: (language: "fr" | "nl" | "en") => void;
}

const SplashComponent: React.FC<SplashComponentProps> = ({
  onLanguageSelect,
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Show language selector after initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      {!animationComplete ? (
        // Initial splash animation (Fade In + Fade Out)
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          {/* Logo Animation */}
          <motion.div
            className="h-40 w-40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img src="/logo.png" alt="RWDM Academy Logo" width="80px" />
          </motion.div>

          {/* Texte Animation */}
          <motion.h1
            className="text-4xl font-bold text-rwdm-blue mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            RWDM Academy
          </motion.h1>

          <motion.p
            className="text-gray-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Bienvenue • Welkom • Welcome
          </motion.p>
        </motion.div>
      ) : (
        // Language selector (Fade-in effect)
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white shadow-xl border-gray-100">
            <div className="p-5 flex justify-center">
              <motion.div
                className="h-24 w-24 rounded-full flex items-center justify-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <img src="/logo.png" alt="RWDM Academy Logo" width="55" />
              </motion.div>
            </div>

            <CardContent className="p-6 pt-0">
              <motion.h2
                className="text-2xl font-bold text-rwdm-blue text-center mb-6 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Globe className="h-5 w-5" />
                <span>Sélectionnez votre langue</span>
              </motion.h2>

              <motion.div
                className="grid grid-cols-1 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Button
                  onClick={() => onLanguageSelect("fr")}
                  className="bg-gray-300 text-black hover:bg-red-600 hover:text-white text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Français
                </Button>

                <Button
                  onClick={() => onLanguageSelect("nl")}
                  className="bg-gray-300 text-black hover:bg-red-600 hover:text-white text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Nederlands
                </Button>

                <Button
                  onClick={() => onLanguageSelect("en")}
                  className="bg-gray-300 text-black hover:bg-red-600 hover:text-white text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  English
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SplashComponent;
