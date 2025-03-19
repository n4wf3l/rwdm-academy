import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Info } from "lucide-react";
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
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import BirthDatePicker from "./BirthDatePicker";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CURRENT_YEAR = new Date().getFullYear();
const SEASONS = [
  `${CURRENT_YEAR - 1}/${CURRENT_YEAR}`,
  `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR + 1}/${CURRENT_YEAR + 2}`,
];
const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
const CATEGORIES = ["U5", "U6", "U7", "U8", "U9"];

const FormSection: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
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

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // États pour les informations du joueur
  const [season, setSeason] = useState(SEASONS[1]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [birthPlace, setBirthPlace] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("");

  // États pour les responsables légaux (responsable principal)
  const [parent1Type, setParent1Type] = useState("père"); // valeur par défaut
  const [parent1LastName, setParent1LastName] = useState("");
  const [parent1FirstName, setParent1FirstName] = useState("");
  const [parent1Phone, setParent1Phone] = useState("");
  const [parent1Email, setParent1Email] = useState("");
  const [parent1Address, setParent1Address] = useState("");
  const [parent1PostalCode, setParent1PostalCode] = useState("");
  const [parent1Gsm, setParent1Gsm] = useState("");

  // Pour le responsable secondaire (optionnel)
  const [parent2LastName, setParent2LastName] = useState("");
  const [parent2FirstName, setParent2FirstName] = useState("");
  const [parent2Email, setParent2Email] = useState("");
  const [parent2Phone, setParent2Phone] = useState("");
  const [parent2Address, setParent2Address] = useState("");
  const [parent2PostalCode, setParent2PostalCode] = useState("");
  const [parent2Gsm, setParent2Gsm] = useState("");
  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);

  // Autres états
  const [imageConsent, setImageConsent] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);

  const currentDate = format(new Date(), "dd/MM/yyyy");

  // Champs pour la vérification orthographique
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

    setIsSpellCheckOpen(true);
  };

  // Calcule l'âge du joueur
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
      type: "registration",
      formData: {
        season, // ex : "2025/2026"
        lastName, // Nom du joueur
        firstName, // Prénom du joueur
        birthDate: birthDate ? birthDate.toISOString() : null, // Converti en ISO
        birthPlace, // Lieu de naissance
        address, // Adresse
        postalCode, // Code postal
        city, // Ville
        currentClub, // Club actuel
        position, // Position
        category, // Catégorie (ex: U9)
        parent1Type, // Type du responsable principal
        parent1LastName, // Nom du responsable principal
        parent1FirstName, // Prénom du responsable principal
        parent1Phone, // Téléphone du responsable principal
        parent1Email, // Email du responsable principal
        parent1Address, // Adresse du responsable principal
        parent1PostalCode, // Code postal du responsable principal
        parent1Gsm, // GSM du responsable principal
        parent2LastName, // Responsables secondaires (optionnel)
        parent2FirstName,
        parent2Email,
        parent2Phone,
        parent2Address,
        parent2PostalCode,
        parent2Gsm,
        imageConsent,
        signature,
        createdAt: new Date().toISOString(),
      },
      assignedTo: null,
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

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
        {/* Saison d'inscription */}
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Saison d'inscription"
              subtitle="Veuillez sélectionner la saison pour laquelle vous souhaitez inscrire le joueur"
            >
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="form-input-base">
                  <SelectValue placeholder="Sélectionnez une saison" />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <BirthDatePicker
                    selectedDate={birthDate ?? null}
                    onChange={setBirthDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Lieu de naissance</Label>
                  <Input
                    id="birthPlace"
                    className="form-input-base"
                    onChange={(e) => setBirthPlace(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    className="form-input-base"
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    className="form-input-base"
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    className="form-input-base"
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentClub">Club actuel</Label>
                  <Input
                    id="currentClub"
                    className="form-input-base"
                    onChange={(e) => setCurrentClub(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select onValueChange={setPosition} value={position}>
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
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-3">
                    Responsable principal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="parent1Type">Type</Label>
                      <Select
                        onValueChange={setParent1Type}
                        value={parent1Type}
                      >
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
                        onChange={(e) => setParent1Phone(e.target.value)}
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
                        onChange={(e) => setParent1Address(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1PostalCode">Code postal</Label>
                      <Input
                        id="parent1PostalCode"
                        className="form-input-base"
                        onChange={(e) => setParent1PostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Gsm">GSM</Label>
                      <Input
                        id="parent1Gsm"
                        className="form-input-base"
                        type="tel"
                        onChange={(e) => setParent1Gsm(e.target.value)}
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
                          onChange={(e) => setParent2Phone(e.target.value)}
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
                          onChange={(e) => setParent2Address(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2PostalCode">Code postal</Label>
                        <Input
                          id="parent2PostalCode"
                          className="form-input-base"
                          onChange={(e) => setParent2PostalCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2Gsm">GSM</Label>
                        <Input
                          id="parent2Gsm"
                          className="form-input-base"
                          type="tel"
                          onChange={(e) => setParent2Gsm(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        {/* Consentement à l'image */}
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
                  onCheckedChange={(checked) => setImageConsent(!!checked)}
                />
                <Label htmlFor="imageConsent" className="cursor-pointer">
                  J'accepte que des photos de mon enfant soient prises et
                  utilisées à des fins promotionnelles.
                </Label>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        {/* Signature */}
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
            Soumettre la demande d'inscription
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
