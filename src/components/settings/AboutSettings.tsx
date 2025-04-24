import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques du club</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ces chiffres reflètent l’impact et l’historique du club.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de joueurs formés */}
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Joueurs formés
              </p>
              <input
                type="number"
                value={playersCount}
                onChange={(e) => setPlayersCount(e.target.value)}
                className="w-full text-4xl font-bold text-rwdm-blue dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Années d’expérience */}
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Années d’expérience
              </p>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full text-4xl font-bold text-rwdm-blue dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Trophées nationaux */}
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trophées nationaux
              </p>
              <input
                type="number"
                value={nationalTrophies}
                onChange={(e) => setNationalTrophies(e.target.value)}
                className="w-full text-4xl font-bold text-rwdm-blue dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Jeunes talents */}
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Jeunes talents détectés
              </p>
              <input
                type="number"
                value={youngTalents}
                onChange={(e) => setYoungTalents(e.target.value)}
                className="w-full text-4xl font-bold text-rwdm-blue dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>À propos du club</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Remplissez les informations clés qui présentent l’histoire, la
            mission et l’approche du club.
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="histoire" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="histoire">Histoire</TabsTrigger>
              <TabsTrigger value="mission">Mission</TabsTrigger>
              <TabsTrigger value="approche">Approche</TabsTrigger>
            </TabsList>

            {/* HISTOIRE */}
            <TabsContent value="histoire" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Description histoire ({language})
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border rounded p-2"
                    value={historyDescription[language]}
                    onChange={(e) =>
                      setHistoryDescription({
                        ...historyDescription,
                        [language]: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Photo histoire (fichier)
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
                        setHistoryPhoto(filePath);
                        toast.success("Image chargée avec succès !");
                      }
                    }}
                  />
                  {historyPhoto && (
                    <>
                      <div className="flex justify-center mt-2">
                        <img
                          src={historyPhoto}
                          alt="Photo histoire"
                          className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                          onClick={() => setEnlargedPhoto(historyPhoto)}
                        />
                      </div>

                      {enlargedPhoto === historyPhoto && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                          onClick={() => setEnlargedPhoto(null)}
                        >
                          <img
                            src={enlargedPhoto}
                            alt="Agrandissement"
                            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg transition duration-300"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* MISSION */}
            <TabsContent value="mission" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Description mission ({language})
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border rounded p-2"
                    value={missionDescription[language]}
                    onChange={(e) =>
                      setMissionDescription({
                        ...missionDescription,
                        [language]: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Photo mission (fichier)
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
                        setMissionPhoto(filePath);
                        toast.success("Image chargée avec succès !");
                      }
                    }}
                  />
                  {missionPhoto && (
                    <>
                      <div className="flex justify-center mt-2">
                        <img
                          src={missionPhoto}
                          alt="Photo mission"
                          className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                          onClick={() => setEnlargedPhoto(missionPhoto)}
                        />
                      </div>

                      {enlargedPhoto === missionPhoto && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                          onClick={() => setEnlargedPhoto(null)}
                        >
                          <img
                            src={missionPhoto}
                            alt="Zoom mission"
                            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg transition duration-300"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* APPROCHE */}
            <TabsContent value="approche" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Description approche ({language})
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border rounded p-2"
                    value={approachDescription[language]}
                    onChange={(e) =>
                      setApproachDescription({
                        ...approachDescription,
                        [language]: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block font-semibold mb-1">
                    Photo approche (fichier)
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
                        setApproachPhoto(filePath);
                        toast.success("Image chargée avec succès !");
                      }
                    }}
                  />
                  {approachPhoto && (
                    <>
                      <div className="flex justify-center mt-2">
                        <img
                          src={approachPhoto}
                          alt="Photo approche"
                          className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                          onClick={() => setEnlargedPhoto(approachPhoto)}
                        />
                      </div>

                      {enlargedPhoto === approachPhoto && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                          onClick={() => setEnlargedPhoto(null)}
                        >
                          <img
                            src={approachPhoto}
                            alt="Zoom approche"
                            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg transition duration-300"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nos académies</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Renseignez le nom, la description et une image pour chaque académie.
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="1">Académie 1</TabsTrigger>
              <TabsTrigger value="2">Académie 2</TabsTrigger>
              <TabsTrigger value="3">Académie 3</TabsTrigger>
            </TabsList>

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
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Texte */}
                    <div className="w-full md:w-1/2 space-y-4">
                      <div>
                        <label className="block font-semibold mb-1">
                          Nom Académie {num} ({language})
                        </label>
                        <Input
                          value={name[language]}
                          onChange={(e) =>
                            setName({ ...name, [language]: e.target.value })
                          }
                          className="rounded-md border p-2 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Description Académie {num} ({language})
                        </label>
                        <textarea
                          rows={5}
                          className="w-full border rounded p-2 transition-all duration-200"
                          value={description[language]}
                          onChange={(e) =>
                            setDescription({
                              ...description,
                              [language]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-full md:w-1/2">
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
                              `Image pour l’académie ${num} chargée !`
                            );
                          }
                        }}
                      />
                      {photo && (
                        <>
                          <div className="flex justify-center mt-2">
                            <img
                              src={photo}
                              alt={`Photo Académie ${num}`}
                              className="h-20 object-contain transition-all duration-200 rounded cursor-pointer"
                              onClick={() => setEnlargedPhoto(photo)}
                            />
                          </div>

                          {enlargedPhoto === photo && (
                            <div
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
                              onClick={() => setEnlargedPhoto(null)}
                            >
                              <img
                                src={photo}
                                alt="Agrandissement"
                                className="max-w-[90vw] max-h-[90vh] rounded shadow-lg transition duration-300"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nos valeurs</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Le club s’engage à transmettre des valeurs fortes telles que le
            respect, le fairplay ou encore l’esprit d’équipe. Décrivez
            ci-dessous trois principes fondamentaux qui définissent l’ADN du
            club.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {[1, 2, 3].map((num) => {
            const title =
              num === 1 ? valueTitle1 : num === 2 ? valueTitle2 : valueTitle3;
            const setTitle =
              num === 1
                ? setValueTitle1
                : num === 2
                ? setValueTitle2
                : setValueTitle3;

            const desc =
              num === 1 ? valueDesc1 : num === 2 ? valueDesc2 : valueDesc3;
            const setDesc =
              num === 1
                ? setValueDesc1
                : num === 2
                ? setValueDesc2
                : setValueDesc3;

            return (
              <div
                key={num}
                className="border rounded-lg px-5 py-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Titre de la valeur {num} ({language})
                  </label>
                  <Input
                    value={title[language]}
                    onChange={(e) =>
                      setTitle({ ...title, [language]: e.target.value })
                    }
                    className="mt-1 border rounded-md p-2 w-full transition-all duration-200"
                    placeholder={`Ex. Respect, Fair-play...`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Description de la valeur {num} ({language})
                  </label>
                  <textarea
                    rows={4}
                    className="mt-1 border rounded-md p-2 w-full transition-all duration-200 text-sm"
                    value={desc[language]}
                    onChange={(e) =>
                      setDesc({ ...desc, [language]: e.target.value })
                    }
                    placeholder="Décrivez ce que cette valeur signifie pour le club"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSettings;
