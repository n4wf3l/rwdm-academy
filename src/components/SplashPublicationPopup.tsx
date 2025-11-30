import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { resolveMediaUrl } from "@/lib/api-config";
import { ActiveSplashPublicationResponse } from "@/types";

// Helper function to convert image paths to URLs
const toImageUrl = (raw?: string | null) => {
  return resolveMediaUrl(raw);
};

interface SplashPublicationPopupProps {
  onClose: () => void;
  publication?: ActiveSplashPublicationResponse;
}

const SplashPublicationPopup: React.FC<SplashPublicationPopupProps> = ({
  onClose,
  publication: initialPublication,
}) => {
  const { t, lang: currentLanguage } = useTranslation();
  const [publication, setPublication] = useState<ActiveSplashPublicationResponse | null>(initialPublication || null);
  const [loading, setLoading] = useState(!initialPublication);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (initialPublication) {
      setPublication(initialPublication);
      setLoading(false);
      // Delay popup display by 1 second
      setTimeout(() => {
        setShowPopup(true);
      }, 1000);
    }
  }, [initialPublication]);

  const handleClose = () => {
    // Store the current timestamp as last check time
    const now = Date.now().toString();
    sessionStorage.setItem('splashPubLastCheck', now);

    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Removed Escape key handling to prevent easy closing
    // if (e.key === 'Escape') {
    //   handleClose();
    // }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading || !publication || !showPopup || (typeof publication === 'object' && 'active' in publication && publication.active === false)) {
    return null;
  }

  const pub = publication as Exclude<ActiveSplashPublicationResponse, { active: false }>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
        onClick={handleClose} // Keep backdrop click to close for accessibility
        role="dialog"
        aria-modal="true"
        aria-labelledby="splash-publication-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - REMOVED */}
          {/* <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button> */}

          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={toImageUrl(pub.image)}
              alt={(() => {
                const rawTitle = pub.title;
                let parsedTitle: any = rawTitle;

                if (typeof rawTitle === 'string') {
                  try {
                    parsedTitle = JSON.parse(rawTitle);
                  } catch (e) {
                    return rawTitle;
                  }
                }

                if (typeof parsedTitle === 'object' && parsedTitle) {
                  return String(parsedTitle[currentLanguage] || parsedTitle.fr || 'Publication');
                }

                return String(parsedTitle || 'Publication');
              })()}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <h2
              id="splash-publication-title"
              className="text-xl font-bold text-gray-900 dark:text-white mb-3"
            >
              {(() => {
                const rawTitle = pub.title;
                let parsedTitle: any = rawTitle;

                if (typeof rawTitle === 'string') {
                  try {
                    parsedTitle = JSON.parse(rawTitle);
                  } catch (e) {
                    return rawTitle;
                  }
                }

                if (typeof parsedTitle === 'object' && parsedTitle) {
                  return String(parsedTitle[currentLanguage] || parsedTitle.fr || 'Publication');
                }

                return String(parsedTitle || 'Publication');
              })()}
            </h2>

            {pub.description && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {(() => {
                  const rawDescription = pub.description;
                  let parsedDescription: any = rawDescription;

                  if (typeof rawDescription === 'string') {
                    try {
                    parsedDescription = JSON.parse(rawDescription);
                  } catch (e) {
                    return rawDescription;
                  }
                }

                if (typeof parsedDescription === 'object' && parsedDescription) {
                  return String(parsedDescription[currentLanguage] || parsedDescription.fr);
                }

                return parsedDescription;
              })()}
              </p>
            )}

            {/* Publication Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-rwdm-blue rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {pub.firstName && pub.lastName ? 
                      `${pub.firstName[0]}${pub.lastName[0]}`.toUpperCase() : 
                      'A'
                    }
                  </div>
                  <span>
                    {pub.firstName && pub.lastName ? 
                      `Par ${pub.firstName} ${pub.lastName}` : 
                      t("published_by_admin")
                    }
                  </span>
                </div>
                <div className="text-right">
                  <div>{new Date(pub.updatedAt).toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'nl' ? 'nl-NL' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</div>
                  <div className="text-xs opacity-75">
                    {new Date(pub.updatedAt).toLocaleTimeString(currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'nl' ? 'nl-NL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional: Add a "Learn More" button or just keep it as info */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleClose}
                className="bg-rwdm-blue hover:bg-rwdm-blue/90"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashPublicationPopup;