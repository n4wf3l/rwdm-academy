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
import { Link } from "react-router-dom";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings: React.FC = () => {
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [language, setLanguage] = useState<"FR" | "NL" | "EN">("FR");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
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

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        const count = data.filter((r: any) => r.status === "Nouveau").length;
        setNewRequestsCount(count);
      } catch (error) {
        console.error("Erreur récupération demandes 'Nouveau':", error);
      }
    };

    fetchNewRequestsCount();
  }, []);

  const handleSaveSettings = async () => {
    const maxSize = 2 * 1024 * 1024; // 2 Mo
    const base64Size = (img: string) => {
      // Ignore les images déjà uploadées (chemins relatifs comme /uploads/...)
      if (img?.startsWith("/uploads/")) return 0;
      return (img?.length || 0) * 0.75;
    };

    const imageFields = [
      historyPhoto,
      missionPhoto,
      approachPhoto,
      academyPhotos1,
      academyPhotos2,
      academyPhotos3,
    ];

    const totalImageSize = imageFields.reduce(
      (sum, img) => sum + base64Size(img),
      0
    );

    if (totalImageSize > maxSize) {
      toast.error(
        `📦 Trop d’images encodées (${(totalImageSize / 1024 / 1024).toFixed(
          2
        )} Mo). Réduis leur taille !`
      );
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
      const backendMsg = error.response?.data?.error || "Erreur inconnue.";
      toast.error(`❌ Erreur serveur : ${backendMsg}`);
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
    <AdminLayout newRequestsCount={newRequestsCount}>
      <div className="space-y-6">
        {/* En-tête : même structure que Members */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Paramètres du site
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les paramètres du site
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Sélectionner la version :
              </label>
              <Select
                value={language}
                onValueChange={(val) => setLanguage(val as "FR" | "NL" | "EN")}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sélectionner la version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">Version Français</SelectItem>
                  <SelectItem value="NL">Version Néerlandais</SelectItem>
                  <SelectItem value="EN">Version Anglais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link to="/dashboard">
              <Button variant="outline">Retour au tableau de bord</Button>
            </Link>
          </div>
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
            onClick={() => setIsConfirmationOpen(true)}
            className="px-8 py-3 text-lg bg-rwdm-blue text-white rounded"
          >
            Sauvegarder les paramètres
          </Button>
        </div>
        <ConfirmationDialog
          open={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={() => {
            handleSaveSettings();
            setIsConfirmationOpen(false);
          }}
          title="Confirmer la sauvegarde"
          message="Es-tu sûr de vouloir enregistrer les modifications des paramètres ?"
        />
      </div>
    </AdminLayout>
  );
};

export default Settings;
