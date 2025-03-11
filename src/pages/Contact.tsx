import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Info } from "lucide-react";

const Contact = () => {
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
            Contactez-nous
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Vous avez des questions? N'hésitez pas à nous contacter. Notre
            équipe est là pour vous aider.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full glass-panel">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Envoyez-nous un message
                </h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                      >
                        Nom
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-input-base"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-input-base"
                        placeholder="Votre email"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-1"
                    >
                      Sujet
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="form-input-base"
                      placeholder="Sujet de votre message"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="form-input-base resize-none"
                      placeholder="Votre message"
                    ></textarea>
                  </div>
                  <Button className="w-full md:w-auto button-transition bg-rwdm-red hover:bg-rwdm-red/90">
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full glass-panel">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Coordonnées</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Notre adresse</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Stade Edmond Machtens
                        <br />
                        Avenue Charles Malis 61
                        <br />
                        1080 Molenbeek-Saint-Jean
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        academy@rwdm.be
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Téléphone</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        +32 2 410 53 03
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Heures d'ouverture</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Lundi - Vendredi: 9h - 17h
                        <br />
                        Samedi: 9h - 12h
                        <br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Informations</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        N° TVA: BE0123456789
                        <br />
                        N° d'entreprise: 0123.456.789
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-panel">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Comment nous trouver
              </h2>
              <div className="rounded-lg overflow-hidden h-96 bg-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.123456789!2d4.324926253706253!3d50.86071471803977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c3f1abcdef01%3A0x123456789abcdef!2sRacing%20White%20Daring%20Molenbeek!5e0!3m2!1sfr!2sbe!4v1690000000000&maptype=satellite&style=dark"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>
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

export default Contact;
