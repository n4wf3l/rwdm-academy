
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-rwdm-blue">Conditions Générales d'Utilisation & Mentions Légales</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Mentions Légales</h2>
          
          <h3 className="text-lg font-medium mb-2">Éditeur du site</h3>
          <p className="mb-4">
            RWDM Academy<br />
            Rue Charles Malis, 61<br />
            1080 Molenbeek-Saint-Jean<br />
            Belgique<br />
            Numéro d'entreprise : BE0123456789<br />
            Email: contact@rwdm-academy.be<br />
            Téléphone: +32 2 123 45 67
          </p>
          
          <h3 className="text-lg font-medium mb-2">Directeur de la publication</h3>
          <p className="mb-4">
            [Nom du Directeur de la publication]
          </p>
          
          <h3 className="text-lg font-medium mb-2">Hébergeur</h3>
          <p className="mb-4">
            [Nom de l'hébergeur]<br />
            [Adresse de l'hébergeur]<br />
            [Code postal et ville]<br />
            [Pays]<br />
            [Téléphone de l'hébergeur]
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Conditions Générales d'Utilisation</h2>
          
          <h3 className="text-lg font-medium mb-2">1. Acceptation des conditions</h3>
          <p className="mb-4">
            L'utilisation de la plateforme en ligne de l'Académie RWDM implique l'acceptation pleine et entière des présentes conditions générales d'utilisation. 
            Ces conditions sont susceptibles d'être modifiées ou complétées à tout moment, les utilisateurs sont donc invités à les consulter de manière régulière.
          </p>
          
          <h3 className="text-lg font-medium mb-2">2. Description des services</h3>
          <p className="mb-4">
            La plateforme en ligne de l'Académie RWDM permet aux utilisateurs de :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>S'inscrire à l'académie de football</li>
            <li>S'inscrire aux tests de sélection</li>
            <li>Soumettre des déclarations d'accident</li>
            <li>Remplir des décharges de responsabilité</li>
            <li>Accéder aux informations concernant l'académie</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">3. Inscription et comptes utilisateurs</h3>
          <p className="mb-4">
            L'accès à certains services de la plateforme peut nécessiter la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à jour. 
            Les identifiants de connexion sont strictement personnels et confidentiels. L'utilisateur est responsable de la préservation de la confidentialité de ses identifiants.
          </p>
          
          <h3 className="text-lg font-medium mb-2">4. Obligations de l'utilisateur</h3>
          <p className="mb-4">
            L'utilisateur s'engage à utiliser la plateforme conformément à sa destination et à ne pas détourner l'usage des services proposés. 
            Il s'engage notamment à ne pas :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Fournir des informations fausses, inexactes ou incomplètes</li>
            <li>Utiliser la plateforme d'une manière qui pourrait endommager, désactiver ou surcharger les serveurs</li>
            <li>Tenter d'accéder à des zones sécurisées sans autorisation</li>
            <li>Utiliser des robots, scrapers ou autres moyens automatisés pour accéder à la plateforme</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">5. Propriété intellectuelle</h3>
          <p className="mb-4">
            L'ensemble des éléments de la plateforme (textes, graphismes, logos, images, vidéos) sont protégés par le droit d'auteur et restent la propriété exclusive de l'Académie RWDM 
            ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation de tout ou partie de ces éléments est strictement interdite sans autorisation préalable.
          </p>
          
          <h3 className="text-lg font-medium mb-2">6. Limitation de responsabilité</h3>
          <p className="mb-4">
            L'Académie RWDM s'efforce d'assurer au mieux la disponibilité et le bon fonctionnement de la plateforme, mais ne peut être tenue responsable des interruptions de service, 
            des problèmes techniques ou des défaillances du réseau internet. L'Académie RWDM décline toute responsabilité quant aux dommages directs ou indirects pouvant résulter de 
            l'utilisation de la plateforme.
          </p>
          
          <h3 className="text-lg font-medium mb-2">7. Protection des données personnelles</h3>
          <p className="mb-4">
            Les informations recueillies sur la plateforme font l'objet d'un traitement informatique destiné à la gestion des inscriptions et des services de l'Académie RWDM. 
            Conformément au Règlement Général sur la Protection des Données (RGPD), l'utilisateur dispose de droits concernant ses données personnelles, 
            comme détaillé dans notre Politique de Confidentialité.
          </p>
          
          <h3 className="text-lg font-medium mb-2">8. Droit applicable et juridiction compétente</h3>
          <p className="mb-4">
            Les présentes conditions générales d'utilisation sont soumises au droit belge. En cas de litige, les tribunaux de Bruxelles seront seuls compétents.
          </p>
          
          <h3 className="text-lg font-medium mb-2">9. Contact</h3>
          <p className="mb-4">
            Pour toute question concernant ces conditions générales d'utilisation, veuillez nous contacter à l'adresse suivante : legal@rwdm-academy.be
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
