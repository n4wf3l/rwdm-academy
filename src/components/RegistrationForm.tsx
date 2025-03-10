
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";

const CURRENT_YEAR = new Date().getFullYear();
const SEASONS = [`${CURRENT_YEAR-1}/${CURRENT_YEAR}`, `${CURRENT_YEAR}/${CURRENT_YEAR+1}`, `${CURRENT_YEAR+1}/${CURRENT_YEAR+2}`];

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
const CATEGORIES = ["U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U21"];

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

const RegistrationForm: React.FC = () => {
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [imageConsent, setImageConsent] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up">
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Saison d'inscription" 
            subtitle="Veuillez sélectionner la saison pour laquelle vous souhaitez inscrire le joueur"
          >
            <Select defaultValue={SEASONS[1]}>
              <SelectTrigger className="form-input-base">
                <SelectValue placeholder="Sélectionnez une saison" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((season) => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Informations du joueur" 
            subtitle="Veuillez remplir toutes les informations concernant le joueur"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" className="form-input-base" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" className="form-input-base" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "form-input-base justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? (
                        format(birthDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionnez une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      locale={fr}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Lieu de naissance</Label>
                <Input id="birthPlace" className="form-input-base" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" className="form-input-base" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentClub">Club actuel</Label>
                <Input id="currentClub" className="form-input-base" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select>
                  <SelectTrigger className="form-input-base">
                    <SelectValue placeholder="Sélectionnez une position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((position) => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select>
                  <SelectTrigger className="form-input-base">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Informations des responsables légaux" 
            subtitle="Veuillez remplir les informations concernant les responsables légaux du joueur"
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium mb-3">Responsable principal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="parent1Type">Type</Label>
                    <Select defaultValue="père">
                      <SelectTrigger className="form-input-base">
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="père">Père</SelectItem>
                        <SelectItem value="mère">Mère</SelectItem>
                        <SelectItem value="tuteur">Tuteur légal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent1Name">Nom complet</Label>
                    <Input id="parent1Name" className="form-input-base" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent1Phone">Téléphone</Label>
                    <Input id="parent1Phone" className="form-input-base" type="tel" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent1Email">Email</Label>
                    <Input id="parent1Email" className="form-input-base" type="email" required />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-base font-medium mb-3">Responsable secondaire (optionnel)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="parent2Type">Type</Label>
                    <Select defaultValue="mère">
                      <SelectTrigger className="form-input-base">
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="père">Père</SelectItem>
                        <SelectItem value="mère">Mère</SelectItem>
                        <SelectItem value="tuteur">Tuteur légal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent2Name">Nom complet</Label>
                    <Input id="parent2Name" className="form-input-base" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent2Phone">Téléphone</Label>
                    <Input id="parent2Phone" className="form-input-base" type="tel" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent2Email">Email</Label>
                    <Input id="parent2Email" className="form-input-base" type="email" />
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Autorisations" 
            subtitle="Veuillez indiquer les autorisations que vous accordez"
          >
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="imageConsent" 
                checked={imageConsent}
                onCheckedChange={(checked) => {
                  setImageConsent(checked as boolean);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="imageConsent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Autorisation d'utilisation d'image
                </label>
                <p className="text-sm text-muted-foreground">
                  J'autorise le RWDM à utiliser les photos et vidéos du joueur pour la communication du club.
                </p>
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Signature" 
            subtitle="Veuillez signer le formulaire pour confirmer votre inscription"
          >
            <SignaturePad 
              onChange={setSignature}
              placeholder="Signez ici pour valider l'inscription"
            />
          </FormSection>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          type="submit" 
          disabled={!signature}
          className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
        >
          Soumettre l'inscription
        </Button>
      </div>
    </form>
  );
};

export default RegistrationForm;
