import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      {/* Horaires d'ouverture */}
      <Card>
        <CardHeader className="relative">
          <CardTitle>Heures d'ouverture</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Si l'heure d'ouverture et de fermeture sont toutes deux à{" "}
            <strong>00:00</strong>, le jour est considéré comme{" "}
            <strong>fermé</strong>.
          </p>

          {/* Légende en haut à droite */}
          <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
              Ouvert
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-200 border border-red-400"></div>
              Fermé
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full flex justify-center">
            <div className="space-y-4 w-full md:w-2/3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
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
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infos entreprise */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ces informations seront affichées publiquement sur la page{" "}
            <strong>Contact</strong> du site.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nom de compte</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Numéro de TVA</label>
            <Input
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Numéro d'entreprise
            </label>
            <Input
              value={companyNumber}
              onChange={(e) => setCompanyNumber(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSettings;
