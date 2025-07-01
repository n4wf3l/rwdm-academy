import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Edit, Save, X } from "lucide-react";
import axios from "axios"; // Assurez-vous d'installer axios si ce n'est pas déjà fait
import { useToast } from "@/components/ui/use-toast";

const DatabaseUsageChart = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // État pour les statistiques de la base de données
  const [dbStats, setDbStats] = useState({
    completed: { count: 0, sizeInMo: 0, percentage: 10 },
    pending: { count: 0, sizeInMo: 0, percentage: 5 },
    appointments: { count: 0, sizeInMo: 0, percentage: 8 },
    total: { count: 0, sizeInMo: 0 },
  });

  // État pour les informations d'hébergement
  const [hostInfo, setHostInfo] = useState({
    name: "En chargement...",
    storage: 0,
  });
  const [userRole, setUserRole] = useState<string>("");
  // État pour le mode d'édition
  const [isEditing, setIsEditing] = useState(false);

  // États temporaires pour l'édition
  const [tempHostName, setTempHostName] = useState(hostInfo.name);
  const [tempStorage, setTempStorage] = useState(hostInfo.storage);

  // État pour le chargement
  const [isLoading, setIsLoading] = useState(true);
  // État pour les erreurs
  const [error, setError] = useState("");

  // Charger les données de l'hébergeur et les statistiques au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Récupérer les paramètres de stockage
        const storageResponse = await fetch(
          "https://daringbrusselsacademy.be/node/api/storage-settings",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!storageResponse.ok) {
          throw new Error(`Erreur HTTP: ${storageResponse.status}`);
        }

        const storageData = await storageResponse.json();
        setHostInfo({
          name: storageData.provider_name,
          storage: storageData.total_capacity,
        });
        setTempHostName(storageData.provider_name);
        setTempStorage(storageData.total_capacity);

        // Récupérer les statistiques de la base de données
        const statsResponse = await fetch(
          "https://daringbrusselsacademy.be/node/api/database-stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!statsResponse.ok) {
          throw new Error(`Erreur HTTP: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        setDbStats(statsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les informations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer la sauvegarde des modifications
  const handleSave = async () => {
    try {
      const response = await fetch(
        "https://daringbrusselsacademy.be/node/api/storage-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            total_capacity: tempStorage,
            provider_name: tempHostName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setHostInfo({
        name: tempHostName,
        storage: tempStorage,
      });
      setIsEditing(false);

      // Afficher le message toast de succès
      toast({
        title: t("database.settings_updated"),
        description: t("database.settings_updated_desc"),
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError("Échec de la mise à jour des informations d'hébergement");

      // Toast d'erreur
      toast({
        title: t("database.settings_error"),
        description: t("database.settings_error_desc"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(
          "https://daringbrusselsacademy.be/node/api/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok)
          throw new Error("Impossible de récupérer l'utilisateur");

        const userData = await response.json();
        setUserRole(userData.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      }
    };

    fetchUserRole();
  }, []);
  // Gérer l'annulation des modifications
  const handleCancel = () => {
    setTempHostName(hostInfo.name);
    setTempStorage(hostInfo.storage);
    setIsEditing(false);
  };

  // Utiliser la valeur dynamique pour le stockage total
  const totalStorage = hostInfo.storage;

  // Modifier la logique de calcul des pourcentages

  // Structure de données pour les sections avec les données réelles
  const sections = [
    {
      id: "pending",
      name: t("database.pending_requests"),
      percentage:
        Math.round((dbStats.pending.sizeInMo / totalStorage) * 100) || 0,
      color: "rgb(220, 38, 38)", // rouge-600
      hoverColor: "rgb(185, 28, 28)", // rouge-700
      mo: dbStats.pending.sizeInMo,
      count: dbStats.pending.count,
    },
    {
      id: "completed",
      name: t("database.completed_requests"),
      percentage:
        Math.round((dbStats.completed.sizeInMo / totalStorage) * 100) || 0,
      color: "rgb(30, 64, 175)", // bleu-800
      hoverColor: "rgb(30, 58, 138)", // bleu-900
      mo: dbStats.completed.sizeInMo,
      count: dbStats.completed.count,
    },
    {
      id: "appointments",
      name: t("database.appointments"),
      percentage:
        Math.round((dbStats.appointments.sizeInMo / totalStorage) * 100) || 0,
      color: "rgb(37, 99, 235)", // bleu-600
      hoverColor: "rgb(29, 78, 216)", // bleu-700
      mo: dbStats.appointments.sizeInMo,
      count: dbStats.appointments.count,
    },
  ];

  // Calcul de l'espace utilisé et restant par rapport à l'espace total alloué
  const usedSize = dbStats.total.sizeInMo;
  const usedPercentage = Math.round((usedSize / totalStorage) * 100) || 0;
  const remainingPercentage = 100 - usedPercentage;
  const remainingSize =
    totalStorage - usedSize > 0 ? totalStorage - usedSize : 0;

  // Convertir les pourcentages en Mo
  const getMoFromPercentage = (percentage: number) => {
    return (percentage / 100) * totalStorage;
  };

  // Calculer les positions cumulatives pour le positionnement des sections
  let cumulativePosition = 0;
  const sectionsWithPosition = sections.map((section) => {
    const position = cumulativePosition;
    cumulativePosition += section.percentage;
    return {
      ...section,
      position,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Première Card existante */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-rwdm-blue dark:text-blue-400">
            {t("database.usage_title")}
          </CardTitle>
          <CardDescription>
            {t("database.total_storage")}: {totalStorage}{" "}
            {t("database.megabytes")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Chart container with dynamic hover effects */}
              <div className="relative h-16 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                {/* Animated sections */}
                {sectionsWithPosition.map((section) => (
                  <motion.div
                    key={section.id}
                    initial={{ width: 0 }}
                    animate={{ width: `${section.percentage}%` }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 0.2 + section.position / 100,
                    }}
                    className="absolute h-full flex items-center justify-center cursor-pointer"
                    style={{
                      left: `${section.position}%`,
                      backgroundColor:
                        hoveredSection === section.id
                          ? section.hoverColor
                          : section.color,
                      zIndex: 3,
                    }}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <motion.span
                      className="text-white font-bold text-xs md:text-sm relative z-[4]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 + section.position / 100 }}
                    >
                      {section.percentage}%
                    </motion.span>

                    <AnimatePresence>
                      {hoveredSection === section.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: -40, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md shadow-lg text-xs whitespace-nowrap"
                          style={{
                            zIndex: 100,
                            pointerEvents: "none",
                            top: "-50px",
                            left: section.id === "pending" ? "0px" : "50%",
                            transform:
                              section.id === "pending"
                                ? "none"
                                : "translateX(-50%)",
                          }}
                        >
                          <div className="font-medium">{section.name}</div>
                          <div className="flex justify-between gap-3">
                            <span>
                              {section.mo.toFixed(1)} {t("database.megabytes")}
                            </span>
                            <span>({section.percentage}%)</span>
                          </div>
                          <div
                            className="absolute bottom-[-4px] rotate-45 w-2 h-2 bg-white dark:bg-gray-900"
                            style={{
                              left: section.id === "pending" ? "10px" : "50%",
                              transform:
                                section.id === "pending"
                                  ? "none"
                                  : "translateX(-50%)",
                            }}
                          ></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Remaining space section */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${remainingPercentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                  className="absolute h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${usedPercentage}%`,
                    zIndex: 1,
                  }}
                  onMouseEnter={() => setHoveredSection("remaining")}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <motion.span
                    className="text-gray-600 dark:text-gray-300 font-medium text-xs md:text-sm relative z-[2]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    {remainingPercentage}%
                  </motion.span>

                  <AnimatePresence>
                    {hoveredSection === "remaining" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="fixed px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md shadow-lg text-xs whitespace-nowrap"
                        style={{
                          zIndex: 100,
                          pointerEvents: "none",
                        }}
                      >
                        <div className="font-medium">
                          {t("database.free_space")}
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>
                            {getMoFromPercentage(remainingPercentage).toFixed(
                              1
                            )}{" "}
                            {t("database.megabytes")}
                          </span>
                          <span>({remainingPercentage}%)</span>
                        </div>
                        <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-900"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Legend with hover effects matching the chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionsWithPosition.map((section) => (
                  <motion.div
                    key={`legend-${section.id}`}
                    className="flex items-center"
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-sm mr-2"
                      animate={{
                        backgroundColor:
                          hoveredSection === section.id
                            ? section.hoverColor
                            : section.color,
                        scale: hoveredSection === section.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    ></motion.div>
                    <span
                      className={`text-sm ${
                        hoveredSection === section.id ? "font-medium" : ""
                      }`}
                    >
                      {section.name}: {section.mo.toFixed(1)}{" "}
                      {t("database.megabytes")} ({section.count} {t("items")})
                    </span>
                  </motion.div>
                ))}

                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setHoveredSection("remaining")}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <motion.div
                    className="w-4 h-4 rounded-sm mr-2 bg-gray-200 dark:bg-gray-700"
                    animate={{
                      backgroundColor:
                        hoveredSection === "remaining"
                          ? "rgb(209, 213, 219)"
                          : "rgb(229, 231, 235)",
                      scale: hoveredSection === "remaining" ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  ></motion.div>
                  <span
                    className={`text-sm ${
                      hoveredSection === "remaining" ? "font-medium" : ""
                    }`}
                  >
                    {t("database.free_space")}: {remainingSize.toFixed(1)}{" "}
                    {t("database.megabytes")} ({remainingPercentage}%)
                  </span>
                </motion.div>
              </div>

              {/* Indicateur d'utilisation actuel avec animation */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>
                    {t("database.usage_label")}: {usedPercentage}%
                  </span>
                  <span>{t("database.total_capacity")}: 100%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-rwdm-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                  ></motion.div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("database.chart_description")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {["owner", "superadmin"].includes(userRole) && (
        <Card className="mt-4 overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-rwdm-blue dark:text-blue-400">
                {t("database.host_info")}
              </CardTitle>
              <CardDescription>{t("database.hosting_details")}</CardDescription>
            </div>

            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <Save size={16} />
                  {t("save")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-1"
                >
                  <X size={16} />
                  {t("cancel")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Edit size={16} />
                {t("edit")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-3">
                <div className="animate-pulse">Chargement...</div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-3">{error}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {t("database.host_name")}:
                  </span>
                  {isEditing ? (
                    <Input
                      value={tempHostName}
                      onChange={(e) => setTempHostName(e.target.value)}
                      className="max-w-[200px]"
                    />
                  ) : (
                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                      {hostInfo.name || "Non défini"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {t("database.allocated_storage")}:
                  </span>
                  {isEditing ? (
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={tempStorage}
                        onChange={(e) => setTempStorage(Number(e.target.value))}
                        className="max-w-[100px] mr-2"
                      />
                      <span>{t("database.megabytes")}</span>
                    </div>
                  ) : (
                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                      {hostInfo.storage || 0} {t("database.megabytes")}
                    </span>
                  )}
                </div>
                {/* Affichage du timestamp de dernière mise à jour si disponible */}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default DatabaseUsageChart;
