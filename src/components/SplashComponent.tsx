import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const style = document.createElement("style");
style.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
`;
document.head.appendChild(style);
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
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
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

          {/* "A legend never dies" uniquement dans le splashscreen */}
          <motion.p
            className="text-gray-600 text-3xl" // Augmenter la taille du texte
            style={{ fontFamily: "'Dancing Script', cursive" }} // Appliquer la police manuscrite
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            A legend never <span style={{ color: "red" }}>dies</span>
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
              <div className="p-5 flex justify-center">
                <motion.div
                  className="h-24 w-24 rounded-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <img src="/logo.png" alt="RWDM Academy Logo" width="55" />
                </motion.div>
              </div>
            </div>

            <CardContent className="p-6 pt-0">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p className="text-2xl font-bold text-rwdm-blue">
                  Sélectionnez votre langue
                </p>
                <p className="text-xl text-gray-600">Selecteer uw taal</p>
                <p className="text-xl text-gray-600">Select your language</p>
              </motion.div>

              {/* Boutons de sélection de langue */}
              <motion.div
                className="grid grid-cols-1 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Button
                  onClick={() => onLanguageSelect("fr")}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  className="bg-gray-300 text-black hover:bg-red-600 hover:text-white text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Français
                </Button>
                <Button
                  onClick={() => onLanguageSelect("nl")}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  className="bg-gray-300 text-black hover:bg-red-600 hover:text-white text-lg py-6 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                  size="lg"
                >
                  Nederlands
                </Button>
                <Button
                  onClick={() => onLanguageSelect("en")}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
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
