
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CookiesPolicy: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-rwdm-blue">Politique de Cookies</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            La présente politique de cookies explique comment l'Académie RWDM utilise les cookies et technologies similaires 
            lors de votre navigation sur notre plateforme en ligne. Elle décrit également les options à votre disposition concernant ces cookies.
          </p>
          <p className="mb-4">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Qu'est-ce qu'un cookie ?</h2>
          <p className="mb-4">
            Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. 
            Les cookies sont largement utilisés pour faire fonctionner les sites web ou les rendre plus efficaces, 
            ainsi que pour fournir des informations aux propriétaires du site.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Les cookies que nous utilisons</h2>
          <p className="mb-4">
            Notre plateforme utilise différents types de cookies :
          </p>
          
          <h3 className="text-lg font-medium mb-2">Cookies strictement nécessaires</h3>
          <p className="mb-4">
            Ces cookies sont essentiels au fonctionnement de notre plateforme et vous permettent d'utiliser ses fonctionnalités. 
            Sans ces cookies, certains services que vous avez demandés ne peuvent pas être fournis.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Cookies de performance</h3>
          <p className="mb-4">
            Ces cookies collectent des informations sur la façon dont les visiteurs utilisent notre plateforme, 
            par exemple quelles pages sont les plus visitées. Ces cookies ne collectent pas d'informations permettant d'identifier un visiteur.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Cookies de fonctionnalité</h3>
          <p className="mb-4">
            Ces cookies permettent à notre plateforme de mémoriser les choix que vous faites (comme votre nom d'utilisateur, votre langue ou la région où vous vous trouvez) 
            et fournissent des fonctionnalités améliorées et plus personnelles.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Cookies de ciblage ou publicitaires</h3>
          <p className="mb-4">
            Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous et vos intérêts. 
            Ils sont également utilisés pour limiter le nombre de fois que vous voyez une publicité et aider à mesurer l'efficacité des campagnes publicitaires.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Comment contrôler les cookies</h2>
          <p className="mb-4">
            Vous pouvez contrôler et/ou supprimer les cookies à votre guise. Vous pouvez supprimer tous les cookies déjà présents sur votre appareil et vous pouvez configurer 
            la plupart des navigateurs pour qu'ils ne les acceptent pas. Toutefois, si vous le faites, vous devrez peut-être ajuster manuellement certaines préférences 
            chaque fois que vous visiterez un site, et certaines fonctionnalités et services pourraient ne pas fonctionner.
          </p>
          <p className="mb-4">
            Vous pouvez facilement accepter ou refuser les cookies sur ce site en choisissant l'une des options suivantes :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Accepter tous les cookies</li>
            <li>N'accepter que les cookies nécessaires</li>
            <li>Refuser tous les cookies</li>
          </ul>
          <p className="mb-4">
            Vous pouvez également modifier vos paramètres de cookies à tout moment en visitant la section "Paramètres de cookies" en bas de notre site.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Cookies tiers</h2>
          <p className="mb-4">
            Certains cookies sont placés par des services tiers qui apparaissent sur nos pages. Nous n'avons pas le contrôle sur ces cookies. 
            Ces tiers peuvent inclure, par exemple, les réseaux sociaux, les services d'analyse et les plateformes de vidéo en ligne.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Durée de conservation des cookies</h2>
          <p className="mb-4">
            Nous utilisons deux types de cookies selon leur durée :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Cookies de session : ces cookies sont temporaires et expirent lorsque vous fermez votre navigateur.</li>
            <li>Cookies persistants : ces cookies restent sur votre appareil jusqu'à ce qu'ils expirent ou que vous les supprimiez.</li>
          </ul>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Modifications de la politique de cookies</h2>
          <p className="mb-4">
            Nous nous réservons le droit de modifier cette politique de cookies à tout moment. 
            Toute modification sera publiée sur cette page avec la date de mise à jour. 
            Nous vous encourageons à consulter régulièrement cette politique pour rester informé de nos pratiques en matière de cookies.
          </p>
          
          <Separator className="my-4" />
          
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p className="mb-4">
            Si vous avez des questions concernant cette politique de cookies ou la manière dont nous utilisons les cookies, 
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

export default CookiesPolicy;
