import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
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

interface TeamMember {
  firstName: string;
  lastName: string;
  profilePicture: string;
  function: string;
  description: string;
  email: string;
}

const achievements = [
  { value: "45+", label: "Joueurs professionnels formés" },
  { value: "50", label: "Années d'expérience" },
  { value: "12", label: "Trophées nationaux" },
  { value: "300+", label: "Jeunes talents" },
];

const About = () => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") || "histoire"; // fallback = RWDM Academy
  const [tabValue, setTabValue] = useState(initialTab);

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
            À propos de RWDM Academy
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-rwdm-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Découvrez notre histoire, notre mission et notre équipe dédiée au
            développement des jeunes talents.
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
          <Tabs defaultValue="histoire" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 md:w-auto w-full bg-white/70 dark:bg-rwdm-darkblue/70 p-1">
                <TabsTrigger
                  value="histoire"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Histoire
                </TabsTrigger>
                <TabsTrigger
                  value="mission"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Mission
                </TabsTrigger>
                <TabsTrigger
                  value="approche"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Approche
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="histoire" className="mt-0">
              <motion.div
                key="histoire"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Histoire"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          Notre histoire
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Fondée en 1973, la RWDM Academy est née de la volonté
                          de former les futurs talents du football belge. Depuis
                          près de 50 ans, nous avons contribué au développement
                          de nombreux joueurs professionnels qui ont brillé tant
                          au niveau national qu'international.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Notre académie s'inscrit dans la riche tradition du
                          Royal White Daring Molenbeek, un club emblématique du
                          football belge, et perpétue ses valeurs d'excellence,
                          de persévérance et de respect.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="mission" className="mt-0">
              <motion.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Mission"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          Notre mission
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          À la RWDM Academy, notre mission est de former des
                          joueurs complets, tant sur le plan sportif que humain.
                          Nous croyons fermement que le football est un vecteur
                          d'éducation et d'intégration sociale.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Nous visons à offrir un encadrement de qualité pour
                          que chaque joueur puisse réaliser son potentiel et
                          contribuer à l'essor du football belge.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="approche" className="mt-0">
              <motion.div
                key="approche"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Approche"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          Notre approche
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Notre programme de formation s'appuie sur une
                          méthodologie éprouvée, alignée sur les standards de
                          l'Union Belge de Football. Chaque catégorie d'âge
                          bénéficie d'un programme adapté, conçu pour favoriser
                          une progression régulière et optimale.
                        </p>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Nos entraîneurs, tous diplômés, suivent régulièrement
                          des formations pour rester à la pointe des méthodes
                          d'entraînement modernes.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          L'accent est mis sur l'éducation, le respect et le
                          développement personnel, pour permettre à chaque
                          joueur de s'épanouir sur et en dehors du terrain.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
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
            Nos académies
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-rwdm-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </h2>

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            defaultValue="histoire"
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 md:w-auto w-full bg-white/70 dark:bg-rwdm-darkblue/70 p-1">
                <TabsTrigger
                  value="histoire"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Book className="mr-2 h-4 w-4" />
                  RWDM Aca.
                </TabsTrigger>
                <TabsTrigger
                  value="mission"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  BEF Aca.
                </TabsTrigger>
                <TabsTrigger
                  value="approche"
                  className="data-[state=active]:bg-rwdm-red data-[state=active]:text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  RFE Aca.
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="histoire" className="mt-0">
              <motion.div
                key="histoire"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Histoire"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          RWDM Academy
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Fondée en 1973, la RWDM Academy incarne depuis des
                          décennies la volonté du club de former les talents de
                          demain. Elle s’adresse aux jeunes footballeurs motivés
                          souhaitant progresser dans un environnement exigeant,
                          structuré et fidèle à l’ADN du RWDM.
                        </p>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Chaque joueur bénéficie d’un suivi personnalisé et
                          d’un encadrement assuré par des coachs diplômés,
                          régulièrement formés aux dernières méthodologies
                          d’entraînement. Les programmes sont adaptés à chaque
                          catégorie d’âge, pour garantir une progression
                          cohérente et durable.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          L’académie met un point d’honneur à transmettre les
                          valeurs fondamentales du club : respect, rigueur,
                          solidarité et passion du jeu. Bien plus qu’un centre
                          de formation, la RWDM Academy est un véritable lieu
                          d’apprentissage et d’épanouissement, sur le terrain
                          comme en dehors.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="mission" className="mt-0">
              <motion.div
                key="mission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Mission"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          Brussels Eagles Football Academy
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          La Brussels Eagles Football Academy, initiative du
                          RWDM, propose aux enfants de U9 à U12 deux séances
                          d'entraînement supplémentaires par semaine, les
                          mercredis et dimanches après-midi. Encadrés par des
                          coachs professionnels, ces entraînements visent à
                          compléter la formation reçue en club et à offrir un
                          cadre structuré, inclusif et exigeant.
                        </p>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Le programme met l’accent sur le développement
                          technique, la coordination, la vitesse, la
                          compréhension du jeu et la personnalité. Plus qu’une
                          académie, la BEFA transmet des valeurs essentielles
                          comme le respect, l’inclusion et l’éducation, pour
                          former des jeunes footballeurs complets sur le terrain
                          comme en dehors.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Ouverte de février à avril 2025, la BEFA accueille 12
                          joueurs par catégorie. L’inscription se fait par cycle
                          complet uniquement, au secrétariat du club (Tribune
                          Écluse, Stade Edmond Machtens). Le tarif est de 320€
                          pour les non-affiliés RWDM (équipement compris) et de
                          240€ pour les affiliés (équipement non compris).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="approche" className="mt-0">
              <motion.div
                key="approche"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-panel border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                        <img
                          src="/rwdmacademy.png"
                          alt="Approche"
                          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                          Red For Ever Academy
                        </h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Le RWDM et la commune de Molenbeek-Saint-Jean lancent
                          ensemble le projet RWDM ForEver, une nouvelle
                          structure visant à offrir à davantage de jeunes la
                          possibilité de porter les couleurs du club. Ce
                          programme vient compléter l’académie Elite et l’école
                          de formation du RWDM, avec un focus sur
                          l’accessibilité et l’intégration régionale.
                        </p>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          Dans un premier temps, RWDM ForEver s’adresse aux
                          jeunes joueurs de U14 à U17, leur offrant la chance
                          d’évoluer dans un cadre structuré au niveau régional.
                          Le projet vise à renforcer l’ancrage local du club
                          tout en garantissant une formation de qualité, fidèle
                          aux valeurs du RWDM.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          À terme, l’ambition est d’élargir cette initiative à
                          d'autres catégories d'âge et niveaux, afin de bâtir
                          une base solide de jeunes talents issus de la commune
                          et de ses environs. RWDM ForEver s’inscrit ainsi dans
                          une volonté commune de rendre le football accessible à
                          tous, sans compromis sur l’encadrement et la
                          progression.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Nos valeurs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-rwdm-blue dark:text-white mb-8 text-center relative inline-block">
            Nos valeurs
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
                  Solidarité
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Notre académie prône la solidarité entre joueurs, entraîneurs
                  et encadrants. Chacun doit pouvoir compter sur son équipe pour
                  progresser et s’épanouir.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-rwdm-red" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                  Respect
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Le respect des autres, des règles et de soi-même est une
                  valeur fondamentale. Nous transmettons une image exemplaire à
                  travers nos comportements sur et en dehors du terrain.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                  <ShieldCheck className="h-8 w-8 text-rwdm-red" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                  Fair-play
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Le fair-play est au cœur de notre philosophie. Nous
                  encourageons nos jeunes à jouer avec intégrité, en respectant
                  leurs adversaires et les valeurs du sport.
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
            Notre équipe
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-rwdm-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </h2>

          {teamMembers.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300">
              Il n'y a actuellement aucun membre enregistré dans la base de
              donnée de la plateforme.
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
