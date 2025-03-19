import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ======================= TYPES ======================= */

export type RequestStatus =
  | "new"
  | "assigned"
  | "in-progress"
  | "completed"
  | "rejected";

export type RequestType =
  | "registration"
  | "selection-tests"
  | "accident-report"
  | "responsibility-waiver";

export interface RequestDetails {
  // Pour inscription
  season?: string;
  birthPlace?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  currentClub?: string;
  position?: string;
  category?: string;

  // Pour inscription – infos joueur
  lastName?: string; // pour "registration"
  firstName?: string; // pour "registration"
  birthDate?: string; // ISO

  // Pour inscription – responsable principal
  parent1Type?: string;
  parent1LastName?: string;
  parent1FirstName?: string;
  parent1Phone?: string;
  parent1Email?: string;
  parent1Address?: string;
  parent1PostalCode?: string;
  parent1Gsm?: string;

  // Pour inscription – responsable secondaire
  parent2LastName?: string;
  parent2FirstName?: string;
  parent2Email?: string;
  parent2Phone?: string;
  parent2Address?: string;
  parent2PostalCode?: string;
  parent2Gsm?: string;

  // Pour "responsibility-waiver"
  parentLastName?: string;
  parentFirstName?: string;
  parentPhone?: string;
  parentEmail?: string;
  // Pour "responsibility-waiver" infos joueur
  playerLastName?: string;
  playerFirstName?: string;
  playerBirthDate?: string; // ISO
  previousClub?: string; // ou null

  // Pour tests de sélection
  noyau?: string; // ex: "U7"
  testStartDate?: string; // ISO
  testEndDate?: string; // ISO

  // Consentement & signature
  imageConsent?: boolean;
  signature?: string; // Base64 ou URL
  signatureDate?: string; // ISO
  approvalText?: string;

  // Relation parentale (pour tests de sélection)
  parentRelation?: string; // ex: "parent" ou "representant"

  // Pour accident-report
  accidentDate?: string;
  description?: string;
  documentUrl?: string;

  [key: string]: any;
}

export interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  phone?: string;
  date: Date;
  status: RequestStatus;
  assignedTo?: string;
  details: RequestDetails;
}

export interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

/* ======================= HELPERS ======================= */

const translateRequestType = (type: RequestType): string => {
  switch (type) {
    case "registration":
      return "Inscription à l'académie";
    case "selection-tests":
      return "Tests de sélection";
    case "accident-report":
      return "Déclaration d'accident";
    case "responsibility-waiver":
      return "Décharge de responsabilité";
    default:
      return type;
  }
};

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case "new":
      return <Badge className="bg-blue-500">Nouveau</Badge>;
    case "assigned":
      return <Badge className="bg-purple-500">Assigné</Badge>;
    case "in-progress":
      return <Badge className="bg-yellow-500">En cours</Badge>;
    case "completed":
      return <Badge className="bg-green-500">Terminé</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rejeté</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
  }
};

/* ======================= COMPOSANTS UI ======================= */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-start mb-2">
    {icon && <div className="mr-2 mt-0.5 text-gray-500">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value || "-"}</p>
    </div>
  </div>
);

/* ======================= RENDERING DES TYPES ======================= */

