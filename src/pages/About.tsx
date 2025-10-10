import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Lightbulb, Trophy, Handshake, Users, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { API_BASE, resolveMediaUrl, fetchConfig } from "@/lib/api-config";

/* --------------------------------- TYPES --------------------------------- */
interface TeamMember {
  id: number;
  deleted?: number | boolean;
}

type I18nTriplet = { FR: string; NL: string; EN: string };

interface AboutPayload {
  playersCount: string;
  experienceYears: string;
  nationalTrophies: string;
  youngTalents: string;
  historyDescription: I18nTriplet;
  historyPhoto: string;
  missionDescription: I18nTriplet;
  missionPhoto: string;
  approachDescription: I18nTriplet;
  approachPhoto: string;
  valueTitle1: I18nTriplet;
  valueDesc1: I18nTriplet;
  valueTitle2: I18nTriplet;
  valueDesc2: I18nTriplet;
  valueTitle3: I18nTriplet;
  valueDesc3: I18nTriplet;
  academyNames1: I18nTriplet;
  academyDescriptions1: I18nTriplet;
  academyPhotos1: string;
  academyNames2: I18nTriplet;
  academyDescriptions2: I18nTriplet;
  academyPhotos2: string;
  academyNames3: I18nTriplet;
  academyDescriptions3: I18nTriplet;
  academyPhotos3: string;
}

/* ------------------------------ SQUELETTE UI ----------------------------- */
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-16">
    <div className="text-center mb-12">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mx-auto mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mx-auto" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-28" />
      ))}
    </div>
    <div className="mb-16">
      <div className="flex justify-center mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mx-auto" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />
    </div>
    <div className="mb-16">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 mx-auto mb-8" />
      <div className="flex justify-center mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mx-auto" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />
    </div>
    <div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
        ))}
      </div>
    </div>
  </div>
);

