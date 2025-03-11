import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Users, Lightbulb, Trophy, Award, Heart } from "lucide-react";

const teamMembers = [
  {
    name: "Jean Dupont",
    role: "Directeur Sportif",
    image: "/placeholder.svg",
    bio: "Plus de 15 ans d'expérience dans la formation de jeunes talents.",
  },
  {
    name: "Marie Lambert",
    role: "Coordinatrice Technique",
    image: "/placeholder.svg",
    bio: "Ancienne joueuse professionnelle avec une passion pour le développement des jeunes.",
  },
  {
    name: "Ahmed Benali",
    role: "Entraîneur Principal",
    image: "/placeholder.svg",
    bio: "Diplômé UEFA Pro avec une approche innovante de la formation.",
  },
  {
    name: "Sophie Dubois",
    role: "Responsable Administrative",
    image: "/placeholder.svg",
    bio: "Assure la bonne gestion quotidienne de l'académie.",
  },
  {
    name: "Thomas Verhaeghe",
    role: "Préparateur Physique",
    image: "/placeholder.svg",
    bio: "Spécialiste en développement athlétique des jeunes sportifs.",
  },
  {
    name: "Luc Vandermeiren",
    role: "Entraîneur des Gardiens",
    image: "/placeholder.svg",
    bio: "Ancien gardien professionnel dédié à la formation des futures stars.",
  },
];

const achievements = [
  { value: "45+", label: "Joueurs professionnels formés" },
  { value: "50", label: "Années d'expérience" },
  { value: "12", label: "Trophées nationaux" },
  { value: "300+", label: "Jeunes talents" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rwdm-lightblue/10 to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:via-rwdm-blue/10 dark:to-rwdm-blue/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
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
              <Card className="glass-panel border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg"
                        alt="Histoire"
                        className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="w-full md:w-2/3">
                      <h3 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">
                        Notre histoire
                      </h3>
                      <p className="mb-4 text-gray-600 dark:text-gray-300">
                        Fondée en 1973, la RWDM Academy est née de la volonté de
                        former les futurs talents du football belge. Depuis près
                        de 50 ans, nous avons contribué au développement de
                        nombreux joueurs professionnels qui ont brillé tant au
                        niveau national qu'international.
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Notre académie s'inscrit dans la riche tradition du
                        Royal White Daring Molenbeek, un club emblématique du
                        football belge, et perpétue ses valeurs d'excellence, de
                        persévérance et de respect.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mission" className="mt-0">
              <Card className="glass-panel border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg"
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
                        Notre approche pédagogique vise à développer non
                        seulement les compétences techniques et tactiques, mais
                        aussi les valeurs essentielles comme le respect,
                        l'esprit d'équipe, la discipline et la résilience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="approche" className="mt-0">
              <Card className="glass-panel border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg"
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
                        Nos entraîneurs sont tous titulaires des diplômes requis
                        et suivent régulièrement des formations pour rester à la
                        pointe des méthodes d'entraînement modernes.
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        La RWDM Academy se distingue également par ses
                        infrastructures de qualité, offrant à nos jeunes joueurs
                        les meilleures conditions pour s'épanouir et progresser.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        {/* Our Values */}
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
                  <Award className="h-8 w-8 text-rwdm-red" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                  Excellence
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous visons l'excellence dans tous les aspects de notre
                  académie, en encourageant chaque joueur à donner le meilleur
                  de lui-même.
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
                  valeur fondamentale que nous inculquons à tous nos jeunes
                  joueurs.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-rwdm-red/10 rounded-full mb-4">
                  <Heart className="h-8 w-8 text-rwdm-red" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-rwdm-blue dark:text-white">
                  Passion
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  La passion du football nous anime et nous pousse à nous
                  dépasser chaque jour pour offrir la meilleure formation
                  possible.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        {/* Team Section */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="group h-full glass-panel border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden h-40 bg-gradient-to-r from-rwdm-red/20 to-rwdm-blue/20">
                      <div className="absolute inset-0 bg-rwdm-blue/20 group-hover:bg-rwdm-red/20 transition-colors duration-300"></div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-rwdm-darkblue group-hover:border-rwdm-red transition-colors duration-300 shadow-lg">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback className="bg-rwdm-blue text-white text-lg">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="pt-16 px-6 pb-6 text-center">
                      <h3 className="text-xl font-bold mb-1 text-rwdm-blue dark:text-white group-hover:text-rwdm-red transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-rwdm-red font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {member.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="py-6 px-4 mt-8 glass-panel">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} RWDM Academy. Tous droits
            réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
