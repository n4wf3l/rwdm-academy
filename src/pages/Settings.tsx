import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GeneralSettings from "@/components/settings/GeneralSettings";
import AboutSettings from "@/components/settings/AboutSettings";
import ContactSettings from "@/components/settings/ContactSettings";
import axios from "axios";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings: React.FC = () => {
  // --- Mode Maintenance ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // --- Feedback nombre de nouvelles demandes ---
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  // --- Langue affichage des champs ---
  const [language, setLanguage] = useState<"FR" | "NL" | "EN">("FR");

  // --- Confirmation modal ---
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isMaintenanceConfirmOpen, setIsMaintenanceConfirmOpen] =
    useState(false);
  // --- CHAMPS "General" ---
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

  // --- CHAMPS "About" ---
  const [playersCount, setPlayersCount] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
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
  const [academyNames1, setAcademyNames1] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyDescriptions1, setAcademyDescriptions1] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyPhotos1, setAcademyPhotos1] = useState("");
  const [academyNames2, setAcademyNames2] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyDescriptions2, setAcademyDescriptions2] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyPhotos2, setAcademyPhotos2] = useState("");
  const [academyNames3, setAcademyNames3] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyDescriptions3, setAcademyDescriptions3] = useState({
    FR: "",
    NL: "",
    EN: "",
  });
  const [academyPhotos3, setAcademyPhotos3] = useState("");

  // --- CHAMPS "Contact" ---
  const [openingHours, setOpeningHours] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [agreed, setAgreed] = useState(false);

  // --- Récupérer count "Nouveau" ---
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setNewRequestsCount(
          data.filter((r: any) => r.status === "Nouveau").length
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchCount();
  }, []);

  // --- Chargement initial de TOUTES les settings ---
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/settings");
        const data = res.data;
        setMaintenanceMode(Boolean(data.maintenanceMode));
        setLanguage(data.language || "FR");
        // general
        setSiteColor1(data.general.siteColor1);
        setSiteColor2(data.general.siteColor2);
        setLogo(data.general.logo);
        setClubName(data.general.clubName);
        setClubAddress(data.general.clubAddress);
        setPostalCode(data.general.postalCode);
        setCommune(data.general.commune);
        setCountry(data.general.country);
        setEmail(data.general.email);
        setFacebookUrl(data.general.facebookUrl);
        setInstagramUrl(data.general.instagramUrl);
        // about
        setPlayersCount(String(data.about.playersCount));
        setExperienceYears(String(data.about.experienceYears));
        setNationalTrophies(String(data.about.nationalTrophies));
        setYoungTalents(String(data.about.youngTalents));
        setHistoryDescription(data.about.historyDescription);
        setHistoryPhoto(data.about.historyPhoto);
        setMissionDescription(data.about.missionDescription);
        setMissionPhoto(data.about.missionPhoto);
        setApproachDescription(data.about.approachDescription);
        setApproachPhoto(data.about.approachPhoto);
        setValueTitle1(data.about.valueTitle1);
        setValueDesc1(data.about.valueDesc1);
        setValueTitle2(data.about.valueTitle2);
        setValueDesc2(data.about.valueDesc2);
        setValueTitle3(data.about.valueTitle3);
        setValueDesc3(data.about.valueDesc3);
        setAcademyNames1(data.about.academyNames1);
        setAcademyDescriptions1(data.about.academyDescriptions1);
        setAcademyPhotos1(data.about.academyPhotos1);
        setAcademyNames2(data.about.academyNames2);
        setAcademyDescriptions2(data.about.academyDescriptions2);
        setAcademyPhotos2(data.about.academyPhotos2);
        setAcademyNames3(data.about.academyNames3);
        setAcademyDescriptions3(data.about.academyDescriptions3);
        setAcademyPhotos3(data.about.academyPhotos3);
        // contact
        setOpeningHours(data.contact.openingHours);
        setVatNumber(data.contact.vatNumber);
        setCompanyNumber(data.contact.companyNumber);
        setAccountName(data.contact.accountName);
      } catch (err) {
        console.error("Erreur chargement settings:", err);
      }
    })();
  }, []);

  // --- Toggle maintenance via endpoint dédié ---
  const handleToggleMaintenance = async () => {
    setTogglingMaintenance(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/settings/maintenance",
        {
          maintenanceMode: !maintenanceMode,
        }
      );
      setMaintenanceMode(res.data.maintenanceMode);
      toast.success(
        `Mode maintenance ${res.data.maintenanceMode ? "activé" : "désactivé"}.`
      );
    } catch (err) {
      console.error(err);
      toast.error("Impossible de changer le mode maintenance.");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  // --- Sauvegarde TOUTE la config ---
  const handleSaveSettings = async () => {
    try {
      const settingsPayload = {
        maintenanceMode,
        language,
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
          playersCount: Number(playersCount),
          experienceYears: Number(experienceYears),
          nationalTrophies: Number(nationalTrophies),
          youngTalents: Number(youngTalents),
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
          openingHours,
          vatNumber,
          companyNumber,
          accountName,
        },
      };
      await axios.put("http://localhost:5000/api/settings", settingsPayload);
      toast.success("Les paramètres ont été enregistrés !");
    } catch (err: any) {
      console.error(err);
      toast.error(
        `Erreur serveur : ${err.response?.data?.error || "inconnue"}`
      );
    }
  };

  return (
    <AdminLayout newRequestsCount={newRequestsCount}>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* ←── Header + toggle maintenance */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <div>
            <h1 className="text-3xl font-bold">Paramètres du site</h1>
            <p className="text-gray-600">Gestion globale & maintenance</p>
          </div>
          <div className="flex gap-4">
            {/* Sélecteur de version */}
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">Français</SelectItem>
                <SelectItem value="NL">Néerlandais</SelectItem>
                <SelectItem value="EN">Anglais</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton maintenance */}
            <Button
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={() => setIsMaintenanceConfirmOpen(true)}
              disabled={togglingMaintenance}
            >
              {togglingMaintenance
                ? "…"
                : maintenanceMode
                ? "Désactiver maintenance"
                : "Activer maintenance"}
            </Button>
          </div>
        </motion.div>

        {/* ←── Avertissement */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Lorsqu’un mot est modifié dans une langue, n’oubliez pas de le
                mettre à jour dans toutes les autres langues afin de garantir la{" "}
                <strong>cohérence</strong>. Lorsque le mode maintenance est
                activé, tous les visiteurs sont redirigés vers une vue de
                maintenance au lieu des formulaires.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ←── Onglets de réglages */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-3 border-b mb-4">
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
                openingHours={openingHours}
                setOpeningHours={setOpeningHours}
                vatNumber={vatNumber}
                setVatNumber={setVatNumber}
                companyNumber={companyNumber}
                setCompanyNumber={setCompanyNumber}
                accountName={accountName}
                setAccountName={setAccountName}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ←── Bouton Sauvegarder */}
        <motion.div
          className="mt-6 flex justify-center"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={() => setIsConfirmationOpen(true)}>
            Sauvegarder les modifications
          </Button>
        </motion.div>

        {/* ←── ConfirmationDialog */}
        <ConfirmationDialog
          open={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setAgreed(false);
          }}
          onConfirm={() => {
            setIsConfirmationOpen(false);
            handleSaveSettings();
          }}
          title="Confirmer la sauvegarde"
          message={
            <>
              <p>Êtes-vous sûr de vouloir enregistrer ces paramètres ?</p>
              <label className="mt-4 flex items-center text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-2 h-4 w-4 border-gray-300 rounded"
                />
                J’ai mis à jour toutes les traductions.
              </label>
            </>
          }
          confirmDisabled={!agreed}
        />
        <ConfirmationDialog
          open={isMaintenanceConfirmOpen}
          onClose={() => setIsMaintenanceConfirmOpen(false)}
          title={
            maintenanceMode ? "Confirmer désactivation" : "Confirmer activation"
          }
          message={
            maintenanceMode
              ? "Es-tu sûr de vouloir quitter le mode maintenance ?"
              : "Es-tu sûr de vouloir activer le mode maintenance ?"
          }
          onConfirm={() => {
            handleToggleMaintenance();
            setIsMaintenanceConfirmOpen(false);
          }}
          confirmDisabled={false}
        />
      </motion.div>
    </AdminLayout>
  );
};

export default Settings;
