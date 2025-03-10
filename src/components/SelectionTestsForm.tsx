
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const NOYAUX = ["U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U21"];

const SelectionTestsForm: React.FC = () => {
  const [testStartDate, setTestStartDate] = useState<Date | undefined>();
  const [testEndDate, setTestEndDate] = useState<Date | undefined>();
  const [signature, setSignature] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tests de sélection form submitted");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up">
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Informations sur les tests" 
            subtitle="Veuillez sélectionner le noyau et la période des tests"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="noyau">Noyau</Label>
                <Select>
                  <SelectTrigger className="form-input-base">
                    <SelectValue placeholder="Sélectionnez un noyau" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOYAUX.map((noyau) => (
                      <SelectItem key={noyau} value={noyau}>{noyau}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Période</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "form-input-base justify-start text-left font-normal",
                            !testStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {testStartDate ? (
                            format(testStartDate, "dd/MM/yyyy", { locale: fr })
                          ) : (
                            <span>Date de début</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={testStartDate}
                          onSelect={setTestStartDate}
                          initialFocus
                          locale={fr}
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "form-input-base justify-start text-left font-normal",
                            !testEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {testEndDate ? (
                            format(testEndDate, "dd/MM/yyyy", { locale: fr })
                          ) : (
                            <span>Date de fin</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={testEndDate}
                          onSelect={setTestEndDate}
                          initialFocus
                          locale={fr}
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
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
                        "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Sélectionnez une date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      initialFocus
                      locale={fr}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentClub">Club actuel</Label>
                <Input id="currentClub" className="form-input-base" required />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" className="form-input-base" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" className="form-input-base" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="form-input-base" required />
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
            <div className="space-y-2">
              <Label htmlFor="parentName">Nom du parent/tuteur</Label>
              <Input id="parentName" className="form-input-base" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentRelation">Relation</Label>
              <Select defaultValue="père">
                <SelectTrigger className="form-input-base">
                  <SelectValue placeholder="Sélectionnez la relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="père">Père</SelectItem>
                  <SelectItem value="mère">Mère</SelectItem>
                  <SelectItem value="tuteur">Tuteur légal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Téléphone</Label>
              <Input id="parentPhone" type="tel" className="form-input-base" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email</Label>
              <Input id="parentEmail" type="email" className="form-input-base" required />
            </div>
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Signature" 
            subtitle="Veuillez signer pour confirmer votre inscription aux tests de sélection"
          >
            <SignaturePad 
              onChange={setSignature}
              placeholder="Signez ici pour valider l'inscription aux tests"
            />
          </FormSection>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardContent className="pt-6">
          <FormSection 
            title="Partie réservée au secrétariat" 
            subtitle="Ne pas remplir"
          >
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Cette section sera complétée par le secrétariat du club
              </p>
            </div>
          </FormSection>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          type="submit" 
          disabled={!signature}
          className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
        >
          Soumettre la demande de test
        </Button>
      </div>
    </form>
  );
};

export default SelectionTestsForm;
