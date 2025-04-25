import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "framer-motion";

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

  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
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
              <CardTitle>Statistiques du club</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              Ces chiffres reflètent l'impact et l'historique du club.
            </motion.p>
          </CardHeader>

          <CardContent>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {[
                {
                  label: "Joueurs formés",
                  value: playersCount,
                  setter: setPlayersCount,
                },
                {
                  label: "Années d'expérience",
                  value: experienceYears,
                  setter: setExperienceYears,
                },
                {
                  label: "Trophées nationaux",
                  value: nationalTrophies,
                  setter: setNationalTrophies,
                },
                {
                  label: "Jeunes talents détectés",
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
              <CardTitle>À propos du club</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              Remplissez les informations clés qui présentent l'histoire, la
              mission et l'approche du club.
            </motion.p>
          </CardHeader>

          <CardContent>
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="histoire" className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="histoire">Histoire</TabsTrigger>
                    <TabsTrigger value="mission">Mission</TabsTrigger>
                    <TabsTrigger value="approche">Approche</TabsTrigger>
                  </TabsList>
                </motion.div>

                {[
                  {
                    value: "histoire",
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
                    value: "approche",
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
                          Description {tab.value} ({language})
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
                          Photo {tab.value} (fichier)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Taille maximale : 2 Mo
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

                            {enlargedPhoto === tab.photo && (
                              <motion.div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                                onClick={() => setEnlargedPhoto(null)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.img
                                  src={tab.photo}
                                  alt="Agrandissement"
                                  className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring" }}
                                />
                              </motion.div>
                            )}
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
              <CardTitle>Nos académies</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              Renseignez le nom, la description et une image pour chaque
              académie.
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
                    <TabsTrigger value="1">Académie 1</TabsTrigger>
                    <TabsTrigger value="2">Académie 2</TabsTrigger>
                    <TabsTrigger value="3">Académie 3</TabsTrigger>
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
                              Nom Académie {num} ({language})
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
                              Description Académie {num} ({language})
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
                            Photo Académie {num} (fichier)
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Taille maximale : 2 Mo
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
                                toast.success(
                                  `Image pour l'académie ${num} chargée !`
                                );
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
                                  alt={`Photo Académie ${num}`}
                                  className="h-20 object-contain rounded cursor-pointer"
                                  onClick={() => setEnlargedPhoto(photo)}
                                />
                              </motion.div>

                              {enlargedPhoto === photo && (
                                <motion.div
                                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                                  onClick={() => setEnlargedPhoto(null)}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <motion.img
                                    src={photo}
                                    alt="Agrandissement"
                                    className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                  />
                                </motion.div>
                              )}
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
              <CardTitle>Nos valeurs</CardTitle>
            </motion.div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400 mt-1"
              variants={itemVariants}
            >
              Le club s'engage à transmettre des valeurs fortes telles que le
              respect, le fairplay ou encore l'esprit d'équipe.
            </motion.p>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.div variants={containerVariants} className="space-y-4">
              {[
                {
                  num: 1,
                  title: valueTitle1,
                  setTitle: setValueTitle1,
                  desc: valueDesc1,
                  setDesc: setValueDesc1,
                },
                {
                  num: 2,
                  title: valueTitle2,
                  setTitle: setValueTitle2,
                  desc: valueDesc2,
                  setDesc: setValueDesc2,
                },
                {
                  num: 3,
                  title: valueTitle3,
                  setTitle: setValueTitle3,
                  desc: valueDesc3,
                  setDesc: setValueDesc3,
                },
              ].map((value, index) => (
                <motion.div
                  key={value.num}
                  className="border rounded-lg px-5 py-4 bg-white dark:bg-gray-900 shadow-sm"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.01,
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Titre de la valeur {value.num} ({language})
                    </label>
                    <Input
                      value={value.title[language]}
                      onChange={(e) =>
                        value.setTitle({
                          ...value.title,
                          [language]: e.target.value,
                        })
                      }
                      className="mt-1 border rounded-md p-2 w-full"
                      placeholder={`Ex. Respect, Fair-play...`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Description de la valeur {value.num} ({language})
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 border rounded-md p-2 w-full text-sm"
                      value={value.desc[language]}
                      onChange={(e) =>
                        value.setDesc({
                          ...value.desc,
                          [language]: e.target.value,
                        })
                      }
                      placeholder="Décrivez ce que cette valeur signifie pour le club"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AboutSettings;
