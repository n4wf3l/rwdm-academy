// src/components/settings/GeneralSettings.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { motion } from "framer-motion";

type Lang = "FR" | "NL" | "EN";

interface Props {
  language: Lang;
  siteColor1: string;
  setSiteColor1: React.Dispatch<React.SetStateAction<string>>;
  siteColor2: string;
  setSiteColor2: React.Dispatch<React.SetStateAction<string>>;
  logo: string;
  setLogo: React.Dispatch<React.SetStateAction<string>>;
  clubName: Record<Lang, string>;
  setClubName: React.Dispatch<React.SetStateAction<Record<Lang, string>>>;
  clubAddress: Record<Lang, string>;
  setClubAddress: React.Dispatch<React.SetStateAction<Record<Lang, string>>>;
  postalCode: string;
  setPostalCode: React.Dispatch<React.SetStateAction<string>>;
  commune: Record<Lang, string>;
  setCommune: React.Dispatch<React.SetStateAction<Record<Lang, string>>>;
  country: Record<Lang, string>;
  setCountry: React.Dispatch<React.SetStateAction<Record<Lang, string>>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  facebookUrl: string;
  setFacebookUrl: React.Dispatch<React.SetStateAction<string>>;
  instagramUrl: string;
  setInstagramUrl: React.Dispatch<React.SetStateAction<string>>;
}

/* ---------- helpers identiques à AboutSettings ---------- */
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 Mo

const checkImageSize = (file: File): boolean => {
  const sizeMb = file.size / 1024 / 1024;
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error(
      `📦 L’image est trop lourde (${sizeMb.toFixed(
        2
      )} Mo) – max autorisé : 1 Mo`
    );
    return false;
  }
  return true;
};

const deleteOldImage = async (filePath: string) => {
  if (!filePath.startsWith("/uploads/")) return; // sécurité: on supprime que des vrais uploads

  try {
    await axios.delete(`http://localhost:5000/api/upload/image`, {
      data: { filePath }, // on envoie l'ancien chemin
    });
    console.log("✅ Ancienne image supprimée");
  } catch (err) {
    console.error(
      "❌ Erreur lors de la suppression de l'ancienne image :",
      err
    );
  }
};

const uploadImageFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/upload/image",
      formData
    ); // { filePath: "/uploads/xxxx.png" }
    return data.filePath;
  } catch (err) {
    toast.error("❌ Erreur lors de l’upload du logo");
    return null;
  }
};
/* -------------------------------------------------------- */

const GeneralSettings: React.FC<Props> = ({
  language,
  siteColor1,
  setSiteColor1,
  siteColor2,
  setSiteColor2,
  logo,
  setLogo,
  clubName,
  setClubName,
  clubAddress,
  setClubAddress,
  postalCode,
  setPostalCode,
  commune,
  setCommune,
  country,
  setCountry,
  email,
  setEmail,
  facebookUrl,
  setFacebookUrl,
  instagramUrl,
  setInstagramUrl,
}) => {
  const [fileName, setFileName] = useState("");
  /* -------------------- RENDER -------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Identité du site */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Identité du site</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choisissez les couleurs officielles de votre club.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Couleurs */}
            <div className="flex flex-col md:flex-row gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  Couleur 1 du site
                </p>
                <Input
                  type="color"
                  value={siteColor1}
                  onChange={(e) => setSiteColor1(e.target.value)}
                  className="h-10 p-1 rounded-md border transition-all duration-200"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  Couleur 2 du site
                </p>
                <Input
                  type="color"
                  value={siteColor2}
                  onChange={(e) => setSiteColor2(e.target.value)}
                  className="h-10 p-1 rounded-md border transition-all duration-200"
                />
              </motion.div>
            </div>

            {/* Logo + nom du club */}
            <div className="flex flex-col md:flex-row gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  Logo (fichier)
                </p>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFileName(file.name);
                      if (!checkImageSize(file)) {
                        e.target.value = "";
                        return;
                      }
                      const filePath = await uploadImageFile(file);
                      if (filePath) {
                        setLogo(filePath);
                        toast.success("Logo uploadé avec succès !");
                      }
                    }}
                  />
                  {fileName && (
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {fileName}
                    </p>
                  )}
                </div>
                {logo && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center mt-4"
                  >
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-20 object-contain transition-all duration-200 rounded"
                    />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 relative"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  Nom du club ({language})
                </p>
                <Input
                  value={clubName[language]}
                  onChange={(e) =>
                    setClubName({ ...clubName, [language]: e.target.value })
                  }
                  className="pr-10 rounded-md border p-2 transition-all duration-200"
                />
                {clubName[language] && (
                  <button
                    type="button"
                    onClick={() => setClubName({ ...clubName, [language]: "" })}
                    className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 transition"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Coordonnées du club */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées du club</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Remplissez les informations d’adresse et de localisation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block font-semibold mb-1">
                Adresse du club ({language})
              </label>
              <Input
                value={clubAddress[language]}
                onChange={(e) =>
                  setClubAddress({ ...clubAddress, [language]: e.target.value })
                }
                className="rounded-md border p-2 transition-all duration-200"
              />
            </motion.div>

            <div className="flex space-x-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-1/4"
              >
                <label className="block font-semibold mb-1">Code postal</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="rounded-md border p-2 text-sm transition-all duration-200"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <label className="block font-semibold mb-1">
                  Commune ({language})
                </label>
                <Input
                  value={commune[language]}
                  onChange={(e) =>
                    setCommune({ ...commune, [language]: e.target.value })
                  }
                  className="rounded-md border p-2 transition-all duration-200"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block font-semibold mb-1">
                Pays ({language})
              </label>
              <Input
                value={country[language]}
                onChange={(e) =>
                  setCountry({ ...country, [language]: e.target.value })
                }
                className="rounded-md border p-2 transition-all duration-200"
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact & réseaux sociaux */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact & réseaux sociaux</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ces informations sont affichées publiquement sur le site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block font-semibold mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border p-2 transition-all duration-200"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block font-semibold mb-1">URL Facebook</label>
              <Input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="rounded-md border p-2 transition-all duration-200"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block font-semibold mb-1">URL Instagram</label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="rounded-md border p-2 transition-all duration-200"
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GeneralSettings;
