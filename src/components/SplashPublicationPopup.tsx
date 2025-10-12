import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplashPublicationService } from "@/lib/splash-publication";
import { ActiveSplashPublicationResponse } from "@/types";
import { API_BASE } from "@/lib/api-config";

interface SplashPublicationPopupProps {
  onClose: () => void;
}

const SplashPublicationPopup: React.FC<SplashPublicationPopupProps> = ({
  onClose,
}) => {
  const [publication, setPublication] = useState<ActiveSplashPublicationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndShowPublication = async () => {
      try {
        const activePublication = await SplashPublicationService.getActivePublication();

        if (activePublication && typeof activePublication === 'object' && 'active' in activePublication && activePublication.active === false) {
          // No active publication
          onClose();
          return;
        }

        // Check if user has already seen this version
        const seenKey = 'splashPubSeen:v1';
        const seenData = localStorage.getItem(seenKey);

        if (seenData) {
          try {
            const parsed = JSON.parse(seenData);
            // Check if the publication ID and updatedAt match
            if (
              activePublication &&
              typeof activePublication === 'object' &&
              'id' in activePublication &&
              'updatedAt' in activePublication &&
              parsed.id === activePublication.id &&
              parsed.updatedAt === activePublication.updatedAt
            ) {
              // User has already seen this version
              onClose();
              return;
            }
          } catch (e) {
            // Invalid stored data, show the publication
          }
        }

        // Show the publication
        setPublication(activePublication);
      } catch (error) {
        console.error('Error loading splash publication:', error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    checkAndShowPublication();
  }, [onClose]);

  const handleClose = () => {
    // Store that user has seen this publication
    if (publication && typeof publication === 'object' && 'id' in publication && 'updatedAt' in publication) {
      const seenData = {
        id: publication.id,
        updatedAt: publication.updatedAt,
      };
      localStorage.setItem('splashPubSeen:v1', JSON.stringify(seenData));
    }

    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading || !publication || (typeof publication === 'object' && 'active' in publication && publication.active === false)) {
    return null;
  }

  const pub = publication as Exclude<ActiveSplashPublicationResponse, { active: false }>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleClose}
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
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={`${API_BASE}/api/image/${pub.image}`}
              alt={pub.title}
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
              {pub.title}
            </h2>

            {pub.description && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {pub.description}
              </p>
            )}

            {/* Optional: Add a "Learn More" button or just keep it as info */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleClose}
                className="bg-rwdm-blue hover:bg-rwdm-blue/90"
              >
                Continuer
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashPublicationPopup;