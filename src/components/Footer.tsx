
import React from "react";
import { Link } from "react-router-dom";
import { Shield, FileText, BookOpen, Cookie } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("py-8 px-4 mt-8 bg-gray-100 dark:bg-rwdm-darkblue/60", className)}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RWDM Academy Logo" className="h-10 w-10" />
              <h3 className="font-bold text-xl text-rwdm-blue dark:text-white">RWDM Academy</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              La RWDM Academy est dédiée à la formation des jeunes talents du football belge. Nous nous engageons à offrir un environnement d'apprentissage de qualité.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-rwdm-blue dark:text-white">Contact</h3>
            <address className="not-italic text-gray-600 dark:text-gray-300 text-sm">
              <p>Rue Charles Malis 61</p>
              <p>1080 Molenbeek-Saint-Jean</p>
              <p>Belgique</p>
              <p className="mt-2">
                <a href="mailto:contact@rwdm-academy.be" className="hover:underline">
                  contact@rwdm-academy.be
                </a>
              </p>
              <p>
                <a href="tel:+3221234567" className="hover:underline">
                  +32 2 123 45 67
                </a>
              </p>
            </address>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-rwdm-blue dark:text-white">Informations Légales</h3>
            <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
              <li>
                <Link to="/legal" className="inline-flex items-center hover:text-rwdm-red transition-colors">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Politique de Confidentialité</span>
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=terms" className="inline-flex items-center hover:text-rwdm-red transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Conditions Générales d'Utilisation</span>
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=legal" className="inline-flex items-center hover:text-rwdm-red transition-colors">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Mentions Légales</span>
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=cookies" className="inline-flex items-center hover:text-rwdm-red transition-colors">
                  <Cookie className="h-4 w-4 mr-2" />
                  <span>Politique de Cookies</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} RWDM Academy. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
