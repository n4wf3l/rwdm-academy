
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MedicalReportPDF from "./MedicalReportPDF"
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas"

interface FormSection {
  title: string;
  subtitle?: string;
}


const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Hello World", 10, 10);
  doc.save("document.pdf");
}; 
const FormSection: React.FC<FormSection & { children: React.ReactNode }> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-rwdm-blue dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

const AccidentReportForm: React.FC = () => {
  const [accidentDate, setAccidentDate] = useState<Date | undefined>();
  const [signature, setSignature] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Accident form submitted");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Veuillez sélectionner un fichier PDF');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up">
      <Card className="glass-panel">
  <CardContent className="pt-6">
    <FormSection 
      title="Informations sur l'accident" 
      subtitle="Veuillez fournir les informations de base concernant l'accident"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="accidentDate">Date de l'accident</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "form-input-base justify-start text-left font-normal w-full",
                  !accidentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {accidentDate ? (
                  format(accidentDate, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionnez une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={accidentDate}
                onSelect={setAccidentDate}
                initialFocus
                locale={fr}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="affiliationNumber">Numéro d'affiliation</Label>
          <Input id="affiliationNumber" className="form-input-base" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="clubName">Nom du club</Label>
          <Input id="clubName" className="form-input-base" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playerLastName">Nom du joueur</Label>
          <Input id="playerLastName" className="form-input-base" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="playerFirstName">Prénom du joueur</Label>
          <Input id="playerFirstName" className="form-input-base" required />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="accidentDescription">Description de l'accident</Label>
        <Textarea 
          id="accidentDescription" 
          className="form-input-base min-h-32" 
          placeholder="Décrivez comment l'accident s'est produit, où, quand et les conséquences immédiates..." 
          required 
        />
      </div>
    </FormSection>
  </CardContent>
</Card>
      
<Card className="glass-panel">
  <CardContent className="pt-6">
    <FormSection 
      title="Document justificatif" 
      subtitle="Veuillez télécharger un document PDF justificatif (rapport médical, etc.)"
    >
      <div className="space-y-4">
        {/* Section d'upload de fichier */}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="pdfUpload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF uniquement (MAX. 10MB)</p>
            </div>
            <input 
              id="pdfUpload" 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileChange}
              required
            />
          </label>
        </div>
        
        {/* Affichage du fichier uploadé */}
        {pdfFile && (
          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm truncate">{pdfFile.name}</span>
            <button
              type="button"
              onClick={() => setPdfFile(null)}
              className="text-xs text-rwdm-red hover:text-rwdm-red/80 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
     
        {/* 🔥 Intégration de MedicalReportPDF sous le bouton */}
        <div className="mt-4">
          <MedicalReportPDF />
        </div>

      </div>
    </FormSection>
  </CardContent>
</Card>

      
<Card className="glass-panel">
  <CardContent className="pt-6">
    <FormSection 
      title="Signature" 
      subtitle="Veuillez signer pour confirmer l'exactitude des informations fournies"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          En vue d'une gestion efficace de mon dossier, et uniquement à cet effet, je donne autorisation au traitement des données médicales me concernant relatives à l'accident dont j'ai été victime, comme décrit dans la <a href="https://www.arena-nv.be/CONFIDENTIALITE.pdf" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">"Déclaration de confidentialité"</a> qui peut être consultée ici. Conformément à la loi RGPD, j'ai le droit d'accès, de rectification, de portabilité, d'opposition et d'effacement de mes données (arena@arena-nv.be).
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong>Signature victime ou des parents/tuteur légal (pour les enfants de moins de 13 ans)</strong>
        </p>
        <SignaturePad 
          onChange={setSignature}
          placeholder="Signez ici pour valider la déclaration d'accident"
        />
      </div>
    </FormSection>
  </CardContent>
</Card>
      
      <div className="flex justify-center">
        <Button 
          type="submit" 
          disabled={!signature || !pdfFile}
          className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
        >
          Soumettre la déclaration
        </Button>
      </div>
    </form>
  );
};

export default AccidentReportForm;
