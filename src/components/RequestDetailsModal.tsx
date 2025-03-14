
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileText, User, MapPin, Phone, Mail, Check, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

// Types
export type RequestStatus = 'new' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
export type RequestType = 'registration' | 'selection-tests' | 'accident-report' | 'responsibility-waiver';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

export interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  phone: string;
  date: Date;
  status: RequestStatus;
  assignedTo?: string;
  details: RequestDetails;
}

export interface RequestDetails {
  // Common fields
  playerFirstName: string;
  playerLastName: string;
  playerBirthDate?: Date;
  
  // Registration specific fields
  season?: string;
  birthPlace?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  currentClub?: string;
  position?: string;
  category?: string;
  
  // Parent/Guardian information
  primaryGuardian?: {
    type: 'father' | 'mother' | 'guardian';
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address?: string;
    postalCode?: string;
    mobilePhone?: string;
  };
  
  secondaryGuardian?: {
    type: 'father' | 'mother' | 'guardian';
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address?: string;
    postalCode?: string;
    mobilePhone?: string;
  };
  
  // Selection tests specific
  coreGroup?: string;
  testPeriod?: {
    startDate?: Date;
    endDate?: Date;
  };
  previousClub?: string;
  
  // Accident report specific
  affiliationNumber?: string;
  clubName?: string;
  accidentDescription?: string;
  documentUrl?: string;
  
  // Consent and signature
  imageConsent?: boolean;
  signatureDate?: Date;
  signatureUrl?: string;
  approvalText?: string;
}

// Helper function to translate request type
const translateRequestType = (type: RequestType): string => {
  switch (type) {
    case 'registration': return 'Inscription à l\'académie';
    case 'selection-tests': return 'Tests de sélection';
    case 'accident-report': return 'Déclaration d\'accident';
    case 'responsibility-waiver': return 'Décharge de responsabilité';
    default: return type;
  }
};

// Helper function to get status badge
const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'new': return <Badge className="bg-blue-500">Nouveau</Badge>;
    case 'assigned': return <Badge className="bg-purple-500">Assigné</Badge>;
    case 'in-progress': return <Badge className="bg-yellow-500">En cours</Badge>;
    case 'completed': return <Badge className="bg-green-500">Terminé</Badge>;
    case 'rejected': return <Badge className="bg-red-500">Rejeté</Badge>;
    default: return <Badge>Inconnu</Badge>;
  }
};

// Section component for the modal
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
    {children}
  </div>
);

