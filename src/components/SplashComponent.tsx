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
  const [clubName, setClubName] = useState<Record<string, string>>({
    FR: "Daring Brussels Academy", // Valeur par défaut
    NL: "Daring Brussels Academy",
    EN: "Daring Brussels Academy",
  });
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png"); // Valeur par défaut
  const currentLang = localStorage.getItem("language")?.toUpperCase() || "FR";

  // Récupérer le logo et le nom du club dès le chargement du composant
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiBase =
          process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

        // 1. Récupérer les paramètres (logo + nom du club)
        const res = await fetch(`${apiBase}/api/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        // 2. Mettre à jour le nom du club
        if (data.general?.clubName) {
          setClubName(data.general.clubName);
        }

        // 3. Récupérer le logo en Base64
        if (data.general?.logo && data.general.logo.startsWith("/uploads/")) {
          try {
            const imageResponse = await fetch(
              `${apiBase}/api/file-as-base64?path=${encodeURIComponent(
                data.general.logo
              )}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (imageResponse.ok) {
              const base64Data = await imageResponse.text();
              setLogoUrl(`data:image/png;base64,${base64Data}`);
              console.log(
                "✅ SplashComponent: Logo chargé avec succès en Base64"
              );
            }
          } catch (err) {
            console.error(
              "❌ Erreur lors du chargement du logo en Base64:",
              err
            );
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      }
    };

    fetchSettings();
  }, []);

  // Show language selector after initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Nom du club à afficher (avec fallback)
  const displayedClubName =
    clubName[currentLang as "FR" | "NL" | "EN"] || "Daring Brussels Academy";

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
          {/* Logo Animation - Utilise logoUrl récupéré depuis la BD */}
          <motion.div
            className="h-40 w-40 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.img
              key={logoUrl} // Pour refresh l'animation si le logo change
              src={logoUrl}
              alt={`${displayedClubName} Logo`}
              width="80px"
              className="h-full w-auto object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Texte Animation avec nom du club dynamique */}
          <motion.h1
            className="text-4xl font-bold text-rwdm-blue mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {displayedClubName}
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
            className="text-gray-600 text-5xl mt-4"
            style={{ fontFamily: "'Dancing Script', cursive" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            A legend never <span style={{ color: "red" }}>dies</span>
          </motion.p>
        </motion.div>
      ) : (
        // Language selector - Utilise également logoUrl récupéré depuis la BD
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white shadow-xl border-gray-100">
            <div className="p-5 flex justify-center">
              <motion.div
                className="h-24 w-24 rounded-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <motion.img
                  key={`select-${logoUrl}`} // Clé unique pour éviter les problèmes de rendu
                  src={logoUrl}
                  alt={`${displayedClubName} Logo`}
                  width="55"
                  className="h-full w-auto object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
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

              {/* Pas de changement dans les boutons de sélection de langue */}
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
