import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import { useToast } from "@/hooks/use-toast";

interface FormSection {
  title: string;
  subtitle?: string;
}

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

const ResponsibilityWaiverForm: React.FC = () => {
  const { toast } = useToast();
  const [parentLastName, setParentLastName] = useState<string>("");
  const [parentFirstName, setParentFirstName] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [playerLastName, setPlayerLastName] = useState<string>("");
  const [playerFirstName, setPlayerFirstName] = useState<string>("");
  const [playerBirthDate, setPlayerBirthDate] = useState<Date | undefined>();
  const [currentClub, setCurrentClub] = useState<string>("");
  const [previousClub, setPreviousClub] = useState<string>("");
  const [signatureDate, setSignatureDate] = useState<Date | undefined>(new Date());
  const [signature, setSignature] = useState<string | null>(null);
  const [approvalText, setApprovalText] = useState<string>("");
  
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpellCheckOpen(true);
  };

  const finalSubmit = () => {
    console.log("Waiver form submitted");
    toast({
      title: "Décharge soumise avec succès",
      description: "Votre décharge de responsabilité a été envoyée.",
    });
    setIsSpellCheckOpen(false);
  };

  const waiverText = `Je soussigné(e), ${parentFirstName || ""} ${parentLastName || "À REMPLIR"}, représentant légal du joueur ${playerFirstName || "À REMPLIR"} ${playerLastName || ""}, né le ${playerBirthDate ? format(playerBirthDate, "dd/MM/yyyy") : "À REMPLIR"}, et affilié au club ${currentClub || "À REMPLIR"} décharge la RWDM Academy de toute responsabilité en cas d'accident pouvant survenir au cours des entraînements et/ou matchs amicaux auxquels le joueur pourrait participer à partir de ce jour.`;

  const spellCheckFields = [
    { label: "Nom du parent", value: parentLastName },
    { label: "Prénom du parent", value: parentFirstName },
    { label: "Email du parent", value: parentEmail },
    { label: "Nom du joueur", value: playerLastName },
    { label: "Prénom du joueur", value: playerFirstName },
    { label: "Club actuel", value: currentClub }
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up">
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection 
              title="Informations du parent/tuteur" 
              subtitle="Veuillez remplir vos informations en tant que responsable légal"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">Nom</Label>
                  <Input 
                    id="parentLast Name" 
                    className="form-input-base" 
                    value={parentLastName}
                    onChange={(e) => setParentLastName(e.target.value)}
                    required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentFirstName">Prénom</Label>
                  <Input 
                    id="parentFirstName" 
                    className="form-input-base" 
                    value={parentFirstName}
                    onChange={(e) => setParentFirstName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Téléphone</Label>
                  <Input 
                    id="parentPhone" 
                    type="tel" 
                    className="form-input-base" 
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email</Label>
                  <Input 
                    id="parentEmail" 
                    type="email" 
                    className="form-input-base" 
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection 
              title="Informations du joueur" 
              subtitle="Veuillez remplir les informations concernant le joueur"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="playerLastName">Nom</Label>
                  <Input 
                    id="playerLastName" 
                    className="form-input-base" 
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">Prénom</Label>
                  <Input 
                    id="playerFirstName" 
                    className="form-input-base" 
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="playerBirthDate">Date de naissance</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-input-base justify-start text-left font-normal",
                          !playerBirthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {playerBirthDate ? (
                          format(playerBirthDate, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={playerBirthDate}
                        onSelect={setPlayerBirthDate}
                        initialFocus
                        locale={fr}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentClub">Nom du club</Label>
                  <Input 
                    id="currentClub" 
                    className="form-input-base" 
                    value={currentClub}
                    onChange={(e) => setCurrentClub(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection 
              title="Décharge de responsabilité" 
              subtitle="Lisez attentivement avant de signer"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {waiverText}
                </p>
              </div>
            </FormSection>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection 
              title="Date et confirmation" 
              subtitle="Veuillez confirmer la date et saisir 'Lu et approuvé'"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="waiverDate">Date de signature</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-input-base justify-start text-left font-normal",
                          !signatureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {signatureDate ? (
                          format(signatureDate, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={signatureDate}
                        onSelect={setSignatureDate}
                        initialFocus
                        locale={fr}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="approvalText">Mention "Lu et approuvé"</Label>
                  <Input 
                    id="approvalText" 
                    className="form-input-base" 
                    value={approvalText}
                    onChange={(e) => setApprovalText(e.target.value)}
                    placeholder="Tapez 'Lu et approuvé'"
                    required 
                  />
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection 
              title="Signature" 
              subtitle="Veuillez signer cette décharge de responsabilité"
            >
              <SignaturePad 
                onChange={setSignature}
                placeholder="Signez ici pour valider la décharge de responsabilité"
              />
            </FormSection>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={!signature || approvalText !== "Lu et approuvé"}
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            Soumettre la décharge
          </Button>
        </div>
      </form>

      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title="Vérification des informations de la décharge"
      />
    </>
  );
};

export default ResponsibilityWaiverForm;