/* --------------------------------- PAGE ---------------------------------- */
const About = () => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "histoire";
  const [tabValue, setTabValue] = useState(initialTab);
  const { t, lang } = useTranslation();
  const currentLang = lang.toUpperCase() as keyof I18nTriplet;

  const [loading, setLoading] = useState(true);

  const [aboutData, setAboutData] = useState<AboutPayload>({
    playersCount: "",
    experienceYears: "",
    nationalTrophies: "",
    youngTalents: "",
    historyDescription: { FR: "", NL: "", EN: "" },
    historyPhoto: "",
    missionDescription: { FR: "", NL: "", EN: "" },
    missionPhoto: "",
    approachDescription: { FR: "", NL: "", EN: "" },
    approachPhoto: "",
    valueTitle1: { FR: "", NL: "", EN: "" },
    valueDesc1: { FR: "", NL: "", EN: "" },
    valueTitle2: { FR: "", NL: "", EN: "" },
    valueDesc2: { FR: "", NL: "", EN: "" },
    valueTitle3: { FR: "", NL: "", EN: "" },
    valueDesc3: { FR: "", NL: "", EN: "" },
    academyNames1: { FR: "", NL: "", EN: "" },
    academyDescriptions1: { FR: "", NL: "", EN: "" },
    academyPhotos1: "",
    academyNames2: { FR: "", NL: "", EN: "" },
    academyDescriptions2: { FR: "", NL: "", EN: "" },
    academyPhotos2: "",
    academyNames3: { FR: "", NL: "", EN: "" },
    academyDescriptions3: { FR: "", NL: "", EN: "" },
    academyPhotos3: "",
  });

  const achievements = [
    { value: "+" + (aboutData.playersCount || "0"), label: t("players_trained") },
    { value: aboutData.experienceYears || "0", label: t("years_experience") },
    { value: aboutData.nationalTrophies || "0", label: t("national_trophies") },
    { value: "+" + (aboutData.youngTalents || "0"), label: t("young_talents") },
  ];

  /* --------------------------- FETCH: SETTINGS (LOCAL) --------------------------- */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/settings`, fetchConfig);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAboutData(data.about || aboutData);
      } catch (err) {
        console.error("Erreur fetch settings:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de la page (local).",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------ FETCH: TEAM MEMBERS (LOCAL) ------------------------ */
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/team-members`, {
          method: "GET",
          ...fetchConfig,
        });
        const data = await response.json();
        if (response.ok) {
          const active = (data || []).filter(
            (m: TeamMember & { deleted?: any }) => !m.deleted || m.deleted !== 1
          );
          setTeamMembers(active);
        } else {
          toast({
            title: "Erreur",
            description:
              data?.message || "Erreur lors de la récupération des membres (local).",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des membres d'équipe:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la récupération des membres d'équipe.",
          variant: "destructive",
        });
      }
    };
    fetchTeamMembers();
  }, [toast]);

  /* ------------------------------ GESTION TAB URL ------------------------------ */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "histoire" || tab === "mission" || tab === "approche") {
      setTabValue(tab);
      setTimeout(() => {
        const anchor = document.getElementById("academies");
        if (anchor) anchor.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const tabs = ["histoire", "mission", "approche"] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("histoire");
  const [prevTab, setPrevTab] = useState<(typeof tabs)[number]>("histoire");
  const direction = tabs.indexOf(activeTab) > tabs.indexOf(prevTab) ? 1 : -1;

  const tabs2 = ["histoire", "mission", "approche"] as const;
  const [activeTab2, setActiveTab2] = useState<(typeof tabs2)[number]>("histoire");
  const [prevTab2, setPrevTab2] = useState<(typeof tabs2)[number]>("histoire");
  const direction2 = useMemo(
    () => (tabs2.indexOf(activeTab2) > tabs2.indexOf(prevTab2) ? 1 : -1),
    [activeTab2, prevTab2]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rwdm-lightblue/10 to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:via-rwdm-blue/10 dark:to-rwdm-blue/40">
      <Helmet>
        <title>
          {lang === "fr"
            ? "RWDM Academy – Notre mission, histoire et valeurs"
            : lang === "nl"
            ? "RWDM Academy – Onze missie, geschiedenis en waarden"
            : "RWDM Academy – Our Mission, History & Values"}
        </title>
        <meta
          name="description"
          content={
            lang === "fr"
              ? "Apprenez-en plus sur l'identité, les valeurs, les académies et l'équipe derrière RWDM Academy."
              : lang === "nl"
              ? "Ontdek het verhaal, de waarden, de academies en het team achter RWDM Academy."
              : "Learn more about the identity, values, academies and team behind RWDM Academy."
          }
        />
        <meta
          name="keywords"
          content={
            lang === "fr"
              ? "RWDM, football, académie, mission, histoire, valeurs, équipe, Bruxelles, RWDM ForEver, Red ForEver, Brussels Eagles Football Academy"
              : lang === "nl"
              ? "RWDM, voetbal, academie, missie, geschiedenis, waarden, team, Brussel, RWDM ForEver, Red ForEver, Brussels Eagles Football Academy"
              : "RWDM, football, academy, mission, history, values, team, Brussels, RWDM ForEver, Red ForEver, Brussels Eagles Football Academy"
          }
        />
        <meta name="author" content="RWDM Academy" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rwdmacademy.be/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rwdmacademy.be/about" />
        <meta
          property="og:title"
          content={
            lang === "fr"
              ? "RWDM Academy – Qui sommes-nous ?"
              : lang === "nl"
              ? "RWDM Academy – Wie zijn we?"
              : "RWDM Academy – Who we are"
          }
        />
        <meta
          property="og:description"
          content={
            lang === "fr"
              ? "Découvrez nos valeurs, notre équipe et nos académies."
              : lang === "nl"
              ? "Leer meer over onze waarden, ons team en onze academies."
              : "Discover our values, our team, and our academies."
          }
        />
        <meta property="og:image" content="https://rwdmacademy.be/images/og-image.jpg" />
        <meta property="og:site_name" content="RWDM Academy" />
        <meta property="og:locale" content={lang === "nl" ? "nl_BE" : lang === "en" ? "en_US" : "fr_BE"} />
        <meta property="article:publisher" content="https://www.facebook.com/RWDMAcademy/" />
        <meta property="article:author" content="https://www.instagram.com/rwdm_academy/" />
      </Helmet>

      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Titre */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-rwdm-blue dark:text-white mb-4 relative inline-block">
                {t("about_title")}
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, black 0%, black 50%, red 50%, red 100%)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
                {t("about_subtitle")}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
            >
              {achievements.map((item, index) => (
                <Card
                  key={index}
                  className="border-0 bg-white/70 dark:bg-rwdm-darkblue/70 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <CardContent className="p-6 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-rwdm-red/5 to-rwdm-blue/10 dark:from-rwdm-red/10 dark:to-rwdm-blue/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    <h3 className="text-3xl md:text-4xl font-bold text-rwdm-red mb-2">
                      {item.value}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Tabs 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-3 md:w-auto w-full bg-white/70 dark:bg-rwdm-darkblue/70 p-1 rounded-lg overflow-hidden">
                  {["histoire", "mission", "approche"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setPrevTab(activeTab);
                        setActiveTab(tab as typeof activeTab);
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-md
                        ${
                          activeTab === tab
                            ? "bg-rwdm-red text-white"
                            : "text-gray-600 dark:text-gray-300 hover:text-rwdm-red"
                        }`}
                    >
                      {tab === "histoire" && (
                        <>
                          <Book className="inline-block mr-2 h-4 w-4" />
                          {t("tab_history")}
                        </>
                      )}
                      {tab === "mission" && (
                        <>
                          <Lightbulb className="inline-block mr-2 h-4 w-4" />
                          {t("tab_mission")}
                        </>
                      )}
                      {tab === "approche" && (
                        <>
                          <Trophy className="inline-block mr-2 h-4 w-4" />
                          {t("tab_approach")}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 100 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 * direction }}
                  transition={{ duration: 0.8 }}
                >
                  <Card className="glass-panel border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                          <img
                            src={
                              activeTab === "histoire"
                                ? resolveMediaUrl(aboutData.historyPhoto)
                                : activeTab === "mission"
                                ? resolveMediaUrl(aboutData.missionPhoto)
                                : resolveMediaUrl(aboutData.approachPhoto)
                            }
                            alt="Visuel"
                            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="w-full md:w-2/3">
                          <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                            {activeTab === "histoire"
                              ? t("history_title")
                              : activeTab === "mission"
                              ? t("mission_title")
                              : t("approach_title")}
                          </h3>
                          <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                            {activeTab === "histoire"
                              ? aboutData.historyDescription[currentLang]
                              : activeTab === "mission"
                              ? aboutData.missionDescription[currentLang]
                              : aboutData.approachDescription[currentLang]}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Tabs 2 (Académies) */}
            <motion.div
              id="academies"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-rwdm-blue dark:text-white mb-8 text-center relative inline-block">
                {t("academies_title")}
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-rwdm-red rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </h2>

              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-3 md:w-auto w-full bg-white/70 dark:bg-rwdm-darkblue/70 p-1 rounded-lg overflow-hidden">
                  {tabs2.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setPrevTab2(activeTab2);
                        setActiveTab2(tab);
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-md
                        ${
                          activeTab2 === tab
                            ? "bg-rwdm-red text-white"
                            : "text-gray-600 dark:text-gray-300 hover:text-rwdm-red"
                        }`}
                    >
                      {tab === "histoire" && (
                        <>
                          <Book className="inline-block mr-2 h-4 w-4" />
                          DB Aca.
                        </>
                      )}
                      {tab === "mission" && (
                        <>
                          <Lightbulb className="inline-block mr-2 h-4 w-4" />
                          EBF Aca.
                        </>
                      )}
                      {tab === "approche" && (
                        <>
                          <Trophy className="inline-block mr-2 h-4 w-4" />
                          DBF Aca.
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab2}
                  initial={{ opacity: 0, x: 100 * direction2 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 * direction2 }}
                  transition={{ duration: 0.8 }}
                >
                  <Card className="glass-panel border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                          <img
                            src={
                              activeTab2 === "histoire"
                                ? resolveMediaUrl(aboutData.academyPhotos1)
                                : activeTab2 === "mission"
                                ? resolveMediaUrl(aboutData.academyPhotos2)
                                : resolveMediaUrl(aboutData.academyPhotos3)
                            }
                            alt={`Académie ${activeTab2}`}
                            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="w-full md:w-2/3">
                          <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                            {activeTab2 === "histoire"
                              ? aboutData.academyNames1[currentLang]
                              : activeTab2 === "mission"
                              ? aboutData.academyNames2[currentLang]
                              : aboutData.academyNames3[currentLang]}
                          </h3>
                          <p className="whitespace-pre-line mb-4 text-gray-600 dark:text-gray-300">
                            {activeTab2 === "histoire"
                              ? aboutData.academyDescriptions1[currentLang]
                              : activeTab2 === "mission"
                              ? aboutData.academyDescriptions2[currentLang]
                              : aboutData.academyDescriptions3[currentLang]}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Valeurs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-rwdm-blue dark:text-white mb-8 text-center relative inline-block">
                {t("values_title")}
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-rwdm-red rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                      <Handshake className="h-8 w-8 text-rwdm-red" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                      {aboutData.valueTitle1[currentLang]}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {aboutData.valueDesc1[currentLang]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                      <Users className="h-8 w-8 text-rwdm-red" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                      {aboutData.valueTitle2[currentLang]}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {aboutData.valueDesc2[currentLang]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                      <ShieldCheck className="h-8 w-8 text-rwdm-red" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                      {aboutData.valueTitle3[currentLang]}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {aboutData.valueDesc3[currentLang]}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default About;
