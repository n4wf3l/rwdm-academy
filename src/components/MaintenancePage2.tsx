import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Settings, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MaintenancePage2Props {
  formType: "registration" | "selectionTests" | "accidentReport" | "waiver";
}

const MaintenancePage2: React.FC<MaintenancePage2Props> = ({ formType }) => {
  const { t } = useTranslation();

  const getFormTitle = () => {
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
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto my-8"
    >
      <Card className="border-2 border-red-600">
        <CardContent className="pt-6 pb-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Settings className="w-12 h-12 text-red-700 animate-spin-slow" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getFormTitle()}
          </h2>

          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-700" />
            <p className="text-lg font-medium text-red-700">
              {t("maintenance_active")}
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {t("maintenance_message")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MaintenancePage2;
