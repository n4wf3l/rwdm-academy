
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-rwdm-blue">Politique de Confidentialité</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            L'Académie RWDM s'engage à protéger la vie privée et les données personnelles de ses utilisateurs. 
            Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons 
            vos informations lorsque vous utilisez notre plateforme d'inscription en ligne et nos services.
          </p>
          <p className="mb-4">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Responsable du traitement</h2>
          <p className="mb-4">
            RWDM Academy<br />
            Rue Charles Malis, 61<br />
            1080 Molenbeek-Saint-Jean<br />
            Belgique<br />
            Email: privacy@rwdm-academy.be
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Données personnelles collectées</h2>
          <p className="mb-4">
            Nous collectons les données personnelles suivantes :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Informations d'identification (nom, prénom, date de naissance)</li>
            <li>Coordonnées (adresse, numéro de téléphone, email)</li>
            <li>Informations relatives à la santé dans le cadre des déclarations d'accidents</li>
            <li>Données des parents/tuteurs pour les joueurs mineurs</li>
            <li>Photos/images dans le cadre des activités du club (avec consentement)</li>
            <li>Informations sur les antécédents sportifs (clubs précédents)</li>
            <li>Signatures électroniques</li>
          </ul>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Finalités du traitement</h2>
          <p className="mb-4">
            Nous utilisons vos données personnelles pour les finalités suivantes :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Gestion des inscriptions et adhésions à l'académie</li>
            <li>Organisation des tests de sélection</li>
            <li>Traitement des déclarations d'accidents</li>
            <li>Communication avec les joueurs et leurs parents</li>
            <li>Gestion administrative des licences et affiliations</li>
            <li>Respect des obligations légales et réglementaires</li>
            <li>Amélioration de nos services</li>
          </ul>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Base juridique du traitement</h2>
          <p className="mb-4">
            Le traitement de vos données est fondé sur :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>L'exécution du contrat d'adhésion à l'académie</li>
            <li>Votre consentement explicite (notamment pour l'utilisation des photos)</li>
            <li>Le respect de nos obligations légales</li>
            <li>Notre intérêt légitime à améliorer et gérer nos services</li>
          </ul>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Conservation des données</h2>
          <p className="mb-4">
            Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, 
            généralement pendant la durée de votre relation avec l'académie et jusqu'à 3 ans après la fin de cette relation, 
            sauf obligation légale de conservation plus longue (notamment pour les données comptables et les documents relatifs aux accidents).
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Destinataires des données</h2>
          <p className="mb-4">
            Vos données personnelles peuvent être partagées avec :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Le personnel administratif et sportif de l'académie RWDM</li>
            <li>La Fédération Royale Belge de Football (URBSFA) dans le cadre des affiliations</li>
            <li>Les compagnies d'assurance en cas de déclaration d'accident</li>
            <li>Des prestataires de services techniques (hébergement, maintenance informatique)</li>
            <li>Les autorités publiques lorsque la loi l'exige</li>
          </ul>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Sécurité des données</h2>
          <p className="mb-4">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
            contre la perte, l'accès non autorisé, la divulgation, l'altération et la destruction.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Vos droits</h2>
          <p className="mb-4">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à l'effacement (droit à l'oubli)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit de retirer votre consentement à tout moment</li>
            <li>Droit d'introduire une réclamation auprès d'une autorité de contrôle</li>
          </ul>
          <p className="mb-4">
            Pour exercer ces droits, veuillez nous contacter à l'adresse email : privacy@rwdm-academy.be
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Modifications de la politique de confidentialité</h2>
          <p className="mb-4">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
            Toute modification sera publiée sur cette page avec la date de mise à jour. 
            Nous vous encourageons à consulter régulièrement cette politique pour rester informé de nos pratiques en matière de protection des données.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p className="mb-4">
            Si vous avez des questions concernant cette politique de confidentialité ou la manière dont nous traitons vos données personnelles, 
            veuillez nous contacter à l'adresse suivante :
          </p>
          <p className="mb-4">
            RWDM Academy<br />
            Rue Charles Malis, 61<br />
            1080 Molenbeek-Saint-Jean<br />
            Belgique<br />
            Email: privacy@rwdm-academy.be
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
