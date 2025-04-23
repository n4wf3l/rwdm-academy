import React from "react";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="space-y-6">
      {/* Ligne principale avec horaires à gauche et infos entreprise à droite */}
      <div className="flex flex-col md:flex-row md:justify-evenly md:items-start md:space-x-0 space-y-8 md:space-y-0">
        {/* Horaires */}
        <div className="w-full md:w-2/3 space-y-4">
          <label className="block font-semibold mb-1">Heures d'ouverture</label>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex items-center justify-evenly space-x-2"
            >
              <div className="w-24 font-medium">{day}</div>
              <Input
                type="time"
                value={openingHours?.[day]?.open || ""}
                onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                className="w-32"
              />
              <span>→</span>
              <Input
                type="time"
                value={openingHours?.[day]?.close || ""}
                onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                className="w-32"
              />
            </div>
          ))}
        </div>

        {/* Infos entreprise */}
        <div className="w-full md:w-1/3 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nom de compte</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nr TVA</label>
            <Input
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nr d'entreprise</label>
            <Input
              value={companyNumber}
              onChange={(e) => setCompanyNumber(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSettings;
