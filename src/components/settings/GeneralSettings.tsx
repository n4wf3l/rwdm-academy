import React from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  language: "FR" | "NL" | "EN";
  siteColor1: string;
  setSiteColor1: React.Dispatch<React.SetStateAction<string>>;
  siteColor2: string;
  setSiteColor2: React.Dispatch<React.SetStateAction<string>>;
  logo: string;
  setLogo: React.Dispatch<React.SetStateAction<string>>;
  clubName: {
    FR: string;
    NL: string;
    EN: string;
  };
  setClubName: React.Dispatch<
    React.SetStateAction<{
      FR: string;
      NL: string;
      EN: string;
    }>
  >;
  clubAddress: {
    FR: string;
    NL: string;
    EN: string;
  };
  setClubAddress: React.Dispatch<
    React.SetStateAction<{
      FR: string;
      NL: string;
      EN: string;
    }>
  >;
  postalCode: string;
  setPostalCode: React.Dispatch<React.SetStateAction<string>>;
  commune: {
    FR: string;
    NL: string;
    EN: string;
  };
  setCommune: React.Dispatch<
    React.SetStateAction<{
      FR: string;
      NL: string;
      EN: string;
    }>
  >;
  country: {
    FR: string;
    NL: string;
    EN: string;
  };
  setCountry: React.Dispatch<
    React.SetStateAction<{
      FR: string;
      NL: string;
      EN: string;
    }>
  >;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  facebookUrl: string;
  setFacebookUrl: React.Dispatch<React.SetStateAction<string>>;
  instagramUrl: string;
  setInstagramUrl: React.Dispatch<React.SetStateAction<string>>;
};

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
  return (
    <div className="space-y-6">
      {/* Couleurs côte à côte */}
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

      {/* Logo + Nom club côte à côte */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Logo (fichier)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > 1024 * 1024) {
                toast.error("📦 L’image ne doit pas dépasser 1 Mo");
                return;
              }

              const reader = new FileReader();
              reader.onloadend = () => {
                setLogo(reader.result as string); // base64
                toast.success(" Logo chargé avec succès !");
              };
              reader.readAsDataURL(file);
            }}
          />

          {logo && logo !== "https://via.placeholder.com/150" && (
            <div className="mt-2">
              <img src={logo} alt="Logo" className="h-20" />
            </div>
          )}
        </div>
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

      {/* Adresse juste en dessous */}
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

      {/* Code postal et commune */}
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

      {/* Email */}
      <div>
        <label className="block font-semibold mb-1">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Réseaux sociaux */}
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
