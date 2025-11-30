import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Mail, Home, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-links-modal"
          onClick={onClose}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ❌ Croix toujours tout en haut à droite de l'écran */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white hover:text-rwdm-red transition z-[10000]"
            aria-label="Fermer"
          >
            <X size={30} />
          </button>

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-10 text-white text-[22px] font-light tracking-wider w-full px-8"
          >
            {[
              { to: "/", label: t("home"), icon: <Home size={22} /> },
              { to: "/about", label: t("about"), icon: <Info size={22} /> },
              {
                to: "/contact",
                label: t("contact"),
                icon: <Mail size={22} />,
              },
            ].map(({ to, label, icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="relative flex items-center justify-center gap-3"
                >
                  {icon}
                  <span>{label}</span>

                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to right, white 0%, white 50%, red 50%, red 100%)",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;