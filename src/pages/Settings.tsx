import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Settings: React.FC = () => {
  // Sélecteur de langue
  const [language, setLanguage] = useState("FR"); // FR, NL, EN

  // Section General
  const [siteColor1, setSiteColor1] = useState("#003366");
  const [siteColor2, setSiteColor2] = useState("#FFFFFF");
  const [logo, setLogo] = useState("https://via.placeholder.com/150");
  const [clubName, setClubName] = useState({
    FR: "Club de Football",
    NL: "Voetbalclub",
    EN: "Football Club",
  });
  const [clubAddress, setClubAddress] = useState({
    FR: "12 Rue de la Paix",
    NL: "12 Vredestraat",
    EN: "12 Peace Street",
  });
  const [postalCode, setPostalCode] = useState("75001");
  const [commune, setCommune] = useState("Paris");
  const [country, setCountry] = useState("France");
  const [email, setEmail] = useState("contact@club.com");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/club");
  const [instagramUrl, setInstagramUrl] = useState(
    "https://instagram.com/club"
  );

  // Section À propos
  const [playersCount, setPlayersCount] = useState(120);
  const [experienceYears, setExperienceYears] = useState(15);
  const [nationalTrophies, setNationalTrophies] = useState(8);
  const [youngTalents, setYoungTalents] = useState(25);
  const [historyDescription, setHistoryDescription] = useState({
    FR: "Notre club a une riche histoire...",
    NL: "Onze club heeft een rijke geschiedenis...",
    EN: "Our club has a rich history...",
  });
  const [historyPhoto, setHistoryPhoto] = useState(
    "https://via.placeholder.com/300x200"
  );
  const [missionDescription, setMissionDescription] = useState({
    FR: "Notre mission est de former les meilleurs joueurs...",
    NL: "Onze missie is om de beste spelers op te leiden...",
    EN: "Our mission is to develop the best players...",
  });
  const [missionPhoto, setMissionPhoto] = useState(
    "https://via.placeholder.com/300x200"
  );
  const [approachDescription, setApproachDescription] = useState({
    FR: "Nous adoptons une approche innovante...",
    NL: "We hanteren een innovatieve aanpak...",
    EN: "We use an innovative approach...",
  });
  const [approachPhoto, setApproachPhoto] = useState(
    "https://via.placeholder.com/300x200"
  );
  const [valueTitle1, setValueTitle1] = useState({
    FR: "Passion",
    NL: "Passie",
    EN: "Passion",
  });
  const [valueDesc1, setValueDesc1] = useState({
    FR: "Nous vivons pour le football.",
    NL: "We leven voor voetbal.",
    EN: "We live for football.",
  });
  const [valueTitle2, setValueTitle2] = useState({
    FR: "Esprit d'équipe",
    NL: "Teamgeest",
    EN: "Team Spirit",
  });
  const [valueDesc2, setValueDesc2] = useState({
    FR: "L'union fait la force.",
    NL: "Samen staan we sterk.",
    EN: "Together we are stronger.",
  });
  const [valueTitle3, setValueTitle3] = useState({
    FR: "Excellence",
    NL: "Uitmuntendheid",
    EN: "Excellence",
  });
  const [valueDesc3, setValueDesc3] = useState({
    FR: "Toujours viser le meilleur.",
    NL: "Altijd streven naar het beste.",
    EN: "Always aim for the best.",
  });

  // Section Contact
  const [openingHours, setOpeningHours] = useState(
    "Lundi - Vendredi: 9h - 18h<br>Samedi: 10h - 16h"
  );
  const [vatNumber, setVatNumber] = useState("FR123456789");
  const [companyNumber, setCompanyNumber] = useState("SIRET 987654321");

  // Fonction dummy de sauvegarde
  const handleSaveSettings = () => {
    const settingsData = {
      general: {
        siteColor1,
        siteColor2,
        logo,
        clubName,
        clubAddress,
        postalCode,
        commune,
        country,
        email,
        facebookUrl,
        instagramUrl,
      },
      about: {
        playersCount,
        experienceYears,
        nationalTrophies,
        youngTalents,
        historyDescription,
        historyPhoto,
        missionDescription,
        missionPhoto,
        approachDescription,
        approachPhoto,
        valueTitle1,
        valueDesc1,
        valueTitle2,
        valueDesc2,
        valueTitle3,
        valueDesc3,
      },
      contact: {
        openingHours,
        vatNumber,
        companyNumber,
      },
      language,
    };
    console.log("Settings sauvegardés :", settingsData);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-rwdm-blue mb-4">
          Paramètres du site
        </h1>
        <div className="mb-6">
          <label className="font-semibold mr-2">
            Sélectionner la version :
          </label>
          <select
            className="border p-2 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="FR">Version Français</option>
            <option value="NL">Version Néerlandais</option>
            <option value="EN">Version Anglais</option>
          </select>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4 border-b">
            <TabsTrigger value="general" className="px-4 py-2 text-lg">
              General
            </TabsTrigger>
            <TabsTrigger value="about" className="px-4 py-2 text-lg">
              À propos
            </TabsTrigger>
            <TabsTrigger value="contact" className="px-4 py-2 text-lg">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Couleur 1 du site
                </label>
                <Input
                  type="color"
                  value={siteColor1}
                  onChange={(e) => setSiteColor1(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Couleur 2 du site
                </label>
                <Input
                  type="color"
                  value={siteColor2}
                  onChange={(e) => setSiteColor2(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Logo (URL)</label>
                <Input value={logo} onChange={(e) => setLogo(e.target.value)} />
              </div>
              <div>
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
              <div>
                <label className="block font-semibold mb-1">
                  Adresse du club ({language})
                </label>
                <Input
                  value={clubAddress[language]}
                  onChange={(e) =>
                    setClubAddress({
                      ...clubAddress,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block font-semibold mb-1">
                    Code postal
                  </label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block font-semibold mb-1">Commune</label>
                  <Input
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Pays</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
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
                <label className="block font-semibold mb-1">
                  URL Instagram
                </label>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Nombre de joueurs formés
                </label>
                <Input
                  type="number"
                  value={playersCount}
                  onChange={(e) => setPlayersCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Nombre d'années d'expérience
                </label>
                <Input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Nombre de trophées nationaux
                </label>
                <Input
                  type="number"
                  value={nationalTrophies}
                  onChange={(e) => setNationalTrophies(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Nombre de jeunes talents
                </label>
                <Input
                  type="number"
                  value={youngTalents}
                  onChange={(e) => setYoungTalents(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description histoire ({language})
                </label>
                <Input
                  value={historyDescription[language]}
                  onChange={(e) =>
                    setHistoryDescription({
                      ...historyDescription,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Photo histoire (URL)
                </label>
                <Input
                  value={historyPhoto}
                  onChange={(e) => setHistoryPhoto(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description Mission ({language})
                </label>
                <Input
                  value={missionDescription[language]}
                  onChange={(e) =>
                    setMissionDescription({
                      ...missionDescription,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Photo Mission (URL)
                </label>
                <Input
                  value={missionPhoto}
                  onChange={(e) => setMissionPhoto(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description approche ({language})
                </label>
                <Input
                  value={approachDescription[language]}
                  onChange={(e) =>
                    setApproachDescription({
                      ...approachDescription,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Photo approche (URL)
                </label>
                <Input
                  value={approachPhoto}
                  onChange={(e) => setApproachPhoto(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Titre Valeur 1 ({language})
                </label>
                <Input
                  value={valueTitle1[language]}
                  onChange={(e) =>
                    setValueTitle1({
                      ...valueTitle1,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description Valeur 1 ({language})
                </label>
                <Input
                  value={valueDesc1[language]}
                  onChange={(e) =>
                    setValueDesc1({ ...valueDesc1, [language]: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Titre Valeur 2 ({language})
                </label>
                <Input
                  value={valueTitle2[language]}
                  onChange={(e) =>
                    setValueTitle2({
                      ...valueTitle2,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description Valeur 2 ({language})
                </label>
                <Input
                  value={valueDesc2[language]}
                  onChange={(e) =>
                    setValueDesc2({ ...valueDesc2, [language]: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Titre Valeur 3 ({language})
                </label>
                <Input
                  value={valueTitle3[language]}
                  onChange={(e) =>
                    setValueTitle3({
                      ...valueTitle3,
                      [language]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Description Valeur 3 ({language})
                </label>
                <Input
                  value={valueDesc3[language]}
                  onChange={(e) =>
                    setValueDesc3({ ...valueDesc3, [language]: e.target.value })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Heure d'ouverture
                </label>
                <Input
                  placeholder="Ex: Lundi - Vendredi: 9h - 18h<br>Samedi: 10h - 16h"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
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
                <label className="block font-semibold mb-1">
                  Nr d'Entreprise
                </label>
                <Input
                  value={companyNumber}
                  onChange={(e) => setCompanyNumber(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleSaveSettings}
            className="px-8 py-3 text-lg bg-rwdm-blue text-white rounded"
          >
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
