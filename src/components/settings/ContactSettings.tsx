import React from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const ContactSettings = ({
  accountName,
  setAccountName,
  openingHours,
  setOpeningHours,
  vatNumber,
  setVatNumber,
  companyNumber,
  setCompanyNumber,
}) => {
  const { t } = useTranslation();
  const handleTimeChange = (day, type, value) => {
    const updated = {
      ...openingHours,
      [day]: {
        ...(openingHours[day] || {}),
        [type]: value,
      },
    };
    setOpeningHours(updated);
  };
  const isClosedDay = (day: string) => {
    const open = openingHours?.[day]?.open;
    const close = openingHours?.[day]?.close;
    return open === "00:00" && close === "00:00";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Horaires d'ouverture */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="relative">
            <CardTitle>{t("openingHoursTitle")}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("openingHoursDescription")}
            </CardDescription>

            {/* Légende en haut à droite */}
            <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                {t("statusOpen")}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-200 border border-red-400" />
                {t("statusClosed")}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full flex justify-center">
              <div className="space-y-4 w-full md:w-2/3">
                {daysOfWeek.map((day) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between gap-4 md:gap-6"
                  >
                    <div className="w-24 font-medium">{day}</div>
                    <Input
                      type="time"
                      value={openingHours?.[day]?.open || ""}
                      onChange={(e) =>
                        handleTimeChange(day, "open", e.target.value)
                      }
                      className={`w-32 ${isClosedDay(day) ? "bg-red-200" : ""}`}
                    />
                    <span>→</span>
                    <Input
                      type="time"
                      value={openingHours?.[day]?.close || ""}
                      onChange={(e) =>
                        handleTimeChange(day, "close", e.target.value)
                      }
                      className={`w-32 ${isClosedDay(day) ? "bg-red-200" : ""}`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Infos entreprise */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("companyInfo.title")}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("companyInfo.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block font-semibold mb-1">
                {t("companyInfo.accountName")}
              </label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block font-semibold mb-1">
                {t("companyInfo.vatNumber")}
              </label>
              <Input
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block font-semibold mb-1">
                {t("companyInfo.companyNumber")}
              </label>
              <Input
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value)}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ContactSettings;
