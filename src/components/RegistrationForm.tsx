import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import { useToast } from "@/hooks/use-toast";
import BirthDatePicker from "./BirthDatePicker";
import { motion } from "framer-motion";

const CURRENT_YEAR = new Date().getFullYear();
const SEASONS = [
  `${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
  `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR + 1}/${CURRENT_YEAR + 2}`,
];

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
const CATEGORIES = ["U5", "U6", "U7", "U8", "U9"];

const FormSection = ({ title, subtitle, children }) => {
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

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [imageConsent, setImageConsent] = useState<boolean>(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [parent1LastName, setParent1LastName] = useState<string>("");
  const [parent1FirstName, setParent1FirstName] = useState<string>("");
  const [parent1Email, setParent1Email] = useState<string>("");
  const [parent2LastName, setParent2LastName] = useState<string>("");
  const [parent2FirstName, setParent2FirstName] = useState<string>("");
  const [parent2Email, setParent2Email] = useState<string>("");
  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner la date de naissance du joueur.",
        variant: "destructive",
      });
      return;
    }

    const age = getAge(birthDate);

    if (age < 4 || age > 9) {
      toast({
        title: "Âge non valide",
        description:
          "Le joueur doit avoir entre 4 ans et 9 ans pour pouvoir s'inscrire.",
        variant: "destructive",
      });
      return;
    }

    // Ouvrir la vérification d'orthographe AVANT d'envoyer les données
    setIsSpellCheckOpen(true);
  };

  const finalSubmit = async () => {
    const requestData = {
      type: "registration",
      formData: {
        lastName,
        firstName,
        birthDate,
        parent1LastName,
        parent1FirstName,
        parent1Email,
        parent2LastName,
        parent2FirstName,
        parent2Email,
        imageConsent,
        signature,
        createdAt: new Date().toISOString(),
      },
      assignedTo: null, // Laisse vide par défaut, un admin peut l'assigner plus tard
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
        description: "Votre inscription a été envoyée avec succès.",
      });

      setIsSpellCheckOpen(false);
      navigate("/success/registration");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
        variant: "destructive",
      });
    }
  };

  function getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    // Vérifier si l'anniversaire n'est pas encore passé cette année
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  const currentDate = format(new Date(), "dd/MM/yyyy");

  const spellCheckFields = [
    { label: "Nom du joueur", value: lastName },
    { label: "Prénom du joueur", value: firstName },
    { label: "Nom du parent principal", value: parent1LastName },
    { label: "Prénom du parent principal", value: parent1FirstName },
    { label: "Email du parent principal", value: parent1Email },
  ];
  if (parent2LastName || parent2FirstName || parent2Email) {
    spellCheckFields.push(
      { label: "Nom du parent secondaire", value: parent2LastName },
      { label: "Prénom du parent secondaire", value: parent2FirstName },
      { label: "Email du parent secondaire", value: parent2Email }
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
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
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
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
                    {/* Passez la date et la fonction onChange au BirthDatePicker */}
                    <BirthDatePicker
                      selectedDate={birthDate ?? null}
                      onChange={setBirthDate}
                    />
                  </div>
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
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" className="form-input-base" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" className="form-input-base" required />
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
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="flex items-center space-x-1"
                  >
                    <span>Catégorie</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          L'inscription n'est possible que jusqu'à U9. Pour les
                          catégories supérieures, des tests techniques sont
                          requis (voir deuxième formulaire).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Select>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-3">
                    Responsable principal
                  </h4>
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

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="parent1LastName">Nom</Label>
                        <Input
                          id="parent1LastName"
                          className="form-input-base"
                          value={parent1LastName}
                          onChange={(e) => setParent1LastName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent1FirstName">Prénom</Label>
                        <Input
                          id="parent1FirstName"
                          className="form-input-base"
                          value={parent1FirstName}
                          onChange={(e) => setParent1FirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent1Phone">Téléphone</Label>
                      <Input
                        id="parent1Phone"
                        className="form-input-base"
                        type="tel"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent1Email">Email</Label>
                      <Input
                        id="parent1Email"
                        className="form-input-base"
                        type="email"
                        value={parent1Email}
                        onChange={(e) => setParent1Email(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent1Address">Adresse</Label>
                      <Input
                        id="parent1Address"
                        className="form-input-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent1PostalCode">Code postal</Label>
                      <Input
                        id="parent1PostalCode"
                        className="form-input-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent1Gsm">GSM</Label>
                      <Input
                        id="parent1Gsm"
                        className="form-input-base"
                        type="tel"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full text-base font-medium mb-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md"
                    onClick={() =>
                      setShowSecondaryGuardian(!showSecondaryGuardian)
                    }
                  >
                    Responsable secondaire (optionnel)
                    <motion.div
                      animate={{ rotate: showSecondaryGuardian ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: showSecondaryGuardian ? "auto" : 0,
                      opacity: showSecondaryGuardian ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
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

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="parent2LastName">Nom</Label>
                          <Input
                            id="parent2LastName"
                            className="form-input-base"
                            value={parent2LastName}
                            onChange={(e) => setParent2LastName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="parent2FirstName">Prénom</Label>
                          <Input
                            id="parent2FirstName"
                            className="form-input-base"
                            value={parent2FirstName}
                            onChange={(e) =>
                              setParent2FirstName(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2Phone">Téléphone</Label>
                        <Input
                          id="parent2Phone"
                          className="form-input-base"
                          type="tel"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2Email">Email</Label>
                        <Input
                          id="parent2Email"
                          className="form-input-base"
                          type="email"
                          value={parent2Email}
                          onChange={(e) => setParent2Email(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2Address">Adresse</Label>
                        <Input
                          id="parent2Address"
                          className="form-input-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2PostalCode">Code postal</Label>
                        <Input
                          id="parent2PostalCode"
                          className="form-input-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2Gsm">GSM</Label>
                        <Input
                          id="parent2Gsm"
                          className="form-input-base"
                          type="tel"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Consentement à l'image"
              subtitle="Veuillez donner votre consentement pour l'utilisation d'images"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="imageConsent"
                  checked={imageConsent}
                  onCheckedChange={(checked) => setImageConsent(!!checked)} // Assure un booléen
                />
                <Label htmlFor="imageConsent" className="cursor-pointer">
                  J'accepte que des photos de mon enfant soient prises et
                  utilisées à des fins promotionnelles.
                </Label>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Signature"
              subtitle="Veuillez signer ci-dessous"
            >
              <SignaturePad onChange={setSignature} />
              <p className="text-sm text-gray-500 mt-2">Date : {currentDate}</p>
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
        title="Vérification des informations d'inscription"
      />
    </>
  );
};

export default RegistrationForm;
