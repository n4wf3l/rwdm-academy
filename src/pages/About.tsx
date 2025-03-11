
import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3">
            À propos de RWDM Academy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez notre histoire, notre mission et notre engagement envers le développement des jeunes talents.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full glass-panel">
              <CardHeader>
                <CardTitle>Notre Histoire</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Fondée en 1973, la RWDM Academy est née de la volonté de former les futurs talents du football belge. 
                  Depuis près de 50 ans, nous avons contribué au développement de nombreux joueurs professionnels 
                  qui ont brillé tant au niveau national qu'international.
                </p>
                <p>
                  Notre académie s'inscrit dans la riche tradition du Royal White Daring Molenbeek, 
                  un club emblématique du football belge, et perpétue ses valeurs d'excellence, 
                  de persévérance et de respect.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full glass-panel">
              <CardHeader>
                <CardTitle>Notre Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  À la RWDM Academy, notre mission est de former des joueurs complets, tant sur le plan sportif que humain. 
                  Nous croyons fermement que le football est un vecteur d'éducation et d'intégration sociale.
                </p>
                <p>
                  Notre approche pédagogique vise à développer non seulement les compétences techniques et tactiques, 
                  mais aussi les valeurs essentielles comme le respect, l'esprit d'équipe, la discipline et la résilience.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Notre Approche</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Notre programme de formation s'appuie sur une méthodologie éprouvée, alignée sur les standards 
                de l'Union Belge de Football. Chaque catégorie d'âge bénéficie d'un programme adapté, 
                conçu pour favoriser une progression régulière et optimale.
              </p>
              <p className="mb-4">
                Nos entraîneurs sont tous titulaires des diplômes requis et suivent régulièrement des formations 
                pour rester à la pointe des méthodes d'entraînement modernes.
              </p>
              <p>
                La RWDM Academy se distingue également par ses infrastructures de qualité, 
                offrant à nos jeunes joueurs les meilleures conditions pour s'épanouir et progresser.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <footer className="py-6 px-4 mt-8 glass-panel">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} RWDM Academy. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
