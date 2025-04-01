import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

const COOLDOWN = 10 * 60 * 1000; // 10 minutes en millisecondes

const CooldownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const lastSubmission = localStorage.getItem("lastSubmission");
      if (lastSubmission) {
        const diff = Date.now() - parseInt(lastSubmission, 10);
        const remaining = COOLDOWN - diff;
        setTimeLeft(remaining > 0 ? remaining : 0);
      } else {
        setTimeLeft(0);
      }
      // Pour déboguer : afficher la valeur du temps restant
      console.log("Cooldown timer updated, timeLeft:", timeLeft);
    };

    updateTimer(); // initialisation
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Si le cooldown est terminé, on n'affiche rien
  if (timeLeft <= 0) return null;

  // Formate le temps restant au format mm:ss
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <div className="group relative flex items-center space-x-2 bg-gray-100 p-2 rounded shadow">
        <Info size={20} className="text-green-600" />
        <span className="font-medium text-green-700">
          Veuillez attendre {formatTime(timeLeft)}
        </span>
        {/* Message d'information sur survol */}
        <div className="absolute bottom-full left-0 mb-2 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
          Par mesure de sécurité, il faut attendre 10 minutes avant de renvoyer
          un document.
        </div>
      </div>
    </div>
  );
};

export default CooldownTimer;
