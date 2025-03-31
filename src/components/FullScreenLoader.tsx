import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FullScreenLoaderProps {
  isLoading: boolean;
  messages?: string[];
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isLoading,
  messages,
}) => {
  const defaultMessages = [
    "Création du compte en cours...",
    "Sécurisation du compte...",
    "Finalisation...",
  ];
  const loaderMessages = messages || defaultMessages;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loaderMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, loaderMessages]);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center">
        {/* Animation circulaire */}
        <motion.div
          className="w-24 h-24 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        {/* Texte dynamique */}
        <motion.p
          className="mt-6 text-lg text-white font-medium"
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {loaderMessages[messageIndex]}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default FullScreenLoader;
