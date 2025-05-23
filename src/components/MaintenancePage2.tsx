import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MaintenancePage2Props {
  formType: "registration" | "selectionTests" | "accidentReport" | "waiver";
}

const MaintenancePage2: React.FC<MaintenancePage2Props> = ({ formType }) => {
  const { t, lang } = useTranslation();
  const [maintenanceMessages, setMaintenanceMessages] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    // Récupérer les messages de maintenance du serveur
    fetch("http://localhost:5000/api/form-maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMaintenanceMessages(data.messages);
        }
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des messages de maintenance:",
          error
        );
      });
  }, [formType]);

  // Récupérer le message dans la langue courante ou par défaut en français
  const getMessage = () => {
    if (
      maintenanceMessages[formType] &&
      maintenanceMessages[formType][lang.toUpperCase()]
    ) {
      return maintenanceMessages[formType][lang.toUpperCase()];
    } else if (
      maintenanceMessages[formType] &&
      maintenanceMessages[formType]["FR"]
    ) {
      return maintenanceMessages[formType]["FR"];
    } else {
      return getDefaultMessage();
    }
  };

  // Titre en fonction du type de formulaire
  const getTitleByFormType = () => {
    switch (formType) {
      case "registration":
        return t("academy_registration");
      case "selectionTests":
        return t("selection_tests");
      case "accidentReport":
        return t("accident_report");
      case "waiver":
        return t("liability_waiver");
      default:
        return t("form");
    }
  };

  // Message par défaut si aucun message personnalisé n'est défini
  const getDefaultMessage = () => {
    switch (formType) {
      case "registration":
        return t("maintenance.default_message_registration");
      case "selectionTests":
        return t("maintenance.default_message_selection");
      case "accidentReport":
        return t("maintenance.default_message_accident");
      case "waiver":
        return t("maintenance.default_message_waiver");
      default:
        return t("maintenance.default_message");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-lg bg-white dark:bg-gray-900">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getTitleByFormType()}
          </h2>

          <div className="text-gray-600 dark:text-gray-300 space-y-2">
            <div dangerouslySetInnerHTML={{ __html: getMessage() }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("maintenance_message")}
          </p>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mt-4"
          >
            {t("contact")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MaintenancePage2;
