import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div
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
        <motion.img
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
      </motion.div>
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Statistiques du club */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <motion.div variants={itemVariants}>
              <CardTitle>{t("clubStats.title")}</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("clubStats.description")}
            </motion.p>
          </CardHeader>

          <CardContent>
            <motion.div
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
                <motion.div
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
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* À propos du club */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <motion.div variants={itemVariants}>
              <CardTitle>{t("clubAbout.title")}</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("clubAbout.description")}
            </motion.p>
          </CardHeader>

          <CardContent>
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="history" className="w-full">
                <motion.div
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
                </motion.div>

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
                    <motion.div
                      className="flex flex-col md:flex-row gap-4 items-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Texte */}
                      <motion.div
                        className="w-full md:w-1/2"
                        whileHover={{ scale: 1.01 }}
                      >
                        <label className="block font-semibold mb-1">
                          {t("labelDescription")} {tab.value} ({language})
                        </label>
                        <textarea
                          rows={5}
                          className="w-full border rounded p-2"
                          value={tab.description[language]}
                          onChange={(e) =>
                            tab.setDescription({
                              ...tab.description,
                              [language]: e.target.value,
                            })
                          }
                        />
                      </motion.div>

                      {/* Image */}
                      <motion.div
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
                            <motion.div
                              className="flex justify-center mt-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img
                                src={tab.photo}
                                alt={`Photo ${tab.value}`}
                                className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                                onClick={() => setEnlargedPhoto(tab.photo)}
                              />
                            </motion.div>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nos académies */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <motion.div variants={itemVariants}>
              <CardTitle>{t("academies.title")}</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("academies.description")}
            </motion.p>
          </CardHeader>

          <CardContent>
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="1" className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="1">{t("academies.tab1")}</TabsTrigger>
                    <TabsTrigger value="2">{t("academies.tab2")}</TabsTrigger>
                    <TabsTrigger value="3">{t("academies.tab3")}</TabsTrigger>
                  </TabsList>
                </motion.div>

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
                      <motion.div
                        className="flex flex-col md:flex-row gap-4 items-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 * num }}
                      >
                        {/* Texte */}
                        <motion.div
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
                              rows={5}
                              className="w-full border rounded p-2"
                              value={description[language]}
                              onChange={(e) =>
                                setDescription({
                                  ...description,
                                  [language]: e.target.value,
                                })
                              }
                            />
                          </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
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
                                toast.success(t("academiesUploadSuccess1"));
                              }
                            }}
                          />
                          {photo && (
                            <>
                              <motion.div
                                className="flex justify-center mt-2"
                                whileHover={{ scale: 1.05 }}
                              >
                                <img
                                  src={photo}
                                  alt={t("academies.photoLabel")}
                                  className="h-20 object-contain rounded cursor-pointer"
                                  onClick={() => setEnlargedPhoto(photo)}
                                />
                              </motion.div>
                            </>
                          )}
                        </motion.div>
                      </motion.div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nos valeurs */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <motion.div variants={itemVariants}>
              <CardTitle>{t("valuesTitle")}</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              {t("valuesDescription")}
            </motion.p>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((num) => {
                const titleKey = VALUE_TITLE_KEYS[num];
                const descKey = VALUE_DESC_KEYS[num];
                const titlePlaceholderKey = VALUE_TITLE_PLACEHOLDERS[num];
                const descPlaceholderKey = VALUE_DESC_PLACEHOLDERS[num];

                const valueObj =
                  num === 1
                    ? { data: valueTitle1, setter: setValueTitle1 }
                    : num === 2
                    ? { data: valueTitle2, setter: setValueTitle2 }
                    : { data: valueTitle3, setter: setValueTitle3 };

                const descObj =
                  num === 1
                    ? { data: valueDesc1, setter: setValueDesc1 }
                    : num === 2
                    ? { data: valueDesc2, setter: setValueDesc2 }
                    : { data: valueDesc3, setter: setValueDesc3 };

                return (
                  <motion.div
                    key={num}
                    className="border rounded-lg px-5 py-4 bg-white dark:bg-gray-900 shadow-sm"
                    variants={itemVariants}
                    whileHover={
                      {
                        /* … */
                      }
                    }
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Titre */}
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {t(titleKey)} ({language})
                      </label>
                      <Input
                        value={valueObj.data[language]}
                        onChange={(e) =>
                          valueObj.setter({
                            ...valueObj.data,
                            [language]: e.target.value,
                          })
                        }
                        className="mt-1 border rounded-md p-2 w-full"
                        placeholder={t(titlePlaceholderKey)}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {t(descKey)} ({language})
                      </label>
                      <textarea
                        rows={4}
                        className="mt-1 border rounded-md p-2 w-full text-sm"
                        value={descObj.data[language]}
                        onChange={(e) =>
                          descObj.setter({
                            ...descObj.data,
                            [language]: e.target.value,
                          })
                        }
                        placeholder={t(descPlaceholderKey)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {enlargedPhoto && (
          <ImageModal
            src={enlargedPhoto}
            alt={t("close")}
            onClose={() => setEnlargedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AboutSettings;
