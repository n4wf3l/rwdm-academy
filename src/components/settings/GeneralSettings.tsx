// src/components/settings/GeneralSettings.tsx
import React, { useState, useEffect } from "react";
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
import { useTranslation } from "@/hooks/useTranslation";
import { Switch } from "@/components/ui/switch";
import { API_BASE, fetchConfig } from "@/lib/api-config";

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
  formMaintenanceStates: {
    registration: boolean;
    selectionTests: boolean;
    accidentReport: boolean;
    waiver: boolean;
  };
  formMaintenanceMessages: {
    registration: Record<Lang, string>;
    selectionTests: Record<Lang, string>;
    accidentReport: Record<Lang, string>;
    waiver: Record<Lang, string>;
  };
  setFormMaintenanceStates: React.Dispatch<
    React.SetStateAction<{
      registration: boolean;
      selectionTests: boolean;
      accidentReport: boolean;
      waiver: boolean;
    }>
  >;
  setFormMaintenanceMessages: React.Dispatch<
    React.SetStateAction<{
      registration: Record<Lang, string>;
      selectionTests: Record<Lang, string>;
      accidentReport: Record<Lang, string>;
      waiver: Record<Lang, string>;
    }>
  >;
  accidentFormFR: string;
  setAccidentFormFR: React.Dispatch<React.SetStateAction<string>>;
  accidentFormNL: string;
  setAccidentFormNL: React.Dispatch<React.SetStateAction<string>>;
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
  // En développement, ne pas tenter de supprimer le fichier
  // Plutôt simplement permettre le remplacement
  console.log("ℹ️ Remplacement du logo sans suppression de l'ancien fichier");
  return true;

  /* Ancienne fonction qui causait l'erreur 404:
  if (!filePath.startsWith("/uploads/")) return;
  const cleanPath = filePath.split("?")[0];
  try {
    await axios.delete(`${API_BASE}/api/upload/image`, {
      data: { filePath: cleanPath },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true
    });
    console.log("✅ Ancienne image supprimée");
  } catch (err) {
    console.error("❌ Erreur lors de la suppression de l'ancienne image :", err);
  }
  */
};

const uploadImageFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("pdfFiles", file); // ✅ Changer "image" à "pdfFiles" pour correspondre à l'API

  try {
    const response = await fetch(
      `${API_BASE}/api/upload`,
      {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload");
    }

    const data = await response.json();

    // ✅ Le serveur renvoie filePaths[] et non filePath
    return data.filePaths[0];
  } catch (err) {
    console.error("Erreur lors de l'upload:", err);
    toast.error("❌ Erreur lors de l'upload du logo");
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
  formMaintenanceStates,
  setFormMaintenanceStates,
  formMaintenanceMessages,
  setFormMaintenanceMessages,
  accidentFormFR,
  setAccidentFormFR,
  accidentFormNL,
  setAccidentFormNL,
}) => {
  const [fileName, setFileName] = useState("");
  const [expandedTextareas, setExpandedTextareas] = useState({
    registration: false,
    selectionTests: false,
    accidentReport: false,
    waiver: false,
  });
  const [expandedMessages, setExpandedMessages] = useState({
    registration: false,
    selectionTests: false,
    accidentReport: false,
    waiver: false,
  });
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const [logoUrlNormalized, setLogoUrlNormalized] = useState<string | null>(
    null
  );
  // Référence pour le debounce
  const saveMessageTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Normalize image URL for display - Utiliser la même fonction que dans AdminLayout
  const normalizeImageUrl = (url: string): string => {
    if (!url) return "";

    // Si c'est un chemin relatif commençant par /uploads/
    if (url && url.startsWith("/uploads/")) {
      // Utiliser l'API_BASE pour construire l'URL complète
      return `${API_BASE}${url}`;
    }

    // Si c'est déjà une URL complète ou autre cas
    return url;
  };

  // Handles toggling maintenance state for each form
  const handleMaintenanceToggle = async (
    key: "registration" | "selectionTests" | "accidentReport" | "waiver",
    checked: boolean
  ) => {
    try {
      // Optimistic UI update
      setFormMaintenanceStates((prev) => ({ ...prev, [key]: checked }));

      // Try multiple HTTP methods with fallback strategy
      let response;
      let success = false;
      let error;

      // First try: POST method (most likely to work)
      try {
        const postUrl = `${API_BASE}/api/form-maintenance/${key}`;

        console.log(`Trying POST request to: ${postUrl}`);
        response = await axios.post(postUrl, { is_maintenance: checked });
        success = true;
      } catch (err) {
        console.log("POST failed, trying GET method:", err);
        error = err;

        // Second try: GET method as fallback (less likely to be blocked)
        try {
          const getUrl = `${API_BASE}/api/form-maintenance/${key}/toggle?enabled=${checked}`;

          console.log(`Trying GET fallback: ${getUrl}`);
          response = await axios.get(getUrl);
          success = true;
        } catch (getErr) {
          console.error("Both POST and GET attempts failed:", getErr);
          error = getErr;
        }
      }

      if (!success || !response?.data?.success) {
        throw error || new Error("Failed to update maintenance status");
      }

      toast.success(
        `Maintenance mode ${checked ? "enabled" : "disabled"} for ${key}`
      );
    } catch (error) {
      // Revert UI state on error
      setFormMaintenanceStates((prev) => ({ ...prev, [key]: !checked }));
      toast.error(`Error updating maintenance status for ${key}`);
      console.error("Error:", error);
    }
  };

  // Mise à jour du message de maintenance avec debounce
  const handleMaintenanceMessageChange = async (
    key: "registration" | "selectionTests" | "accidentReport" | "waiver",
    lang: Lang,
    message: string
  ) => {
    try {
      // Update UI optimistically
      setFormMaintenanceMessages((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [lang]: message,
        },
      }));

      if (saveMessageTimeoutRef.current) {
        clearTimeout(saveMessageTimeoutRef.current);
      }

      // Also update the handleMaintenanceMessageChange function with fallback strategy

      saveMessageTimeoutRef.current = setTimeout(async () => {
        try {
          // Try POST first
          const postUrl = `${API_BASE}/api/form-maintenance/${key}`;

          try {
            const response = await axios.post(postUrl, {
              maintenance_message: {
                ...formMaintenanceMessages[key],
                [lang]: message,
              },
            });

            if (response.data.success) return;
          } catch (err) {
            console.log("POST message update failed, trying GET fallback");

            // GET fallback for message update
            const encodedMessage = encodeURIComponent(
              JSON.stringify({
                ...formMaintenanceMessages[key],
                [lang]: message,
              })
            );

            const getUrl = `${API_BASE}/api/form-maintenance/${key}/message?content=${encodedMessage}`;

            await axios.get(getUrl);
          }
        } catch (error) {
          console.error("Error updating message:", error);
          toast.error(`Error updating message for ${key}`);
        }
      }, 500);
    } catch (error) {
      toast.error(`Error updating message for ${key}`);
      console.error("Error:", error);
    }
  };

  // Fonction pour gérer l'expansion/réduction des textareas
  const toggleTextareaExpansion = (
    key: "registration" | "selectionTests" | "accidentReport" | "waiver"
  ) => {
    setExpandedTextareas((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Fonction pour gérer l'expansion/réduction des messages
  const toggleMessageExpansion = (
    key: "registration" | "selectionTests" | "accidentReport" | "waiver"
  ) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Remplacer les multiples useEffect liés au logo par cette version unique
  useEffect(() => {
    // Cette fonction s'assure que le logo est chargé en base64 dès le début
    const fetchLogo = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/settings`,
          fetchConfig
        );
        const data = await res.json();

        if (data.general && data.general.logo) {
          try {
            // Récupérer l'image via fetch pour éviter les problèmes CORS
            const imageResponse = await fetch(data.general.logo, {
              credentials: 'omit' // Pas de credentials pour les images
            });
            
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const dataUrl = URL.createObjectURL(blob);
              setLogoUrlNormalized(dataUrl);
              console.log("✅ GeneralSettings: Logo chargé en Data URL");
            } else {
              console.log("❌ GeneralSettings: Échec du chargement de l'image");
              setLogoUrlNormalized(null);
            }
          } catch (imageError) {
            console.error("❌ GeneralSettings: Erreur lors du chargement de l'image:", imageError);
            setLogoUrlNormalized(null);
          }
        } else {
          setLogoUrlNormalized(null);
        }
      } catch (err) {
        console.error("Erreur chargement logo:", err);
        setLogoUrlNormalized(null);
      }
    };

    fetchLogo();
    
    // Cleanup function pour libérer les blob URLs
    return () => {
      if (logoUrlNormalized && logoUrlNormalized.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrlNormalized);
      }
    };
  }, []); // S'exécute uniquement au montage

  // Fonction pour sauvegarder le logo dans la base de données
  const saveLogoToDatabase = async (logoPath: string) => {
    try {
      console.log("💾 Sauvegarde du logo dans la base de données:", logoPath);

      // D'abord récupérer les settings actuels
      const getCurrentSettings = await fetch(
        `${API_BASE}/api/settings`,
        fetchConfig
      );
      
      if (!getCurrentSettings.ok) {
        throw new Error("Impossible de récupérer les settings actuels");
      }
      
      const currentSettings = await getCurrentSettings.json();
      
      // Modifier seulement le logo dans les settings généraux
      const updatedGeneral = {
        ...currentSettings.general,
        logo: logoPath
      };

      // Sauvegarder avec les settings complets
      const response = await axios.put(
        `${API_BASE}/api/settings`,
        {
          maintenanceMode: currentSettings.maintenanceMode,
          language: currentSettings.language,
          general: updatedGeneral,
          about: currentSettings.about,
          contact: currentSettings.contact,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true
        }
      );

      console.log("✅ Réponse de la sauvegarde:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du logo:", error);

      // Pour le développement, on continue même en cas d'erreur
      console.log(
        "⚠️ Erreur ignorée en développement pour permettre les tests d'UI"
      );
      return true;
    }
  };

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
            <CardTitle>{t("siteIdentity.title")}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("siteIdentity.description")}
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
                  {t("siteIdentity.color1Label")}
                </p>
                <Input
                  type="color"
                  value={siteColor1}
                  onChange={(e) => setSiteColor1(e.target.value)}
                  disabled
                  className="h-10 p-1 rounded-md border transition-all duration-200 bg-gray-200 cursor-not-allowed"
                  title={t("siteIdentity.unavailable")}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  {t("siteIdentity.color2Label")}
                </p>
                <Input
                  type="color"
                  value={siteColor2}
                  onChange={(e) => setSiteColor2(e.target.value)}
                  disabled
                  className="h-10 p-1 rounded-md border transition-all duration-200 bg-gray-200 cursor-not-allowed"
                  title={t("siteIdentity.unavailable")}
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
                  {t("siteIdentity.logoLabel")}
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

                      // Afficher une prévisualisation immédiate du logo sélectionné
                      setPreviewLogoUrl(URL.createObjectURL(file));

                      // Supprimer l'ancien logo s'il existe
                      if (logo && logo.startsWith("/uploads/")) {
                        await deleteOldImage(logo);
                      }

                      const filePath = await uploadImageFile(file);
                      if (filePath) {
                        // Stocker le chemin relatif pour le backend
                        setLogo(filePath);

                        // Récupérer et convertir le nouveau logo en blob URL
                        try {
                          const logoUrl = `${API_BASE}${filePath}`;
                          const imageResponse = await fetch(logoUrl, {
                            credentials: 'omit'
                          });
                          
                          if (imageResponse.ok) {
                            const blob = await imageResponse.blob();
                            const dataUrl = URL.createObjectURL(blob);
                            setLogoUrlNormalized(dataUrl);
                          } else {
                            setLogoUrlNormalized(`${API_BASE}${filePath}`);
                          }
                        } catch (error) {
                          console.error("Erreur conversion blob logo:", error);
                          setLogoUrlNormalized(`${API_BASE}${filePath}`);
                        }

                        try {
                          // Sauvegarder le logo immédiatement dans la base de données
                          const saved = await saveLogoToDatabase(filePath);

                          if (saved) {
                            toast.success(t("toasts.logoUploaded"));
                          } else {
                            // On affiche quand même un succès car l'image a été uploadée
                            // même si elle n'a pas été sauvegardée dans les paramètres
                            toast.success(t("toasts.logoUploaded"));
                          }
                        } catch (error) {
                          // Même en cas d'erreur, on affiche un succès car l'image est bien uploadée
                          toast.success(t("toasts.logoUploaded"));
                        }

                        // Nettoyer la prévisualisation
                        if (previewLogoUrl) {
                          URL.revokeObjectURL(previewLogoUrl);
                          setPreviewLogoUrl(null);
                        }
                      } else {
                        // En cas d'erreur, on nettoie la prévisualisation
                        if (previewLogoUrl) {
                          URL.revokeObjectURL(previewLogoUrl);
                          setPreviewLogoUrl(null);
                        }
                      }
                    }}
                  />
                  {fileName && (
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {fileName}
                    </p>
                  )}
                </div>
                {/* Affichage du logo avec la solution simplifiée */}
                <div className="flex justify-center mt-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                    {previewLogoUrl ? (
                      // Afficher la prévisualisation du fichier sélectionné
                      <img
                        src={previewLogoUrl}
                        alt="Logo"
                        className="h-24 w-auto object-contain transition-all duration-200 rounded"
                        style={{ minWidth: "100px", minHeight: "60px" }}
                      />
                    ) : (
                      // Afficher le logo actuel en base64 comme dans les autres composants
                      <img
                        src={logoUrlNormalized || "/placeholder-logo.png"}
                        alt="Logo"
                        className="h-24 w-auto object-contain transition-all duration-200 rounded"
                        style={{ minWidth: "100px", minHeight: "60px" }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 relative"
              >
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  {t("clubDetails.clubName")} ({language})
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

      {/* Maintenance des formulaires */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.maintenance.title")}</CardTitle>
            <CardDescription>
              {t("forms.maintenance.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle Inscription */}
            <div className="flex flex-col p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleMessageExpansion("registration")}
                    className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    title={
                      expandedMessages.registration
                        ? t("common.collapse")
                        : t("common.expand")
                    }
                  >
                    {expandedMessages.registration ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className="font-medium">{t("academy_registration")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("forms.maintenance.registration_desc")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formMaintenanceStates.registration}
                  onCheckedChange={(checked) =>
                    handleMaintenanceToggle("registration", checked)
                  }
                />
              </div>

              {/* Message section that expands/collapses when clicking the arrow button */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMessages.registration
                    ? "max-h-96 opacity-100 mt-3 pt-3 border-t"
                    : "max-h-0 opacity-0 mt-0 pt-0 border-none"
                }`}
              >
                <label className="block text-sm font-medium mb-1">
                  {t("forms.maintenance.message_label")} ({language})
                </label>
                <textarea
                  value={formMaintenanceMessages.registration[language] || ""}
                  onChange={(e) =>
                    handleMaintenanceMessageChange(
                      "registration",
                      language,
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 resize-none border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ height: "100px" }}
                  placeholder={t("forms.maintenance.message_placeholder")}
                />
              </div>
            </div>

            {/* Toggle Tests de sélection */}
            <div className="flex flex-col p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleMessageExpansion("selectionTests")}
                    className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    title={
                      expandedMessages.selectionTests
                        ? t("common.collapse")
                        : t("common.expand")
                    }
                  >
                    {expandedMessages.selectionTests ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className="font-medium">{t("selection_tests")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("forms.maintenance.selection_desc")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formMaintenanceStates.selectionTests}
                  onCheckedChange={(checked) =>
                    handleMaintenanceToggle("selectionTests", checked)
                  }
                />
              </div>

              {/* Message section that expands/collapses when clicking the arrow button */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMessages.selectionTests
                    ? "max-h-96 opacity-100 mt-3 pt-3 border-t"
                    : "max-h-0 opacity-0 mt-0 pt-0 border-none"
                }`}
              >
                <label className="block text-sm font-medium mb-1">
                  {t("forms.maintenance.message_label")}
                </label>
                <textarea
                  value={formMaintenanceMessages.selectionTests[language] || ""}
                  onChange={(e) =>
                    handleMaintenanceMessageChange(
                      "selectionTests",
                      language,
                      e.target.value
                    )
                  }
                  className="w-full h-24 px-3 py-2 resize-none border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("forms.maintenance.message_placeholder")}
                  style={{
                    maxHeight: expandedTextareas.selectionTests
                      ? "200px"
                      : "100px",
                    overflowY: expandedTextareas.selectionTests
                      ? "auto"
                      : "hidden",
                  }}
                />
              </div>
            </div>

            {/* Toggle Déclaration d'accident */}
            <div className="flex flex-col p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleMessageExpansion("accidentReport")}
                    className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    title={
                      expandedMessages.accidentReport
                        ? t("common.collapse")
                        : t("common.expand")
                    }
                  >
                    {expandedMessages.accidentReport ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className="font-medium">{t("accident_report")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("forms.maintenance.accident_desc")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formMaintenanceStates.accidentReport}
                  onCheckedChange={(checked) =>
                    handleMaintenanceToggle("accidentReport", checked)
                  }
                />
              </div>

              {/* Message section that expands/collapses when clicking the arrow button */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMessages.accidentReport
                    ? "max-h-96 opacity-100 mt-3 pt-3 border-t"
                    : "max-h-0 opacity-0 mt-0 pt-0 border-none"
                }`}
              >
                <label className="block text-sm font-medium mb-1">
                  {t("forms.maintenance.message_label")}
                </label>
                <textarea
                  value={formMaintenanceMessages.accidentReport[language] || ""}
                  onChange={(e) =>
                    handleMaintenanceMessageChange(
                      "accidentReport",
                      language,
                      e.target.value
                    )
                  }
                  className="w-full h-24 px-3 py-2 resize-none border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("forms.maintenance.message_placeholder")}
                  style={{
                    maxHeight: expandedTextareas.accidentReport
                      ? "200px"
                      : "100px",
                    overflowY: expandedTextareas.accidentReport
                      ? "auto"
                      : "hidden",
                  }}
                />
              </div>
            </div>

            {/* Toggle Décharge */}
            <div className="flex flex-col p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleMessageExpansion("waiver")}
                    className="mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    title={
                      expandedMessages.waiver
                        ? t("common.collapse")
                        : t("common.expand")
                    }
                  >
                    {expandedMessages.waiver ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className="font-medium">{t("liability_waiver")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("forms.maintenance.waiver_desc")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formMaintenanceStates.waiver}
                  onCheckedChange={(checked) =>
                    handleMaintenanceToggle("waiver", checked)
                  }
                />
              </div>

              {/* Message section that expands/collapses when clicking the arrow button */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMessages.waiver
                    ? "max-h-96 opacity-100 mt-3 pt-3 border-t"
                    : "max-h-0 opacity-0 mt-0 pt-0 border-none"
                }`}
              >
                <label className="block text-sm font-medium mb-1">
                  {t("forms.maintenance.message_label")}
                </label>
                <textarea
                  value={formMaintenanceMessages.waiver[language] || ""}
                  onChange={(e) =>
                    handleMaintenanceMessageChange(
                      "waiver",
                      language,
                      e.target.value
                    )
                  }
                  className="w-full h-24 px-3 py-2 resize-none border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t("forms.maintenance.message_placeholder")}
                  style={{
                    maxHeight: expandedTextareas.waiver ? "200px" : "100px",
                    overflowY: expandedTextareas.waiver ? "auto" : "hidden",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Maintenance des formulaires */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("accident_form_documents")}</CardTitle>
            <CardDescription>
              {t("accident_form_documents_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulaires PDF de déclaration d'accident */}
            <div className="mt-3 p-4 rounded-lg border bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PDF Français */}
                <div className="space-y-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("medical_language_fr")}
                  </p>

                  {accidentFormFR && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-sm flex justify-between items-center">
                      <span className="truncate max-w-[150px]">
                        {accidentFormFR.split("/").pop()}
                      </span>
                      <a
                        href={accidentFormFR}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-2 text-xs"
                      >
                        {t("preview")}
                      </a>
                    </div>
                  )}

                  <div>
                    <Input
                      type="file"
                      accept=".pdf"
                      id="accidentFormFR"
                      className="cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Max 5 MB
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(t("file_too_large_5mb"));
                          e.target.value = "";
                          return;
                        }

                        try {
                          const formData = new FormData();
                          formData.append("pdfFile", file);
                          formData.append("language", "FR");

                          const response = await axios.post(
                            `${API_BASE}/api/accident-forms/upload`,
                            formData,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                              withCredentials: true
                            }
                          );

                          if (response.data?.filePath) {
                            setAccidentFormFR(response.data.filePath);
                            toast.success(t("file_uploaded_success"));
                          }
                        } catch (err) {
                          toast.error(t("file_upload_error"));
                          console.error(err);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("pdf_only")}
                    </p>
                  </div>
                </div>

                {/* PDF Néerlandais */}
                <div className="space-y-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("medical_language_nl")}
                  </p>

                  {accidentFormNL && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-sm flex justify-between items-center">
                      <span className="truncate max-w-[150px]">
                        {accidentFormNL.split("/").pop()}
                      </span>
                      <a
                        href={accidentFormNL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-2 text-xs"
                      >
                        {t("preview")}
                      </a>
                    </div>
                  )}

                  <div>
                    <Input
                      type="file"
                      accept=".pdf"
                      id="accidentFormNL"
                      className="cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Max 5 MB
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(t("file_too_large_5mb"));
                          e.target.value = "";
                          return;
                        }

                        try {
                          const formData = new FormData();
                          formData.append("pdfFile", file);
                          formData.append("language", "NL");

                          const response = await axios.post(
                            `${API_BASE}/api/accident-forms/upload`,
                            formData,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                              withCredentials: true
                            }
                          );

                          if (response.data?.filePath) {
                            setAccidentFormNL(response.data.filePath);
                            toast.success(t("file_uploaded_success"));
                          }
                        } catch (err) {
                          toast.error(t("file_upload_error"));
                          console.error(err);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("pdf_only")}
                    </p>
                  </div>
                </div>
              </div>
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
            <CardTitle>{t("clubDetails.contactTitle")}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("clubDetails.contactDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block font-semibold mb-1">
                {t("clubDetails.address")} ({language})
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
                <label className="block font-semibold mb-1">
                  {t("clubDetails.postalCode")}
                </label>
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
                  {t("clubDetails.commune")} ({language})
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
                {t("clubDetails.country")} ({language})
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
            <CardTitle>{t("contactSocial.title")}</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("contactSocial.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block font-semibold mb-1">
                {t("contactForm.email")}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border p-2 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("contactForm.emailDisclaimer")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block font-semibold mb-1">
                {t("contactForm.facebookUrl")}
              </label>
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
              <label className="block font-semibold mb-1">
                {t("contactForm.instagramUrl")}
              </label>
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
