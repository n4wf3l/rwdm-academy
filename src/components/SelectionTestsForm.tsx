import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import { useToast } from "@/hooks/use-toast";
import BirthDatePicker from "./BirthDatePicker";

interface FormSection {
  title: string;
  subtitle?: string;
}

const FormSection: React.FC<FormSection & { children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-rwdm-blue dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
};

const NOYAUX = [
  "U5",
  "U6",
  "U7",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U21",
];
const POSITIONS = ["Gardien", "Défenseur", "Milieu de terrain", "Attaquant"];

const SelectionTestsForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testStartDate, setTestStartDate] = useState<Date | null>(null);
  const [testEndDate, setTestEndDate] = useState<Date | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [playerBirthDate, setPlayerBirthDate] = useState<Date | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [parentLastName, setParentLastName] = useState<string>("");
  const [parentFirstName, setParentFirstName] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser à minuit

    if (date < today) {
      toast({
        title: "Erreur",
        description: "La date de début ne peut pas être dans le passé.",
        variant: "destructive",
      });
      return;
    }

    setTestStartDate(date);

    // Vérifier si la date de fin est antérieure à la nouvelle date de début
    if (testEndDate && date > testEndDate) {
      setTestEndDate(null);
      toast({
        title: "Erreur",
        description: "La date de fin ne peut pas être avant la date de début.",
        variant: "destructive",
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser à minuit

    if (date < today) {
      toast({
        title: "Erreur",
        description: "La date de fin ne peut pas être dans le passé.",
        variant: "destructive",
      });
      return;
    }

    if (testStartDate && date < testStartDate) {
      toast({
        title: "Erreur",
        description: "La date de fin ne peut pas être avant la date de début.",
        variant: "destructive",
      });
      return;
    }

    setTestEndDate(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerBirthDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner la date de naissance du joueur.",
        variant: "destructive",
      });
      return;
    }

    const age = getAge(playerBirthDate);

    if (age < 4 || age > 20) {
      toast({
        title: "Âge non valide",
        description:
          "Le joueur doit avoir entre 4 ans et 20 ans pour pouvoir passer le test technique.",
        variant: "destructive",
      });
      return;
    }

    // Si toutes les validations sont passées, ouvrir la modale de vérification
    setIsSpellCheckOpen(true);
  };

  function getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  const finalSubmit = async () => {
    const requestData = {
      type: "selection-tests", // Type de la demande
      formData: {
        lastName,
        firstName,
        playerBirthDate,
        email,
        parentLastName,
        parentFirstName,
        parentEmail,
        testStartDate,
        testEndDate,
        signature,
        createdAt: new Date().toISOString(),
      },
      assignedTo: null, // Assignation à un admin plus tard
    };

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      toast({
        title: "Formulaire soumis",
        description: "Votre demande de test a été envoyée avec succès.",
      });

      setIsSpellCheckOpen(false);
      navigate("/success/selectionTests");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
        variant: "destructive",
      });
    }
  };

  const spellCheckFields = [
    { label: "Nom du joueur", value: lastName },
    { label: "Prénom du joueur", value: firstName },
    { label: "Email du joueur", value: email },
    { label: "Nom du parent", value: parentLastName },
    { label: "Prénom du parent", value: parentFirstName },
    { label: "Email du parent", value: parentEmail },
  ];

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
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
                        <SelectItem key={noyau} value={noyau}>
                          {noyau}
                        </SelectItem>
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
                              format(testStartDate, "dd/MM/yyyy", {
                                locale: fr,
                              })
                            ) : (
                              <span>Date de début</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 pointer-events-auto"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={testStartDate}
                            onSelect={handleStartDateChange}
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
                        <PopoverContent
                          className="w-auto p-0 pointer-events-auto"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={testEndDate}
                            onSelect={handleEndDateChange}
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
                  <Input
                    id="lastName"
                    className="form-input-base"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    className="form-input-base"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <div className="space-y-4">
                    <BirthDatePicker
                      selectedDate={playerBirthDate}
                      onChange={setPlayerBirthDate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (GSM)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="form-input-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center space-x-1"
                  >
                    <span>Email</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Si le joueur n'a pas d'email, vous pouvez indiquer
                          celui du responsable légal.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    className="form-input-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentClub">Club actuel</Label>
                  <Input
                    id="currentClub"
                    className="form-input-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousClub">Club précédent</Label>
                  <Input id="previousClub" className="form-input-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez une position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">Nom</Label>
                  <Input
                    id="parentLastName"
                    className="form-input-base"
                    value={parentLastName}
                    onChange={(e) => setParentLastName(e.target.value)}
                    required
                  />
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
                  <Label htmlFor="parentPhone">Téléphone (GSM)</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    className="form-input-base"
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parentRelation">Relation</Label>
                  <Select defaultValue="parent">
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez la relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="representant">Représentant</SelectItem>
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

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="privacyPolicy"
            checked={hasAcceptedPolicy}
            onChange={(e) => setHasAcceptedPolicy(e.target.checked)}
            className="w-5 h-5 text-rwdm-blue border-gray-300 rounded focus:ring-rwdm-blue"
            required
          />
          <label
            htmlFor="privacyPolicy"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            J'accepte la{" "}
            <a
              href="/legal"
              target="_blank"
              className="text-rwdm-blue underline"
            >
              politique de confidentialité
            </a>
            .
          </label>
        </div>

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

      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title="Vérification des informations pour les tests"
      />
    </>
  );
};

export default SelectionTestsForm;
