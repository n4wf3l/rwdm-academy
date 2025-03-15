
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Shield, FileText, BookOpen, Cookie } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Legal = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const location = useLocation();

  // Utiliser les paramètres d'URL pour définir l'onglet actif
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["privacy", "terms", "legal", "cookies"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-12 pt-32 flex-grow">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="mr-4 p-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">Retour à l'accueil</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">Informations Légales</h1>
        </div>

        <div className="bg-white dark:bg-rwdm-darkblue/80 rounded-xl shadow-md p-6 mb-8">
          <Tabs defaultValue="privacy" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Confidentialité</span>
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>CGU</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Mentions Légales</span>
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                <span>Cookies</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">Politique de Confidentialité</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}
                  </p>
                  <Separator className="my-4" />
                </div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">1. Introduction</h3>
                  <p>
                    Bienvenue sur la plateforme RWDM Academy. Nous nous engageons à protéger la vie privée et les données personnelles des utilisateurs de notre service. Cette politique de confidentialité explique comment nous recueillons, utilisons, partageons et protégeons vos informations personnelles.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">2. Données collectées</h3>
                  <p>Nous collectons les données suivantes lors de votre utilisation de notre plateforme :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Informations d'identification (nom, prénom, date de naissance)</li>
                    <li>Coordonnées (adresse, email, numéro de téléphone)</li>
                    <li>Informations sportives (club actuel, position, expérience)</li>
                    <li>Données médicales de base pour garantir la sécurité lors des activités sportives</li>
                    <li>Photos et signatures pour les documents officiels</li>
                    <li>Données de navigation et cookies techniques</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">3. Utilisation des données</h3>
                  <p>Nous utilisons vos données personnelles pour :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Gérer votre inscription à l'académie RWDM</li>
                    <li>Traiter vos demandes de test de sélection</li>
                    <li>Gérer les décharges de responsabilité et les rapports d'accident</li>
                    <li>Vous contacter concernant vos rendez-vous et demandes</li>
                    <li>Améliorer nos services et la sécurité de notre plateforme</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">4. Base légale du traitement</h3>
                  <p>
                    Le traitement de vos données personnelles est basé sur :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Votre consentement explicite lors de la soumission des formulaires</li>
                    <li>La nécessité contractuelle pour vous fournir nos services</li>
                    <li>Notre intérêt légitime à améliorer et sécuriser nos services</li>
                    <li>Nos obligations légales</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">5. Partage des données</h3>
                  <p>
                    Nous pouvons partager vos données avec les partenaires suivants :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>L'Union Royale Belge des Sociétés de Football-Association (URBSFA) pour les inscriptions officielles</li>
                    <li>Les prestataires de services informatiques qui nous aident à opérer notre plateforme</li>
                    <li>Les autorités compétentes lorsque la loi l'exige</li>
                  </ul>
                  <p>
                    Nous ne vendons jamais vos données personnelles à des tiers.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">6. Durée de conservation</h3>
                  <p>
                    Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>La durée de votre adhésion à l'académie RWDM</li>
                    <li>La période requise par la loi pour certains documents</li>
                    <li>Jusqu'à 3 ans après votre dernière activité pour les demandes d'information</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">7. Vos droits</h3>
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Droit d'accès à vos données personnelles</li>
                    <li>Droit de rectification des informations inexactes</li>
                    <li>Droit à l'effacement (droit à l'oubli)</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Droit d'opposition au traitement</li>
                    <li>Droit de retirer votre consentement à tout moment</li>
                  </ul>
                  <p>
                    Pour exercer ces droits, veuillez nous contacter à l'adresse : privacy@rwdm-academy.be
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">8. Sécurité des données</h3>
                  <p>
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte, l'accès non autorisé, la divulgation, l'altération ou la destruction.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">9. Transferts internationaux</h3>
                  <p>
                    Vos données sont principalement stockées et traitées dans l'Union européenne. Si un transfert hors UE est nécessaire, nous nous assurons que des garanties appropriées sont en place pour protéger vos données conformément au RGPD.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">10. Contact</h3>
                  <p>
                    Pour toute question relative à cette politique de confidentialité ou à l'exercice de vos droits, veuillez nous contacter à l'adresse suivante :
                  </p>
                  <p className="font-medium">
                    RWDM Academy<br />
                    Rue Charles Malis 61<br />
                    1080 Molenbeek-Saint-Jean<br />
                    privacy@rwdm-academy.be
                  </p>
                  <p>
                    Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données belge.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terms" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">Conditions Générales d'Utilisation</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}
                  </p>
                  <Separator className="my-4" />
                </div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">1. Acceptation des conditions</h3>
                  <p>
                    En accédant et en utilisant la plateforme RWDM Academy, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">2. Description du service</h3>
                  <p>
                    La plateforme RWDM Academy est un service en ligne permettant aux utilisateurs de s'inscrire à l'académie de football RWDM, de soumettre des demandes de tests de sélection, de signer des décharges de responsabilité et de déclarer des accidents. Le service comprend également la gestion des rendez-vous et la communication avec l'académie.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">3. Conditions d'inscription</h3>
                  <p>
                    Pour utiliser notre plateforme, vous devez :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Avoir l'âge minimum requis pour l'inscription à l'académie</li>
                    <li>Fournir des informations exactes, complètes et à jour</li>
                    <li>Si vous êtes mineur, obtenir le consentement d'un parent ou tuteur légal</li>
                    <li>Respecter toutes les lois applicables lors de l'utilisation du service</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">4. Compte utilisateur et sécurité</h3>
                  <p>
                    Lorsque vous créez un compte, vous êtes responsable de :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                    <li>Toutes les activités qui se produisent sous votre compte</li>
                    <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">5. Utilisation acceptable</h3>
                  <p>
                    Vous vous engagez à ne pas :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Utiliser le service d'une manière qui pourrait l'endommager ou le rendre indisponible</li>
                    <li>Soumettre des informations fausses ou trompeuses</li>
                    <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
                    <li>Utiliser des robots, scrapers ou autres moyens automatisés pour accéder au service</li>
                    <li>Contourner les mesures de sécurité ou les limitations d'accès</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">6. Droits de propriété intellectuelle</h3>
                  <p>
                    Tous les contenus présents sur la plateforme RWDM Academy (logos, textes, graphiques, photos, etc.) sont protégés par les droits de propriété intellectuelle. Vous ne pouvez pas les reproduire, modifier ou distribuer sans notre autorisation écrite préalable.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">7. Responsabilité</h3>
                  <p>
                    La plateforme RWDM Academy est fournie "telle quelle" et "selon disponibilité". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. Nous ne sommes pas responsables des dommages indirects résultant de votre utilisation du service.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">8. Modification des conditions</h3>
                  <p>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Les changements prennent effet dès leur publication sur la plateforme. L'utilisation continue du service après la modification constitue votre acceptation des nouvelles conditions.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">9. Résiliation</h3>
                  <p>
                    Nous pouvons suspendre ou résilier votre accès au service en cas de violation de ces conditions. Vous pouvez également demander la suppression de votre compte à tout moment.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">10. Loi applicable et juridiction</h3>
                  <p>
                    Ces conditions sont régies par le droit belge. Tout litige relatif à ces conditions ou à l'utilisation du service sera soumis à la compétence exclusive des tribunaux de Bruxelles.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">11. Contact</h3>
                  <p>
                    Pour toute question concernant ces conditions, veuillez nous contacter à :
                  </p>
                  <p className="font-medium">
                    RWDM Academy<br />
                    Rue Charles Malis 61<br />
                    1080 Molenbeek-Saint-Jean<br />
                    contact@rwdm-academy.be
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="legal" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">Mentions Légales</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}
                  </p>
                  <Separator className="my-4" />
                </div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">1. Informations légales</h3>
                  <p>
                    Cette plateforme est éditée par :
                  </p>
                  <p className="font-medium">
                    RWDM Academy<br />
                    Forme juridique : ASBL<br />
                    Numéro d'entreprise : BE0123456789<br />
                    Adresse : Rue Charles Malis 61, 1080 Molenbeek-Saint-Jean<br />
                    Téléphone : +32 2 123 45 67<br />
                    Email : contact@rwdm-academy.be
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">2. Responsable de publication</h3>
                  <p>
                    Le responsable de la publication de cette plateforme est Jean Dupont, en qualité de Directeur de l'Académie.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">3. Hébergement</h3>
                  <p>
                    Cette plateforme est hébergée par :
                  </p>
                  <p className="font-medium">
                    Lovable<br />
                    Adresse : 16 rue de Dunkerque, 75010 Paris, France<br />
                    Site web : www.lovable.dev
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">4. Propriété intellectuelle</h3>
                  <p>
                    L'ensemble du contenu de cette plateforme (textes, images, logos, etc.) est la propriété exclusive du RWDM Academy ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">5. Liens hypertextes</h3>
                  <p>
                    La plateforme RWDM Academy peut contenir des liens vers d'autres sites. Nous n'exerçons aucun contrôle sur le contenu de ces sites et déclinons toute responsabilité quant à leur contenu.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">6. Responsabilité</h3>
                  <p>
                    Nous nous efforçons d'assurer l'exactitude et la mise à jour des informations présentes sur notre plateforme. Cependant, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. En conséquence, nous déclinons toute responsabilité pour toute imprécision, inexactitude ou omission.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">7. Droit applicable et juridiction compétente</h3>
                  <p>
                    Les présentes mentions légales sont soumises au droit belge. En cas de litige, les tribunaux de Bruxelles seront seuls compétents.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cookies" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-4">Politique de Cookies</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}
                  </p>
                  <Separator className="my-4" />
                </div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">1. Qu'est-ce qu'un cookie ?</h3>
                  <p>
                    Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez notre plateforme. Ces fichiers permettent de reconnaître votre navigateur et d'améliorer votre expérience utilisateur.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">2. Types de cookies utilisés</h3>
                  <p>
                    Notre plateforme utilise différents types de cookies :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement de la plateforme, ils vous permettent d'utiliser ses fonctionnalités principales</li>
                    <li><strong>Cookies de préférences :</strong> Permettent de mémoriser vos préférences (langue, paramètres d'affichage)</li>
                    <li><strong>Cookies de session :</strong> Stockent temporairement des informations sur votre navigation</li>
                    <li><strong>Cookies d'authentification :</strong> Reconnaissent l'utilisateur après sa connexion</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">3. Finalités des cookies</h3>
                  <p>
                    Les cookies nous permettent de :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Assurer le bon fonctionnement de la plateforme</li>
                    <li>Mémoriser vos préférences de navigation</li>
                    <li>Sécuriser votre connexion</li>
                    <li>Analyser l'utilisation de notre plateforme pour l'améliorer</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">4. Gestion des cookies</h3>
                  <p>
                    Vous pouvez à tout moment choisir de désactiver les cookies en modifiant les paramètres de votre navigateur. Voici comment procéder sur les navigateurs les plus courants :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Chrome :</strong> Menu → Paramètres → Afficher les paramètres avancés → Confidentialité → Paramètres de contenu</li>
                    <li><strong>Firefox :</strong> Menu → Options → Vie privée → Historique → Utiliser les paramètres personnalisés pour l'historique</li>
                    <li><strong>Safari :</strong> Préférences → Confidentialité</li>
                    <li><strong>Edge :</strong> Menu → Paramètres → Afficher les paramètres avancés → Confidentialité et services</li>
                  </ul>
                  <p>
                    Veuillez noter que la désactivation des cookies peut affecter certaines fonctionnalités de notre plateforme.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">5. Durée de conservation des cookies</h3>
                  <p>
                    La durée de conservation des cookies varie selon leur type :
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Les cookies de session sont temporaires et expirent lorsque vous fermez votre navigateur</li>
                    <li>Les cookies persistants restent sur votre appareil jusqu'à leur expiration ou suppression manuelle (généralement entre 1 jour et 13 mois)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">6. Cookies tiers</h3>
                  <p>
                    Notre plateforme peut utiliser des services tiers qui déposent également des cookies, notamment pour les fonctionnalités de partage sur les réseaux sociaux. Nous n'avons aucun contrôle sur ces cookies. Pour plus d'informations, veuillez consulter les politiques de confidentialité de ces services tiers.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">7. Modifications de la politique de cookies</h3>
                  <p>
                    Nous nous réservons le droit de modifier cette politique à tout moment. Les changements prennent effet dès leur publication sur la plateforme. Nous vous encourageons à consulter régulièrement cette page pour rester informé des mises à jour.
                  </p>

                  <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">8. Contact</h3>
                  <p>
                    Pour toute question concernant notre politique de cookies, veuillez nous contacter à :
                  </p>
                  <p className="font-medium">
                    RWDM Academy<br />
                    Email : privacy@rwdm-academy.be
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