/* 1) Pour "registration" (Inscription à l'académie) */
const renderRegistrationContent = (request: Request) => {
  const d = request.details;
  return (
    <>
      <Section title="Saison d'inscription">
        <Field
          label="Saison"
          value={d.season || "-"}
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </Section>

      <Section title="Informations du joueur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Nom"
            value={d.lastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Prénom"
            value={d.firstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Date de naissance"
            value={
              d.birthDate
                ? format(new Date(d.birthDate), "dd/MM/yyyy", { locale: fr })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label="Lieu de naissance"
            value={d.birthPlace || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label="Adresse"
            value={d.address || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label="Code postal"
            value={d.postalCode || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label="Ville"
            value={d.city || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label="Club actuel"
            value={d.currentClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label="Position"
            value={d.position || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label="Catégorie"
            value={d.category || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      {d.primaryGuardian && (
        <Section title="Informations du responsable principal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Type"
              value={d.parent1Type || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Nom"
              value={d.parent1LastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Prénom"
              value={d.parent1FirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Téléphone"
              value={d.parent1Phone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label="Email"
              value={d.parent1Email || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
            <Field
              label="Adresse"
              value={d.parent1Address || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label="Code postal"
              value={d.parent1PostalCode || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label="GSM"
              value={d.parent1Gsm || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </Section>
      )}

      {(d.parent2LastName ||
        d.parent2FirstName ||
        d.parent2Email ||
        d.parent2Phone ||
        d.parent2Gsm) && (
        <Section title="Informations du responsable secondaire">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nom"
              value={d.parent2LastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Prénom"
              value={d.parent2FirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Téléphone"
              value={d.parent2Phone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label="Email"
              value={d.parent2Email || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
            <Field
              label="Adresse"
              value={d.parent2Address || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label="Code postal"
              value={d.parent2PostalCode || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label="GSM"
              value={d.parent2Gsm || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </Section>
      )}

      <Section title="Consentement à l'image">
        <Field
          label="Consentement"
          value={
            d.imageConsent
              ? "J'accepte que des photos de mon enfant soient prises et utilisées à des fins promotionnelles."
              : "Non consenti"
          }
          icon={
            d.imageConsent ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )
          }
        />
      </Section>

      <Section title="Signature">
        {d.signature ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={d.signature} alt="Signature" className="w-full" />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
        <Field
          label="Date de signature"
          value={
            d.signatureDate
              ? format(new Date(d.signatureDate), "dd/MM/yyyy", { locale: fr })
              : format(request.date, "dd/MM/yyyy", { locale: fr })
          }
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </Section>
    </>
  );
};

/* 2) Pour "selection-tests" */
const renderSelectionTestsContent = (request: Request) => {
  const d = request.details;
  return (
    <>
      <Section title="Informations sur les tests">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Noyau"
            value={d.noyau || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title="Informations du joueur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Nom"
            value={d.lastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Prénom"
            value={d.firstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Date de naissance"
            value={
              d.playerBirthDate
                ? format(new Date(d.playerBirthDate), "dd/MM/yyyy", {
                    locale: fr,
                  })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label="Téléphone (GSM)"
            value={d.phone || "-"}
            icon={<Phone className="h-4 w-4" />}
          />
          <Field
            label="Email"
            value={d.email || "-"}
            icon={<Mail className="h-4 w-4" />}
          />
          <Field
            label="Club actuel"
            value={d.currentClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label="Club précédent"
            value={d.previousClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label="Position"
            value={d.position || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title="Informations des responsables légaux">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Nom"
            value={d.parentLastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Prénom"
            value={d.parentFirstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Téléphone (GSM)"
            value={d.parentPhone || "-"}
            icon={<Phone className="h-4 w-4" />}
          />
          <Field
            label="Email"
            value={d.parentEmail || "-"}
            icon={<Mail className="h-4 w-4" />}
          />
          <Field
            label="Relation"
            value={d.parentRelation || "-"}
            icon={<User className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title="Signature">
        {d.signature ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={d.signature} alt="Signature" className="w-full" />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
      </Section>
    </>
  );
};

/* 2) Pour "accident-declaration" */
const renderAccidentReportContent = (request: Request) => {
  const d = request.details;

  return (
    <>
      <Section title="Informations sur l'accident">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Au lieu de d.signatureDate, vous voulez la date d'accident: d.accidentDate */}
          <Field
            label="Date de l'accident"
            value={
              d.accidentDate
                ? format(new Date(d.accidentDate), "dd/MM/yyyy", { locale: fr })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          {/* Si vous avez un champ "affiliationNumber", laissez-le, sinon supprimez */}
          <Field
            label="Nom du club"
            value={d.clubName || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label="Nom du joueur"
            value={d.playerLastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label="Prénom du joueur"
            value={d.playerFirstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title="Description de l'accident">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {d.description || "Aucune description fournie."}
          </p>
        </div>
      </Section>

      {d.filePath && (
        <Section title="Document justificatif">
          <a
            href={`http://localhost:5000${d.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-800
                 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileText className="h-5 w-5 mr-2 text-rwdm-blue" />
            <span className="text-sm">Voir le document PDF</span>
          </a>
        </Section>
      )}

      <Section title="Signature">
        {d.signature ? (
          <div
            className="border border-gray-200 dark:border-gray-700 
                          rounded-md p-4 w-full max-w-sm"
          >
            <img src={d.signature} alt="Signature" className="w-full" />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>
            En vue d'une gestion efficace de mon dossier, et uniquement à cet
            effet, je donne autorisation au traitement des données médicales me
            concernant relatives à l'accident dont j'ai été victime, comme
            décrit dans la "Déclaration de confidentialité".
          </p>
        </div>
      </Section>
    </>
  );
};

/* 4) Pour "responsibility-waiver" (Décharge de responsabilité) */
const renderResponsibilityWaiverContent = (request: Request) => {
  const d = request.details;
  const pdfRef = useRef<HTMLDivElement>(null);

  // 📌 Fonction pour générer le PDF
  const generatePDF = async () => {
    const input = pdfRef.current;
    const pdf = new jsPDF("p", "mm", "a4");

    // Convertir la partie HTML en image
    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    // Ajouter le logo avec proportions correctes
    const logo = new Image();
    logo.src = "/logo.png"; // Chemin du logo
    logo.onload = () => {
      const logoWidth = 30; // Largeur souhaitée
      const logoHeight = (logo.height / logo.width) * logoWidth; // Calcul de la hauteur en conservant le ratio

      pdf.addImage(
        logo,
        "PNG",
        (210 - logoWidth) / 2,
        10,
        logoWidth,
        logoHeight
      ); // Centrage dynamique

      // Ajouter le titre
      pdf.setFontSize(18);
      pdf.text("Décharge de responsabilité", 105, logoHeight + 20, {
        align: "center",
      });

      // Ajouter le contenu du formulaire converti en image
      pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);

      // Télécharger le PDF
      pdf.save("Decharge_Responsabilite.pdf");
    };
  };

  return (
    <div>
      <Button
        onClick={generatePDF}
        className="block mx-auto bg-green-600 hover:bg-green-700 text-white mt-4 mb-10"
      >
        Générer PDF
      </Button>

      {/* 📌 Zone qui sera capturée en PDF */}
      <div ref={pdfRef} className="p-4 bg-white rounded-lg shadow-md">
        <Section title="Informations du parent/tuteur">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nom"
              value={d.parentLastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Prénom"
              value={d.parentFirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Téléphone"
              value={d.parentPhone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label="Email"
              value={d.parentEmail || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title="Informations du joueur">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nom"
              value={d.playerLastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Prénom"
              value={d.playerFirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label="Date de naissance"
              value={d.playerBirthDate || "-"}
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Field
              label="Club actuel"
              value={d.currentClub || "-"}
              icon={<FileText className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title="Décharge de responsabilité">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {`Je soussigné(e), ${d.parentFirstName || "…"} ${
                d.parentLastName || "…"
              }, représentant légal du joueur ${d.playerFirstName || "…"} ${
                d.playerLastName || "…"
              }, né(e) le ${d.playerBirthDate || "…"}, et affilié(e) au club ${
                d.currentClub || "…"
              } décharge la RWDM Academy de toute responsabilité en cas d'accident pouvant survenir au cours des entraînements et/ou matchs amicaux.`}
            </p>
          </div>
        </Section>

        <Section title="Date et confirmation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Date de signature"
              value={d.signatureDate || "-"}
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Field
              label="Mention"
              value={d.approvalText || "-"}
              icon={<Check className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title="Signature">
          {d.signature ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
              <img src={d.signature} alt="Signature" className="w-full" />
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
          )}
        </Section>
      </div>
    </div>
  );
};

/* ======================= COMPOSANT PRINCIPAL ======================= */

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!request) return null;

  const renderContent = () => {
    switch (request.type) {
      case "registration":
        return renderRegistrationContent(request);
      case "selection-tests":
        return renderSelectionTestsContent(request);
      case "accident-report":
        return renderAccidentReportContent(request);
      case "responsibility-waiver":
        return renderResponsibilityWaiverContent(request);
      default:
        return <p>Type de demande non reconnu.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">
              {translateRequestType(request.type)}
            </span>
            {getStatusBadge(request.status)}
          </DialogTitle>
          <DialogDescription>
            Demande #{request.id} •{" "}
            {format(request.date, "dd MMMM yyyy", { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{request.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {request.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {request.type === "responsibility-waiver" &&
                      request.details.parentPhone
                        ? request.details.parentPhone
                        : request.type === "registration" &&
                          request.details.parent1Phone
                        ? request.details.parent1Phone
                        : request.type === "selection-tests" &&
                          request.details.phone
                        ? request.details.phone
                        : request.phone || "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Soumis le{" "}
                    {format(request.date, "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailsModal;
