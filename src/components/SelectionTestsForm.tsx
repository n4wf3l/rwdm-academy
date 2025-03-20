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
import { Info, CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import { useToast } from "@/hooks/use-toast";
import BirthDatePicker from "./BirthDatePicker";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  children,
}) => (
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

  // États pour les informations sur les tests
  const [noyau, setNoyau] = useState<string>("");
  const [testStartDate, setTestStartDate] = useState<Date | null>(null);
  const [testEndDate, setTestEndDate] = useState<Date | null>(null);

  // États pour les informations du joueur
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [playerBirthDate, setPlayerBirthDate] = useState<Date | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [currentClub, setCurrentClub] = useState<string>("");
  const [previousClub, setPreviousClub] = useState<string>("");
  const [position, setPosition] = useState<string>("");

  // États pour les informations du responsable légal
  const [parentLastName, setParentLastName] = useState<string>("");
  const [parentFirstName, setParentFirstName] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [parentRelation, setParentRelation] = useState<string>("parent"); // "parent" ou "representant"

  // Autres états
  const [signature, setSignature] = useState<string | null>(null);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState<boolean>(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);

  // Gestion des dates avec vérification
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast({
        title: "Erreur",
        description: "La date de début ne peut pas être dans le passé.",
        variant: "destructive",
      });
      return;
    }
    setTestStartDate(date);
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
    today.setHours(0, 0, 0, 0);
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

  const getAge = (birthDate: Date): number => {
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
          "Le joueur doit avoir entre 4 et 20 ans pour passer le test technique.",
        variant: "destructive",
      });
      return;
    }
    setIsSpellCheckOpen(true);
  };

  const finalSubmit = async () => {
    const requestData = {
      type: "selection-tests",
      formData: {
        // Informations sur les tests
        noyau, // Ex: "U6"
        testStartDate, // Date de début (ISO)
        testEndDate, // Date de fin (ISO)
        // Informations du joueur
        lastName, // Nom du joueur
        firstName, // Prénom du joueur
        playerBirthDate, // Date de naissance du joueur (ISO)
        phone, // Téléphone (GSM) du joueur
        email, // Email du joueur
        currentClub, // Club actuel
        previousClub, // Club précédent
        position, // Position du joueur
        // Informations du responsable légal
        parentLastName, // Nom du responsable
        parentFirstName, // Prénom du responsable
        parentEmail, // Email du responsable
        parentPhone, // Téléphone (GSM) du responsable
        parentRelation, // Relation ("parent" ou "representant")
        // Signature
        signature, // Signature (base64)
        createdAt: new Date().toISOString(),
      },
      assignedTo: null,
    };

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        {/* Informations sur les tests */}
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Informations sur les tests"
              subtitle="Veuillez sélectionner le noyau et la période des tests"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="noyau">Noyau</Label>
                  <Select onValueChange={setNoyau}>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez un noyau" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOYAUX.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        {/* Informations du joueur */}
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
                  <Label htmlFor="playerBirthDate" className="mr-3">Date de naissance</Label>
                  <BirthDatePicker
                    selectedDate={playerBirthDate}
                    onChange={setPlayerBirthDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (GSM) du joueur</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="form-input-base"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email du joueur</Label>
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
                  <Label htmlFor="currentClub">Club actuel du joueur</Label>
                  <Input
                    id="currentClub"
                    className="form-input-base"
                    value={currentClub}
                    onChange={(e) => setCurrentClub(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousClub">Club précédent du joueur</Label>
                  <Input
                    id="previousClub"
                    className="form-input-base"
                    value={previousClub}
                    onChange={(e) => setPreviousClub(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select onValueChange={setPosition} required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez une position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        {/* Informations des responsables légaux */}
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
                  <Label htmlFor="parentPhone">Téléphone (GSM) du parent</Label>
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
                  <Label htmlFor="parentEmail">Email du parent</Label>
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
                  <Select
                    onValueChange={setParentRelation}
                    defaultValue="parent"
                  >
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

        {/* Signature */}
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

        {/* Section réservée au secrétariat */}
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

        {/* Politique de confidentialité */}
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
        fields={[
          { label: "Nom du joueur", value: lastName },
          { label: "Prénom du joueur", value: firstName },
          { label: "Email du joueur", value: email },
          { label: "Nom du parent", value: parentLastName },
          { label: "Prénom du parent", value: parentFirstName },
          { label: "Email du parent", value: parentEmail },
        ]}
        title="Vérification des informations pour les tests"
      />
    </>
  );
};

export default SelectionTestsForm;
