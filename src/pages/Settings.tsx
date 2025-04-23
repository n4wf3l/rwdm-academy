import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Composants séparés
import GeneralSettings from "@/components/settings/GeneralSettings";
import AboutSettings from "@/components/settings/AboutSettings";
import ContactSettings from "@/components/settings/ContactSettings";
import axios from "axios";
import { toast } from "sonner";

const Settings: React.FC = () => {
  const [language, setLanguage] = useState<"FR" | "NL" | "EN">("FR");

  // General
  const [siteColor1, setSiteColor1] = useState("#003366");
  const [siteColor2, setSiteColor2] = useState("#FFFFFF");
  const [logo, setLogo] = useState("https://via.placeholder.com/150");
  const [clubName, setClubName] = useState({ FR: "", NL: "", EN: "" });
  const [clubAddress, setClubAddress] = useState({ FR: "", NL: "", EN: "" });
  const [postalCode, setPostalCode] = useState("");
  const [commune, setCommune] = useState({ FR: "", NL: "", EN: "" });
  const [country, setCountry] = useState({ FR: "", NL: "", EN: "" });
  const [email, setEmail] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // About
  const [nationalTrophies, setNationalTrophies] = useState("");
  const [youngTalents, setYoungTalents] = useState("");
  const [historyDescription, setHistoryDescription] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [historyPhoto, setHistoryPhoto] = useState("");
  const [missionDescription, setMissionDescription] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [missionPhoto, setMissionPhoto] = useState("");
  const [approachDescription, setApproachDescription] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [approachPhoto, setApproachPhoto] = useState("");
  const [valueTitle1, setValueTitle1] = useState({ FR: "", NL: "", EN: "" });
  const [valueDesc1, setValueDesc1] = useState({ FR: "", NL: "", EN: "" });
  const [valueTitle2, setValueTitle2] = useState({ FR: "", NL: "", EN: "" });
  const [valueDesc2, setValueDesc2] = useState({ FR: "", NL: "", EN: "" });
  const [valueTitle3, setValueTitle3] = useState({ FR: "", NL: "", EN: "" });
  const [valueDesc3, setValueDesc3] = useState({ FR: "", NL: "", EN: "" });
  const [playersCount, setPlayersCount] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  const [academyNames1, setAcademyNames1] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyNames2, setAcademyNames2] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyNames3, setAcademyNames3] = useState({
    FR: "",
    NL: "",
    EN: "",
  });

  const [academyDescriptions1, setAcademyDescriptions1] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyDescriptions2, setAcademyDescriptions2] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyDescriptions3, setAcademyDescriptions3] = useState({
    FR: "",
    NL: "",
    EN: "",
  });

  const [academyPhotos1, setAcademyPhotos1] = useState("");
  const [academyPhotos2, setAcademyPhotos2] = useState("");
  const [academyPhotos3, setAcademyPhotos3] = useState("");

  // Contact
  const [openingHours, setOpeningHours] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const settingsData = {
    language: "FR", // langue par défaut sélectionnée
    general: {
      siteColor1,
      siteColor2,
      logo,
      clubName, // { FR, NL, EN }
      clubAddress, // { FR, NL, EN }
      postalCode,
      commune,
      country,
      email,
      facebookUrl,
      instagramUrl,
    },
    about: {
      playersCount: Number(playersCount),
      experienceYears: Number(experienceYears),
      nationalTrophies: Number(nationalTrophies),
      youngTalents: Number(youngTalents),
      historyDescription, // { FR, NL, EN }
      historyPhoto,
      missionDescription, // { FR, NL, EN }
      missionPhoto,
      approachDescription, // { FR, NL, EN }
      approachPhoto,
      valueTitle1,
      valueDesc1, // { FR, NL, EN }
      valueTitle2,
      valueDesc2,
      valueTitle3,
      valueDesc3,
      academyNames1,
      academyDescriptions1,
      academyPhotos1,
      academyNames2,
      academyDescriptions2,
      academyPhotos2,
      academyNames3,
      academyDescriptions3,
      academyPhotos3,
    },
    contact: {
      openingHours, // peut être en HTML
      vatNumber,
      companyNumber,
      accountName,
    },
  };

  const handleSaveSettings = async () => {
    const totalSizeInBytes =
      ((historyPhoto?.length ||
        0 + missionPhoto?.length ||
        0 + approachPhoto?.length ||
        0) *
        3) /
      4; // base64 est 33% plus lourd

    if (totalSizeInBytes > 1.5 * 1024 * 1024) {
      toast.error("📦 Trop d’images à la fois. Réduis leur taille !");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/settings",
        settingsData
      );
      toast.success("Les paramètres ont bien été enregistrés !");
    } catch (error: any) {
      console.error("❌ Erreur lors de la sauvegarde :", error);
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/settings");
        const data = res.data;

        // General
        setSiteColor1(data.general.siteColor1 || "#003366");
        setSiteColor2(data.general.siteColor2 || "#FFFFFF");
        setLogo(data.general.logo || "https://via.placeholder.com/150");
        setClubName(data.general.clubName || { FR: "", NL: "", EN: "" });
        setClubAddress(data.general.clubAddress || { FR: "", NL: "", EN: "" });
        setPostalCode(data.general.postalCode || "");
        setCommune(data.general.commune || { FR: "", NL: "", EN: "" });
        setCountry(data.general.country || { FR: "", NL: "", EN: "" });
        setEmail(data.general.email || "");
        setFacebookUrl(data.general.facebookUrl || "");
        setInstagramUrl(data.general.instagramUrl || "");

        // About
        setPlayersCount(String(data.about.playersCount || ""));
        setExperienceYears(String(data.about.experienceYears || ""));
        setNationalTrophies(data.about.nationalTrophies || 0);
        setYoungTalents(data.about.youngTalents || 0);
        setHistoryDescription(
          data.about.historyDescription || { FR: "", NL: "", EN: "" }
        );
        setHistoryPhoto(data.about.historyPhoto || "");
        setMissionDescription(
          data.about.missionDescription || { FR: "", NL: "", EN: "" }
        );
        setMissionPhoto(data.about.missionPhoto || "");
        setApproachDescription(
          data.about.approachDescription || { FR: "", NL: "", EN: "" }
        );
        setApproachPhoto(data.about.approachPhoto || "");
        setValueTitle1(data.about.valueTitle1 || { FR: "", NL: "", EN: "" });
        setValueDesc1(data.about.valueDesc1 || { FR: "", NL: "", EN: "" });
        setValueTitle2(data.about.valueTitle2 || { FR: "", NL: "", EN: "" });
        setValueDesc2(data.about.valueDesc2 || { FR: "", NL: "", EN: "" });
        setValueTitle3(data.about.valueTitle3 || { FR: "", NL: "", EN: "" });
        setValueDesc3(data.about.valueDesc3 || { FR: "", NL: "", EN: "" });
        setAcademyNames1(
          data.about.academyNames1 || { FR: "", NL: "", EN: "" }
        );
        setAcademyDescriptions1(
          data.about.academyDescriptions1 || { FR: "", NL: "", EN: "" }
        );
        setAcademyPhotos1(data.about.academyPhotos1 || "");

        setAcademyNames2(
          data.about.academyNames2 || { FR: "", NL: "", EN: "" }
        );
        setAcademyDescriptions2(
          data.about.academyDescriptions2 || { FR: "", NL: "", EN: "" }
        );
        setAcademyPhotos2(data.about.academyPhotos2 || "");

        setAcademyNames3(
          data.about.academyNames3 || { FR: "", NL: "", EN: "" }
        );
        setAcademyDescriptions3(
          data.about.academyDescriptions3 || { FR: "", NL: "", EN: "" }
        );
        setAcademyPhotos3(data.about.academyPhotos3 || "");

        // Contact
        setOpeningHours(data.contact.openingHours || "");
        setVatNumber(data.contact.vatNumber || "");
        setCompanyNumber(data.contact.companyNumber || "");
        setAccountName(data.contact.accountName || "");
        // Langue (optionnel)
        setLanguage(data.language || "FR");
      } catch (error) {
        console.error("❌ Erreur lors du chargement des paramètres :", error);
      }
    };

    fetchSettings();
  }, []);

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
            onChange={(e) => setLanguage(e.target.value as "FR" | "NL" | "EN")}
          >
            <option value="FR">Version Français</option>
            <option value="NL">Version Néerlandais</option>
            <option value="EN">Version Anglais</option>
          </select>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4 border-b">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              language={language}
              siteColor1={siteColor1}
              setSiteColor1={setSiteColor1}
              siteColor2={siteColor2}
              setSiteColor2={setSiteColor2}
              logo={logo}
              setLogo={setLogo}
              clubName={clubName}
              setClubName={setClubName}
              clubAddress={clubAddress}
              setClubAddress={setClubAddress}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              commune={commune}
              setCommune={setCommune}
              country={country}
              setCountry={setCountry}
              email={email}
              setEmail={setEmail}
              facebookUrl={facebookUrl}
              setFacebookUrl={setFacebookUrl}
              instagramUrl={instagramUrl}
              setInstagramUrl={setInstagramUrl}
            />
          </TabsContent>

          <TabsContent value="about">
            <AboutSettings
              language={language}
              playersCount={playersCount}
              setPlayersCount={setPlayersCount}
              experienceYears={experienceYears}
              setExperienceYears={setExperienceYears}
              nationalTrophies={nationalTrophies}
              setNationalTrophies={setNationalTrophies}
              youngTalents={youngTalents}
              setYoungTalents={setYoungTalents}
              historyDescription={historyDescription}
              setHistoryDescription={setHistoryDescription}
              historyPhoto={historyPhoto}
              setHistoryPhoto={setHistoryPhoto}
              missionDescription={missionDescription}
              setMissionDescription={setMissionDescription}
              missionPhoto={missionPhoto}
              setMissionPhoto={setMissionPhoto}
              approachDescription={approachDescription}
              setApproachDescription={setApproachDescription}
              approachPhoto={approachPhoto}
              setApproachPhoto={setApproachPhoto}
              valueTitle1={valueTitle1}
              setValueTitle1={setValueTitle1}
              valueDesc1={valueDesc1}
              setValueDesc1={setValueDesc1}
              valueTitle2={valueTitle2}
              setValueTitle2={setValueTitle2}
              valueDesc2={valueDesc2}
              setValueDesc2={setValueDesc2}
              valueTitle3={valueTitle3}
              setValueTitle3={setValueTitle3}
              valueDesc3={valueDesc3}
              setValueDesc3={setValueDesc3}
              academyNames1={academyNames1}
              setAcademyNames1={setAcademyNames1}
              academyDescriptions1={academyDescriptions1}
              setAcademyDescriptions1={setAcademyDescriptions1}
              academyPhotos1={academyPhotos1}
              setAcademyPhotos1={setAcademyPhotos1}
              academyNames2={academyNames2}
              setAcademyNames2={setAcademyNames2}
              academyDescriptions2={academyDescriptions2}
              setAcademyDescriptions2={setAcademyDescriptions2}
              academyPhotos2={academyPhotos2}
              setAcademyPhotos2={setAcademyPhotos2}
              academyNames3={academyNames3}
              setAcademyNames3={setAcademyNames3}
              academyDescriptions3={academyDescriptions3}
              setAcademyDescriptions3={setAcademyDescriptions3}
              academyPhotos3={academyPhotos3}
              setAcademyPhotos3={setAcademyPhotos3}
            />
          </TabsContent>

          <TabsContent value="contact">
            <ContactSettings
              accountName={accountName}
              setAccountName={setAccountName}
              openingHours={openingHours}
              setOpeningHours={setOpeningHours}
              vatNumber={vatNumber}
              setVatNumber={setVatNumber}
              companyNumber={companyNumber}
              setCompanyNumber={setCompanyNumber}
            />
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
