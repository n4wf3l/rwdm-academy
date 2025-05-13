// components/graphics/ModalPlayers.tsx
import React, { useState, useMemo, useEffect } from "react";
import { X, Users, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ModalPlayersProps {
  open: boolean;
  title: string;
  loading: boolean;
  playersByCat: Record<string, string[]>;
  onClose: () => void;
}

const ModalPlayers: React.FC<ModalPlayersProps> = ({
  open,
  title,
  loading,
  playersByCat,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Bloquer le scroll en arrière-plan
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filteredByCat = useMemo(() => {
    if (!searchTerm.trim()) return playersByCat;
    const lower = searchTerm.toLowerCase();
    return Object.fromEntries(
      Object.entries(playersByCat).map(([cat, names]) => [
        cat,
        names.filter((n) => n.toLowerCase().includes(lower)),
      ])
    );
  }, [searchTerm, playersByCat]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-6 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-4xl p-6 relative"
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="max-h-[80vh] flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{title}</CardTitle>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={onClose}
                  >
                    <X size={24} />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="overflow-y-auto">
                {/* Recherche */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher un joueur…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        loop: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Loader className="w-8 h-8 text-gray-500" />
                    </motion.div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(filteredByCat).map(([cat, names]) => (
                      <div key={cat}>
                        <h2 className="text-lg font-semibold flex items-center mb-2">
                          <Users className="w-5 h-5 mr-2 text-gray-600" />
                          {cat}
                        </h2>

                        {names.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {names.map((n, i) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">
                            Aucun joueur trouvé dans cette catégorie.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalPlayers;
