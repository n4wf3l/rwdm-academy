import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const MAX_IMAGE_SIZE = 1024 * 1024;

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
      toast.error(`L’image (${sizeMessage}) dépasse 1 Mo`);
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

  return (
    <div className="space-y-6">
      {/* Groupe 1 */}
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Nombre de joueurs formés
          </label>
          <Input
            type="number"
            value={playersCount}
            onChange={(e) => setPlayersCount(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Nombre d'années d'expérience
          </label>
          <Input
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </div>
      </div>

      {/* Groupe 2 */}
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Nombre de trophées nationaux
          </label>
          <Input
            type="number"
            value={nationalTrophies}
            onChange={(e) => setNationalTrophies(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Nombre de jeunes talents
          </label>
          <Input
            type="number"
            value={youngTalents}
            onChange={(e) => setYoungTalents(e.target.value)}
          />
        </div>
      </div>

      {/* Histoire */}
      <div className="flex space-x-4 items-start">
        <div className="w-1/2">
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
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Photo histoire (fichier)
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reset = () => (e.target.value = "");
                handleImageUpload(file, setHistoryPhoto, reset);
              }
            }}
          />
          {historyPhoto && (
            <img
              src={historyPhoto}
              alt="Photo histoire"
              className="mt-2 h-20 object-contain"
            />
          )}
        </div>
      </div>

      {/* Mission */}
      <div className="flex space-x-4 items-start">
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Description Mission ({language})
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
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Photo Mission (fichier)
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reset = () => (e.target.value = "");
                handleImageUpload(file, setMissionPhoto, reset);
              }
            }}
          />
          {missionPhoto && (
            <img
              src={missionPhoto}
              alt="Photo mission"
              className="mt-2 h-20 object-contain"
            />
          )}
        </div>
      </div>

      {/* Approche */}
      <div className="flex space-x-4 items-start">
        <div className="w-1/2">
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
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Photo approche (fichier)
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reset = () => (e.target.value = "");
                handleImageUpload(file, setApproachPhoto, reset);
              }
            }}
          />
          {approachPhoto && (
            <img
              src={approachPhoto}
              alt="Photo approche"
              className="mt-2 h-20 object-contain"
            />
          )}
        </div>
      </div>

      {/* Académies */}
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex space-x-4 items-start">
          <div className="w-1/2 space-y-2">
            <label className="block font-semibold mb-1">
              Nom Académie {num} ({language})
            </label>
            <Input
              value={
                num === 1
                  ? academyNames1[language]
                  : num === 2
                  ? academyNames2[language]
                  : academyNames3[language]
              }
              onChange={(e) => {
                const value = e.target.value;
                if (num === 1)
                  setAcademyNames1({ ...academyNames1, [language]: value });
                else if (num === 2)
                  setAcademyNames2({ ...academyNames2, [language]: value });
                else setAcademyNames3({ ...academyNames3, [language]: value });
              }}
            />

            <label className="block font-semibold mb-1">
              Description Académie {num} ({language})
            </label>
            <textarea
              rows={5}
              className="w-full border rounded p-2"
              value={
                num === 1
                  ? academyDescriptions1[language]
                  : num === 2
                  ? academyDescriptions2[language]
                  : academyDescriptions3[language]
              }
              onChange={(e) => {
                const value = e.target.value;
                if (num === 1)
                  setAcademyDescriptions1({
                    ...academyDescriptions1,
                    [language]: value,
                  });
                else if (num === 2)
                  setAcademyDescriptions2({
                    ...academyDescriptions2,
                    [language]: value,
                  });
                else
                  setAcademyDescriptions3({
                    ...academyDescriptions3,
                    [language]: value,
                  });
              }}
            />
          </div>
          <div className="w-1/2">
            <label className="block font-semibold mb-1">
              Photo Académie {num} (fichier)
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 750 * 1024) {
                  toast.error("📦 L’image ne doit pas dépasser 750 Ko");
                  e.target.value = "";
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (num === 1) setAcademyPhotos1(reader.result as string);
                  else if (num === 2)
                    setAcademyPhotos2(reader.result as string);
                  else setAcademyPhotos3(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
            {((num === 1 && academyPhotos1) ||
              (num === 2 && academyPhotos2) ||
              (num === 3 && academyPhotos3)) && (
              <img
                src={
                  num === 1
                    ? academyPhotos1
                    : num === 2
                    ? academyPhotos2
                    : academyPhotos3
                }
                alt={`Photo Académie ${num}`}
                className="mt-2 h-20 object-contain"
              />
            )}
          </div>
        </div>
      ))}

      {/* Valeurs */}
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex space-x-4 items-start">
          <div className="w-full space-y-2">
            <label className="block font-semibold mb-1">
              Titre Valeur {num} ({language})
            </label>
            <Input
              value={
                num === 1
                  ? valueTitle1[language]
                  : num === 2
                  ? valueTitle2[language]
                  : valueTitle3[language]
              }
              onChange={(e) => {
                const value = e.target.value;
                if (num === 1)
                  setValueTitle1({ ...valueTitle1, [language]: value });
                else if (num === 2)
                  setValueTitle2({ ...valueTitle2, [language]: value });
                else setValueTitle3({ ...valueTitle3, [language]: value });
              }}
            />
            <label className="block font-semibold mb-1">
              Description Valeur {num} ({language})
            </label>
            <textarea
              rows={5}
              className="w-full border rounded p-2"
              value={
                num === 1
                  ? valueDesc1[language]
                  : num === 2
                  ? valueDesc2[language]
                  : valueDesc3[language]
              }
              onChange={(e) => {
                const value = e.target.value;
                if (num === 1)
                  setValueDesc1({ ...valueDesc1, [language]: value });
                else if (num === 2)
                  setValueDesc2({ ...valueDesc2, [language]: value });
                else setValueDesc3({ ...valueDesc3, [language]: value });
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutSettings;