// Field component for displaying individual pieces of data
const Field: React.FC<{ label: string; value?: string | React.ReactNode; icon?: React.ReactNode }> = ({ 
  label, 
  value, 
  icon 
}) => (
  <div className="flex items-start mb-2">
    {icon && <div className="mr-2 mt-0.5 text-gray-500">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value || "-"}</p>
    </div>
  </div>
);

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ isOpen, onClose, request }) => {
  if (!request) return null;
  
  const { details } = request;
  
  // Render different content based on request type
  const renderContent = () => {
    switch (request.type) {
      case 'registration':
        return renderRegistrationContent();
      case 'selection-tests':
        return renderSelectionTestsContent();
      case 'accident-report':
        return renderAccidentReportContent();
      case 'responsibility-waiver':
        return renderResponsibilityWaiverContent();
      default:
        return <p>Type de demande non reconnu.</p>;
    }
  };
  
  const renderRegistrationContent = () => (
    <>
      <Section title="Saison d'inscription">
        <Field 
          label="Saison" 
          value={details.season} 
          icon={<CalendarIcon className="h-4 w-4" />} 
        />
      </Section>
      
      <Section title="Informations du joueur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" value={details.playerLastName} icon={<User className="h-4 w-4" />} />
          <Field label="Prénom" value={details.playerFirstName} icon={<User className="h-4 w-4" />} />
          <Field 
            label="Date de naissance" 
            value={details.playerBirthDate ? format(details.playerBirthDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field label="Lieu de naissance" value={details.birthPlace} icon={<MapPin className="h-4 w-4" />} />
          <Field label="Adresse" value={details.address} icon={<MapPin className="h-4 w-4" />} />
          <Field label="Code postal" value={details.postalCode} icon={<MapPin className="h-4 w-4" />} />
          <Field label="Ville" value={details.city} icon={<MapPin className="h-4 w-4" />} />
          <Field label="Téléphone" value={request.phone} icon={<Phone className="h-4 w-4" />} />
          <Field label="GSM" value={request.phone} icon={<Phone className="h-4 w-4" />} />
          <Field label="Email" value={request.email} icon={<Mail className="h-4 w-4" />} />
          <Field label="Club actuel" value={details.currentClub} icon={<FileText className="h-4 w-4" />} />
          <Field label="Position" value={details.position} icon={<FileText className="h-4 w-4" />} />
          <Field label="Catégorie" value={details.category} icon={<FileText className="h-4 w-4" />} />
        </div>
      </Section>
      
      {details.primaryGuardian && (
        <Section title="Responsable principal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Type" value={details.primaryGuardian.type} icon={<User className="h-4 w-4" />} />
            <Field label="Nom" value={details.primaryGuardian.lastName} icon={<User className="h-4 w-4" />} />
            <Field label="Prénom" value={details.primaryGuardian.firstName} icon={<User className="h-4 w-4" />} />
            <Field label="Téléphone" value={details.primaryGuardian.phone} icon={<Phone className="h-4 w-4" />} />
            <Field label="Email" value={details.primaryGuardian.email} icon={<Mail className="h-4 w-4" />} />
            <Field label="Adresse" value={details.primaryGuardian.address} icon={<MapPin className="h-4 w-4" />} />
            <Field label="Code postal" value={details.primaryGuardian.postalCode} icon={<MapPin className="h-4 w-4" />} />
            <Field label="GSM" value={details.primaryGuardian.mobilePhone} icon={<Phone className="h-4 w-4" />} />
          </div>
        </Section>
      )}
      
      {details.secondaryGuardian && (
        <Section title="Responsable secondaire">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Type" value={details.secondaryGuardian.type} icon={<User className="h-4 w-4" />} />
            <Field label="Nom" value={details.secondaryGuardian.lastName} icon={<User className="h-4 w-4" />} />
            <Field label="Prénom" value={details.secondaryGuardian.firstName} icon={<User className="h-4 w-4" />} />
            <Field label="Téléphone" value={details.secondaryGuardian.phone} icon={<Phone className="h-4 w-4" />} />
            <Field label="Email" value={details.secondaryGuardian.email} icon={<Mail className="h-4 w-4" />} />
            <Field label="Adresse" value={details.secondaryGuardian.address} icon={<MapPin className="h-4 w-4" />} />
            <Field label="Code postal" value={details.secondaryGuardian.postalCode} icon={<MapPin className="h-4 w-4" />} />
            <Field label="GSM" value={details.secondaryGuardian.mobilePhone} icon={<Phone className="h-4 w-4" />} />
          </div>
        </Section>
      )}
      
      <Section title="Consentement à l'image">
        <Field 
          label="Consentement" 
          value={details.imageConsent ? "J'accepte que des photos de mon enfant soient prises et utilisées à des fins promotionnelles." : "Non consenti"} 
          icon={details.imageConsent ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />} 
        />
      </Section>
      
      <Section title="Signature">
        {details.signatureUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={details.signatureUrl} alt="Signature" className="w-full" />
          </div>
        )}
        <Field 
          label="Date" 
          value={details.signatureDate ? format(details.signatureDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
          icon={<CalendarIcon className="h-4 w-4" />} 
        />
      </Section>
    </>
  );
  
  const renderSelectionTestsContent = () => (
    <>
      <Section title="Informations sur les tests">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Noyau" value={details.coreGroup} icon={<FileText className="h-4 w-4" />} />
          <Field 
            label="Date de début" 
            value={details.testPeriod?.startDate ? format(details.testPeriod.startDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field 
            label="Date de fin" 
            value={details.testPeriod?.endDate ? format(details.testPeriod.endDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
        </div>
      </Section>
      
      <Section title="Informations du joueur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" value={details.playerLastName} icon={<User className="h-4 w-4" />} />
          <Field label="Prénom" value={details.playerFirstName} icon={<User className="h-4 w-4" />} />
          <Field 
            label="Date de naissance" 
            value={details.playerBirthDate ? format(details.playerBirthDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field label="Téléphone (GSM)" value={request.phone} icon={<Phone className="h-4 w-4" />} />
          <Field label="Email" value={request.email} icon={<Mail className="h-4 w-4" />} />
          <Field label="Club actuel" value={details.currentClub} icon={<FileText className="h-4 w-4" />} />
          <Field label="Club précédent" value={details.previousClub} icon={<FileText className="h-4 w-4" />} />
          <Field label="Position" value={details.position} icon={<FileText className="h-4 w-4" />} />
        </div>
      </Section>
      
      {details.primaryGuardian && (
        <Section title="Informations des responsables légaux">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom" value={details.primaryGuardian.lastName} icon={<User className="h-4 w-4" />} />
            <Field label="Prénom" value={details.primaryGuardian.firstName} icon={<User className="h-4 w-4" />} />
            <Field label="Téléphone (GSM)" value={details.primaryGuardian.phone} icon={<Phone className="h-4 w-4" />} />
            <Field label="Email" value={details.primaryGuardian.email} icon={<Mail className="h-4 w-4" />} />
            <Field label="Relation" value={details.primaryGuardian.type} icon={<User className="h-4 w-4" />} />
          </div>
        </Section>
      )}
      
      <Section title="Signature">
        {details.signatureUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={details.signatureUrl} alt="Signature" className="w-full" />
          </div>
        )}
      </Section>
    </>
  );
  
  const renderAccidentReportContent = () => (
    <>
      <Section title="Informations sur l'accident">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Date de l'accident" 
            value={details.signatureDate ? format(details.signatureDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field label="Numéro d'affiliation" value={details.affiliationNumber} icon={<FileText className="h-4 w-4" />} />
          <Field label="Nom du club" value={details.clubName} icon={<FileText className="h-4 w-4" />} />
          <Field label="Nom du joueur" value={details.playerLastName} icon={<User className="h-4 w-4" />} />
          <Field label="Prénom du joueur" value={details.playerFirstName} icon={<User className="h-4 w-4" />} />
        </div>
      </Section>
      
      <Section title="Description de l'accident">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {details.accidentDescription || "Aucune description fournie."}
          </p>
        </div>
      </Section>
      
      {details.documentUrl && (
        <Section title="Document justificatif">
          <a 
            href={details.documentUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileText className="h-5 w-5 mr-2 text-rwdm-blue" />
            <span className="text-sm">Voir le document PDF</span>
          </a>
        </Section>
      )}
      
      <Section title="Signature">
        {details.signatureUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={details.signatureUrl} alt="Signature" className="w-full" />
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>En vue d'une gestion efficace de mon dossier, et uniquement à cet effet, je donne autorisation au traitement des données médicales me concernant relatives à l'accident dont j'ai été victime, comme décrit dans la "Déclaration de confidentialité".</p>
        </div>
      </Section>
    </>
  );
  
  const renderResponsibilityWaiverContent = () => (
    <>
      <Section title="Informations du parent/tuteur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" value={details.primaryGuardian?.lastName} icon={<User className="h-4 w-4" />} />
          <Field label="Prénom" value={details.primaryGuardian?.firstName} icon={<User className="h-4 w-4" />} />
          <Field label="Téléphone" value={details.primaryGuardian?.phone} icon={<Phone className="h-4 w-4" />} />
          <Field label="Email" value={details.primaryGuardian?.email} icon={<Mail className="h-4 w-4" />} />
        </div>
      </Section>
      
      <Section title="Informations du joueur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom" value={details.playerLastName} icon={<User className="h-4 w-4" />} />
          <Field label="Prénom" value={details.playerFirstName} icon={<User className="h-4 w-4" />} />
          <Field 
            label="Date de naissance" 
            value={details.playerBirthDate ? format(details.playerBirthDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field label="Nom du club" value={details.clubName} icon={<FileText className="h-4 w-4" />} />
        </div>
      </Section>
      
      <Section title="Décharge de responsabilité">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {`Je soussigné(e), ${details.primaryGuardian?.firstName || ""} ${details.primaryGuardian?.lastName || "À REMPLIR"}, représentant légal du joueur ${details.playerFirstName || "À REMPLIR"} ${details.playerLastName || ""}, né le ${details.playerBirthDate ? format(details.playerBirthDate, "dd/MM/yyyy") : "À REMPLIR"}, et affilié au club ${details.clubName || "À REMPLIR"} décharge la RWDM Academy de toute responsabilité en cas d'accident pouvant survenir au cours des entraînements et/ou matchs amicaux auxquels le joueur pourrait participer à partir de ce jour.`}
          </p>
        </div>
      </Section>
      
      <Section title="Date et confirmation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Date de signature" 
            value={details.signatureDate ? format(details.signatureDate, "dd/MM/yyyy", { locale: fr }) : "-"} 
            icon={<CalendarIcon className="h-4 w-4" />} 
          />
          <Field label="Mention" value={details.approvalText} icon={<Check className="h-4 w-4" />} />
        </div>
      </Section>
      
      <Section title="Signature">
        {details.signatureUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img src={details.signatureUrl} alt="Signature" className="w-full" />
          </div>
        )}
      </Section>
    </>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{translateRequestType(request.type)}</span>
            {getStatusBadge(request.status)}
          </DialogTitle>
          <DialogDescription>
            Demande #{request.id} • {format(request.date, "dd MMMM yyyy", { locale: fr })}
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{request.phone}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Soumis le {format(request.date, "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
          
          {renderContent()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailsModal;