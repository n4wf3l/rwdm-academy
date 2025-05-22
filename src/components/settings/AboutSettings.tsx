import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion as m, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const AboutSettings = ({
  playersCount,
  setPlayersCount,
  experienceYears,
  setExperienceYears,
  nationalTrophies,
  setNationalTrophies,
  youngTalents,
  setYoungTalents,
  historyDescription,
  setHistoryDescription,
  historyPhoto,
  setHistoryPhoto,
  missionDescription,
  setMissionDescription,
  missionPhoto,
  setMissionPhoto,
  approachDescription,
  setApproachDescription,
  approachPhoto,
  setApproachPhoto,
  valueTitle1,
  setValueTitle1,
  valueDesc1,
  setValueDesc1,
  valueTitle2,
  setValueTitle2,
  valueDesc2,
  setValueDesc2,
  valueTitle3,
  setValueTitle3,
  valueDesc3,
  setValueDesc3,
  language,
  academyNames1,
  setAcademyNames1,
  academyDescriptions1,
  setAcademyDescriptions1,
  academyPhotos1,
  setAcademyPhotos1,

  academyNames2,
  setAcademyNames2,
  academyDescriptions2,
  setAcademyDescriptions2,
  academyPhotos2,
  setAcademyPhotos2,

  academyNames3,
  setAcademyNames3,
  academyDescriptions3,
  setAcademyDescriptions3,
  academyPhotos3,
  setAcademyPhotos3,
}) => {
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  const { t } = useTranslation();
  const handleImageUpload = (
    file: File,
    setImage: (data: string) => void,
    resetInput: () => void
  ) => {
    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeMessage =
      file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(2)} Mo`
        : `${sizeInKb} Ko`;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`L’image (${sizeMessage}) dépasse 2 Mo`);
      resetInput();
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      toast.success(`Image chargée (${sizeMessage})`);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const checkImageSize = (file: File, maxSize: number): boolean => {
    const sizeInMb = file.size / 1024 / 1024;
    if (file.size > maxSize) {
      toast.error(
        `📦 L’image est trop lourde (${sizeInMb.toFixed(
          2
        )} Mo) – max autorisé : ${maxSize / 1024 / 1024} Mo`
      );
      return false;
    }
    return true;
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload/image",
        formData
      );
      return response.data.filePath; // ex: "/uploads/1685678923-monimage.png"
    } catch (err) {
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  // État pour stocker l'image agrandie
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const VALUE_TITLE_KEYS = {
    1: "value1Title",
    2: "value2Title",
    3: "value3Title",
  } as const;
  const VALUE_DESC_KEYS = {
    1: "value1Description",
    2: "value2Description",
    3: "value3Description",
  } as const;
  const VALUE_TITLE_PLACEHOLDERS = {
    1: "value1TitlePlaceholder",
    2: "value2TitlePlaceholder",
    3: "value3TitlePlaceholder",
  } as const;
  const VALUE_DESC_PLACEHOLDERS = {
    1: "value1DescriptionPlaceholder",
    2: "value2DescriptionPlaceholder",
    3: "value3DescriptionPlaceholder",
  } as const;

  // Définition de la modal image améliorée
  const ImageModal = ({ src, alt, onClose }) => {
    const handleModalClick = () => {
      onClose();
    };

    return (
      <m.div
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          position: "fixed",
        }}
        onClick={handleModalClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <m.img
          src={src}
          alt={alt || "Image agrandie"}
          className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </m.div>
    );
  };

  // Fonction pour ajuster automatiquement la hauteur d'un textarea
  const adjustTextareaHeight = (textarea) => {
    if (!textarea) return;

    // Réinitialiser la hauteur à auto pour obtenir la hauteur correcte
    textarea.style.height = "auto";

    // Définir la nouvelle hauteur en fonction du contenu
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Gestionnaire de changement pour les textareas
  const handleTextareaChange = (e, currentValue, setter) => {
    // Mettre à jour l'état
    setter({
      ...currentValue,
      [language]: e.target.value,
    });

    // Ajuster la hauteur
    adjustTextareaHeight(e.target);
  };

  // Ajuster la hauteur de tous les textareas après le rendu
  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach(adjustTextareaHeight);
  }, [language]); // Réajuster quand la langue change

  return (
    <m.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Statistiques du club */}
      <m.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <m.div variants={itemVariants}>
              <CardTitle>{t("clubStats.title")}</CardTitle>
            </m.div>
            <m.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("clubStats.description")}
            </m.p>
          </CardHeader>

          <CardContent>
            <m.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {[
                {
                  label: t("players_trained"),
                  value: playersCount,
                  setter: setPlayersCount,
                },
                {
                  label: t("years_experience"),
                  value: experienceYears,
                  setter: setExperienceYears,
                },
                {
                  label: t("national_trophies"),
                  value: nationalTrophies,
                  setter: setNationalTrophies,
                },
                {
                  label: t("young_talents"),
                  value: youngTalents,
                  setter: setYoungTalents,
                },
              ].map((stat, index) => (
                <m.div
                  key={stat.label}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => stat.setter(e.target.value)}
                    className="w-full text-4xl font-bold text-rwdm-blue dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none"
                  />
                </m.div>
              ))}
            </m.div>
          </CardContent>
        </Card>
      </m.div>

      {/* À propos du club */}
      <m.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <m.div variants={itemVariants}>
              <CardTitle>{t("clubAbout.title")}</CardTitle>
            </m.div>
            <m.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("clubAbout.description")}
            </m.p>
          </CardHeader>

          <CardContent>
            <m.div variants={itemVariants}>
              <Tabs defaultValue="history" className="w-full">
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="history">
                      {t("tabsHistory")}
                    </TabsTrigger>
                    <TabsTrigger value="mission">
                      {t("tabsMission")}
                    </TabsTrigger>
                    <TabsTrigger value="approach">
                      {t("tabsApproach")}
                    </TabsTrigger>
                  </TabsList>
                </m.div>

                {[
                  {
                    value: "history",
                    description: historyDescription,
                    setDescription: setHistoryDescription,
                    photo: historyPhoto,
                    setPhoto: setHistoryPhoto,
                  },
                  {
                    value: "mission",
                    description: missionDescription,
                    setDescription: setMissionDescription,
                    photo: missionPhoto,
                    setPhoto: setMissionPhoto,
                  },
                  {
                    value: "approach",
                    description: approachDescription,
                    setDescription: setApproachDescription,
                    photo: approachPhoto,
                    setPhoto: setApproachPhoto,
                  },
                ].map((tab) => (
                  <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className="space-y-6"
                  >
                    <m.div
                      className="flex flex-col md:flex-row gap-4 items-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Texte */}
                      <m.div
                        className="w-full md:w-1/2"
                        whileHover={{ scale: 1.01 }}
                      >
                        <label className="block font-semibold mb-1">
                          {t("labelDescription")} {tab.value} ({language})
                        </label>
                        <textarea
                          className="w-full border rounded p-2 resize-none overflow-hidden"
                          value={tab.description[language]}
                          onChange={(e) =>
                            handleTextareaChange(
                              e,
                              tab.description,
                              tab.setDescription
                            )
                          }
                          onFocus={(e) => adjustTextareaHeight(e.target)}
                          style={{ minHeight: "100px" }}
                        />
                      </m.div>

                      {/* Image */}
                      <m.div
                        className="w-full md:w-1/2"
                        whileHover={{ scale: 1.01 }}
                      >
                        <label className="block font-semibold mb-1">
                          {t(
                            tab.value === "history"
                              ? "photoHistoryFile"
                              : tab.value === "mission"
                              ? "photoMissionFile"
                              : "photoApproachFile"
                          )}
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          {t("maxSize")}
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!checkImageSize(file, MAX_IMAGE_SIZE)) {
                              e.target.value = "";
                              return;
                            }
                            const filePath = await uploadImageFile(file);
                            if (filePath) {
                              tab.setPhoto(filePath);
                              toast.success("Image chargée avec succès !");
                            }
                          }}
                        />
                        {tab.photo && (
                          <>
                            <m.div
                              className="flex justify-center mt-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img
                                src={tab.photo}
                                alt={`Photo ${tab.value}`}
                                className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                                onClick={() => setEnlargedPhoto(tab.photo)}
                              />
                            </m.div>
                          </>
                        )}
                      </m.div>
                    </m.div>
                  </TabsContent>
                ))}
              </Tabs>
            </m.div>
          </CardContent>
        </Card>
      </m.div>

      {/* Nos académies */}
      <m.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <m.div variants={itemVariants}>
              <CardTitle>{t("academies.title")}</CardTitle>
            </m.div>
            <m.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("academies.description")}
            </m.p>
          </CardHeader>

          <CardContent>
            <m.div variants={itemVariants}>
              <Tabs defaultValue="1" className="w-full">
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="1">{t("academies.tab1")}</TabsTrigger>
                    <TabsTrigger value="2">{t("academies.tab2")}</TabsTrigger>
                    <TabsTrigger value="3">{t("academies.tab3")}</TabsTrigger>
                  </TabsList>
                </m.div>

                {[1, 2, 3].map((num) => {
                  const name =
                    num === 1
                      ? academyNames1
                      : num === 2
                      ? academyNames2
                      : academyNames3;
                  const setName =
                    num === 1
                      ? setAcademyNames1
                      : num === 2
                      ? setAcademyNames2
                      : setAcademyNames3;
                  const description =
                    num === 1
                      ? academyDescriptions1
                      : num === 2
                      ? academyDescriptions2
                      : academyDescriptions3;
                  const setDescription =
                    num === 1
                      ? setAcademyDescriptions1
                      : num === 2
                      ? setAcademyDescriptions2
                      : setAcademyDescriptions3;
                  const photo =
                    num === 1
                      ? academyPhotos1
                      : num === 2
                      ? academyPhotos2
                      : academyPhotos3;
                  const setPhoto =
                    num === 1
                      ? setAcademyPhotos1
                      : num === 2
                      ? setAcademyPhotos2
                      : setAcademyPhotos3;

                  return (
                    <TabsContent
                      key={num}
                      value={String(num)}
                      className="space-y-6"
                    >
                      <m.div
                        className="flex flex-col md:flex-row gap-4 items-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 * num }}
                      >
                        {/* Texte */}
                        <m.div
                          className="w-full md:w-1/2 space-y-4"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div>
                            <label className="block font-semibold mb-1">
                              {t("academiesName1")}
                            </label>
                            <Input
                              value={name[language]}
                              onChange={(e) =>
                                setName({ ...name, [language]: e.target.value })
                              }
                              className="rounded-md border p-2"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">
                              {t("academiesDesc1")}
                            </label>
                            <textarea
                              className="w-full border rounded p-2 resize-none overflow-hidden"
                              value={description[language]}
                              onChange={(e) =>
                                handleTextareaChange(
                                  e,
                                  description,
                                  setDescription
                                )
                              }
                              onFocus={(e) => adjustTextareaHeight(e.target)}
                              style={{ minHeight: "100px" }}
                            />
                          </div>
                        </m.div>

                        {/* Image */}
                        <m.div
                          className="w-full md:w-1/2"
                          whileHover={{ scale: 1.01 }}
                        >
                          <label className="block font-semibold mb-1">
                            {t("academies.photoLabel")}
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            {t("maxSize")}
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (!checkImageSize(file, MAX_IMAGE_SIZE)) {
                                e.target.value = "";
                                return;
                              }

                              const filePath = await uploadImageFile(file);
                              if (filePath) {
                                setPhoto(filePath);
                                toast.success("Image chargée avec succès !");
                              }
                              e.target.value = "";
                            }}
                          />
                          {photo && (
                            <m.div
                              className="flex justify-center mt-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img
                                src={photo}
                                alt={t("academies.photoLabel")}
                                className="h-20 object-contain rounded cursor-pointer"
                                onClick={() => setEnlargedPhoto(photo)}
                              />
                            </m.div>
                          )}
                        </m.div>
                      </m.div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </m.div>
          </CardContent>
        </Card>
      </m.div>

      {/* Nos valeurs */}
      <m.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <m.div variants={itemVariants}>
              <CardTitle>{t("valuesTitle")}</CardTitle>
            </m.div>
            <m.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("valuesDescription")}
            </m.p>
          </CardHeader>

          <CardContent>
            <m.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {[
                {
                  id: 1,
                  title: valueTitle1,
                  setTitle: setValueTitle1,
                  data: valueDesc1,
                  setter: setValueDesc1,
                },
                {
                  id: 2,
                  title: valueTitle2,
                  setTitle: setValueTitle2,
                  data: valueDesc2,
                  setter: setValueDesc2,
                },
                {
                  id: 3,
                  title: valueTitle3,
                  setTitle: setValueTitle3,
                  data: valueDesc3,
                  setter: setValueDesc3,
                },
              ].map((valueObj) => (
                <m.div
                  key={valueObj.id}
                  className="p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      {t(VALUE_TITLE_KEYS[valueObj.id])}
                    </label>
                    <Input
                      value={valueObj.title[language]}
                      onChange={(e) =>
                        valueObj.setTitle({
                          ...valueObj.title,
                          [language]: e.target.value,
                        })
                      }
                      placeholder={t(VALUE_TITLE_PLACEHOLDERS[valueObj.id])}
                      className="border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      {t(VALUE_DESC_KEYS[valueObj.id])}
                    </label>
                    <textarea
                      className="mt-1 border rounded-md p-2 w-full text-sm resize-none overflow-hidden"
                      value={valueObj.data[language]}
                      onChange={(e) =>
                        handleTextareaChange(e, valueObj.data, valueObj.setter)
                      }
                      onFocus={(e) => adjustTextareaHeight(e.target)}
                      placeholder={t(VALUE_DESC_PLACEHOLDERS[valueObj.id])}
                      style={{ minHeight: "80px" }}
                    />
                  </div>
                </m.div>
              ))}
            </m.div>
          </CardContent>
        </Card>
      </m.div>

      {/* Modal pour l'agrandissement des images */}
      <AnimatePresence>
        {enlargedPhoto && (
          <ImageModal
            src={enlargedPhoto}
            alt="Image agrandie"
            onClose={() => setEnlargedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default AboutSettings;
