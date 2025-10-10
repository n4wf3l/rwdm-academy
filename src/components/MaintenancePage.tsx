import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/api-config";

type Hours = { open: string; close: string };

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
type Day = (typeof daysOfWeek)[number];

export default function MaintenancePage() {
  const { t, lang } = useTranslation();
  const currentLang = lang.toUpperCase();

  const [openingHours, setOpeningHours] = useState<Record<Day, Hours>>(
    {} as Record<Day, Hours>
  );
  const [clubAddress, setClubAddress] = useState<Record<string, string>>({});
  const [commune, setCommune] = useState<Record<string, string>>({});
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState<Record<string, string>>({});

  const translateDay = (day: Day) =>
    t(`day_${day.toLowerCase()}` as keyof typeof t);

  const getLocalizedValue = (
    field: Record<string, string>,
    lang: string
  ): string => {
    return field[lang] || field["FR"] || Object.values(field)[0] || "";
  };

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/settings`)
      .then((res) => {
        const { general, contact } = res.data;
        setOpeningHours(contact.openingHours || {});
        setClubAddress(general.clubAddress || {});
        setCommune(general.commune || {});
        setPostalCode(general.postalCode || "");
        setCountry(general.country || {});
      })
      .catch((err) => {
        console.error("Erreur fetch settings dans MaintenancePage:", err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-800 p-6">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold mb-4 text-center"
      >
        {t("maintenance_title")}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg mb-6 text-center max-w-xl"
      >
        {t("maintenance_message")}
      </motion.p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Horaires – tout centré */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-red-600 " />
            <h2 className="text-2xl font-semibold">
              {t("contact_office_hours")}
            </h2>
          </div>

          <div className="flex flex-col items-center text-sm text-gray-700">
            {daysOfWeek.map((day) => {
              const times = openingHours[day];
              const isClosed =
                times?.open === "00:00" && times?.close === "00:00";
              return (
                <div key={day} className="flex justify-center gap-4 w-fit">
                  <span className="w-28 text-right">{translateDay(day)}</span>
                  <span className="font-medium w-28 text-left">
                    {isClosed
                      ? t("closed")
                      : `${times?.open ?? "--:--"} – ${
                          times?.close ?? "--:--"
                        }`}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Adresse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <MapPin className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-semibold">
              {t("contact_address_title")}
            </h2>
          </div>
          <p className="text-gray-600">
            {getLocalizedValue(clubAddress, currentLang)}
            <br />
            {postalCode} {getLocalizedValue(commune, currentLang)}
            <br />
            {getLocalizedValue(country, currentLang)}
          </p>
        </motion.div>
      </div>

      {/* Remerciement final */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-6 text-gray-600 text-center"
      >
        {t("thanks_patience")}
      </motion.p>
    </div>
  );
}
