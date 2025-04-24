import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Book,
  Handshake,
  Heart,
  Lightbulb,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamMember {
  firstName: string;
  lastName: string;
  profilePicture: string;
  function: string;
  description: string;
  email: string;
}
const About = () => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "histoire"; // fallback = RWDM Academy
  const [tabValue, setTabValue] = useState(initialTab);
  const { t, lang } = useTranslation();
  const currentLang = lang.toUpperCase();
  const [aboutData, setAboutData] = useState({
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
    { value: "+" + aboutData.playersCount, label: t("players_trained") },
    { value: aboutData.experienceYears, label: t("years_experience") },
    { value: aboutData.nationalTrophies, label: t("national_trophies") },
    { value: "+" + aboutData.youngTalents, label: t("young_talents") },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        const data = await res.json();
        setAboutData(data.about);
      } catch (err) {
        console.error("Erreur fetch settings:", err);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab");

    if (tab === "histoire" || tab === "mission" || tab === "approche") {
      setTabValue(tab);

      // Ajout du scroll vers l’ancre après avoir défini l’onglet
      setTimeout(() => {
        const anchor = document.getElementById("academies");
        if (anchor) {
          anchor.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Petit délai pour que les animations aient le temps de s’installer
    }
  }, []);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch("http://localhost:5000/api/team-members", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok) {
          setTeamMembers(data);
        } else {
          toast({
            title: "Erreur",
            description:
              data.message ||
              "Erreur lors de la récupération des membres d'équipe.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des membres d'équipe:",
          error
        );
        toast({
          title: "Erreur",
          description: "Erreur lors de la récupération des membres d'équipe.",
          variant: "destructive",
        });
      }
    }
    fetchTeamMembers();
  }, [toast]);

  const tabs = ["histoire", "mission", "approche"] as const;

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("histoire");
  const [prevTab, setPrevTab] = useState<(typeof tabs)[number]>("histoire");

  const direction = tabs.indexOf(activeTab) > tabs.indexOf(prevTab) ? 1 : -1;
  const tabs2 = ["histoire", "mission", "approche"] as const;
  const [activeTab2, setActiveTab2] =
    useState<(typeof tabs2)[number]>("histoire");
  const [prevTab2, setPrevTab2] = useState<(typeof tabs2)[number]>("histoire");

  const direction2 = useMemo(() => {
    return tabs2.indexOf(activeTab2) > tabs2.indexOf(prevTab2) ? 1 : -1;
  }, [activeTab2, prevTab2]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rwdm-lightblue/10 to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:via-rwdm-blue/10 dark:to-rwdm-blue/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        {/* Titre et description */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-rwdm-blue dark:text-white mb-4 relative inline-block">
            {t("about_title")}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-rwdm-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            {t("about_subtitle")}
          </p>
        </motion.div>

        {/* Stats Section */}
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

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          {/* Onglets custom */}
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

          {/* Contenu animé */}
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
                            ? aboutData.historyPhoto
                            : activeTab === "mission"
                            ? aboutData.missionPhoto
                            : aboutData.approachPhoto || "/fallback.png"
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

        {/* Tabs Section 2 */}
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
                      RWDM Aca.
                    </>
                  )}
                  {tab === "mission" && (
                    <>
                      <Lightbulb className="inline-block mr-2 h-4 w-4" />
                      BEF Aca.
                    </>
                  )}
                  {tab === "approche" && (
                    <>
                      <Trophy className="inline-block mr-2 h-4 w-4" />
                      RFE Aca.
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
                            ? aboutData.academyPhotos1
                            : activeTab2 === "mission"
                            ? aboutData.academyPhotos2
                            : aboutData.academyPhotos3 || "/fallback.png"
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

        {/* Nos valeurs */}
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

        {/* Notre équipe */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-rwdm-blue dark:text-white mb-8 text-center relative inline-block">
            {t("team_title")}
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-rwdm-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </h2>

          {teamMembers.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300">
              {t("no_team_members")}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.email || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="group h-full glass-panel border-0 shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <img
                        src={member.profilePicture}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-32 h-32 object-cover rounded-full mx-auto"
                      />
                      <h3 className="text-xl font-bold mb-1 text-rwdm-blue dark:text-white group-hover:text-rwdm-red transition-colors duration-300">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{member.function}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
