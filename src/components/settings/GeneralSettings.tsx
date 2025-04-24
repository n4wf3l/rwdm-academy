// src/components/settings/GeneralSettings.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

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
  /* -------------------- RENDER -------------------- */
  return (
    <div className="space-y-6">
      {/* Couleurs */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Couleur 1 du site</label>
          <Input
            type="color"
            value={siteColor1}
            onChange={(e) => setSiteColor1(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Couleur 2 du site</label>
          <Input
            type="color"
            value={siteColor2}
            onChange={(e) => setSiteColor2(e.target.value)}
          />
        </div>
      </div>

      {/* Logo + nom du club */}
      <div className="flex space-x-4">
        {/* --- LOGO --- */}
        <div className="flex-1">
          <label className="block font-semibold mb-1">Logo (fichier)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (!checkImageSize(file)) {
                e.target.value = "";
                return;
              }

              const filePath = await uploadImageFile(file);
              if (filePath) {
                setLogo(filePath); // filePath est de type "/uploads/1234-logo.png"
                toast.success("✅ Logo uploadé avec succès !");
              }
            }}
          />

          {/* Preview (relative path comme dans AboutSettings) */}
          {logo && (
            <img src={logo} alt="Logo" className="mt-2 h-20 object-contain" />
          )}
        </div>

        {/* --- NOM CLUB --- */}
        <div className="flex-1">
          <label className="block font-semibold mb-1">
            Nom du club ({language})
          </label>
          <Input
            value={clubName[language]}
            onChange={(e) =>
              setClubName({ ...clubName, [language]: e.target.value })
            }
          />
        </div>

        {/* --- NOM CLUB --- */}
        <div className="flex-1">
          <label className="block font-semibold mb-1">
            Nom du club ({language})
          </label>
          <Input
            value={clubName[language]}
            onChange={(e) =>
              setClubName({ ...clubName, [language]: e.target.value })
            }
          />
        </div>
      </div>

      {/* Adresse */}
      <div>
        <label className="block font-semibold mb-1">
          Adresse du club ({language})
        </label>
        <Input
          value={clubAddress[language]}
          onChange={(e) =>
            setClubAddress({ ...clubAddress, [language]: e.target.value })
          }
        />
      </div>

      {/* CP + commune */}
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block font-semibold mb-1">Code postal</label>
          <Input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block font-semibold mb-1">
            Commune ({language})
          </label>
          <Input
            value={commune[language]}
            onChange={(e) =>
              setCommune({ ...commune, [language]: e.target.value })
            }
          />
        </div>
      </div>

      {/* Pays */}
      <div>
        <label className="block font-semibold mb-1">Pays ({language})</label>
        <Input
          value={country[language]}
          onChange={(e) =>
            setCountry({ ...country, [language]: e.target.value })
          }
        />
      </div>

      {/* Email + réseaux sociaux */}
      <div>
        <label className="block font-semibold mb-1">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">URL Facebook</label>
        <Input
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">URL Instagram</label>
        <Input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />
      </div>
    </div>
  );
};

export default GeneralSettings;
