import React, { useEffect, useState } from "react";
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
import SignaturePad from "./ui/SignaturePad";
import SpellCheckModal from "./ui/SpellCheckModal";
import BirthDatePicker from "./BirthDatePicker";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface FormSectionProps {
  title: string;
  subtitle?: React.ReactNode; // <-- au lieu de `string`
  children: React.ReactNode;
}

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const NEXT_YEAR = CURRENT_YEAR + 1;

const AFTER_JULY_31 = CURRENT_DATE.getMonth() >= 7;

const BASE_YEAR = AFTER_JULY_31 ? NEXT_YEAR : CURRENT_YEAR - 1;

const SEASONS = [
  `${BASE_YEAR}/${BASE_YEAR + 1}`,
  `${BASE_YEAR + 1}/${BASE_YEAR + 2}`,
  `${BASE_YEAR + 2}/${BASE_YEAR + 3}`,
];

const CATEGORIES = ["U5", "U6", "U7", "U8", "U9"];

const TEN_MINUTES_MS = 10 * 60 * 1000;

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
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // États pour les informations du joueur
  const [season, setSeason] = useState(SEASONS[1]);
  const [academy, setAcademy] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [birthPlace, setBirthPlace] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [category, setCategory] = useState("");

  // États pour les responsables légaux (responsable principal)
  const [parent1Type, setParent1Type] = useState("père");
  const [parent1LastName, setParent1LastName] = useState("");
  const [parent1FirstName, setParent1FirstName] = useState("");
  const [parent1Phone, setParent1Phone] = useState("");
  const [parent1Email, setParent1Email] = useState("");
  const [parent1Address, setParent1Address] = useState("");
  const [parent1PostalCode, setParent1PostalCode] = useState("");
  const [parent1Gsm, setParent1Gsm] = useState("");

  // Pour le responsable secondaire (optionnel)
  const [parent2Type, setParent2Type] = useState("");
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
        season,
        academy,
        lastName,
        firstName,
        birthDate: birthDate ? birthDate.toISOString() : null,
        birthPlace,
        address,
        postalCode,
        city,
        currentClub,
        category,
        parent1Type,
        parent1LastName,
        parent1FirstName,
        parent1Phone,
        parent1Email,
        parent1Address,
        parent1PostalCode,
        parent1Gsm,
        parent2Type,
        parent2LastName,
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

  useEffect(() => {
    if (!cooldownEndTime) return;

    const interval = setInterval(() => {
      const remaining = cooldownEndTime - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        clearInterval(interval);
        setCooldownEndTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  // ✅ À appeler quand l’envoi du formulaire réussit
  const handleSuccessfulSubmit = () => {
    setCooldownEndTime(Date.now() + TEN_MINUTES_MS);
  };

  const isCooldown = cooldownEndTime !== null && timeLeft > 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isCooldown) {
            handleSubmit(e); // on passe bien l'event ici ✅
            handleSuccessfulSubmit(); // on démarre le cooldown de 10min
          }
        }}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sélection de la saison */}
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

              {/* Sélection de l'académie */}
              <FormSection
                title="Académie"
                subtitle="Veuillez sélectionner l'académie souhaitée pour l'inscription du joueur."
              >
                {/* Sélecteur */}
                <Select value={academy} onValueChange={setAcademy}>
                  <SelectTrigger className="form-input-base">
                    <SelectValue placeholder="Sélectionnez une académie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brussels Eagles Football Academy">
                      Brussels Eagles Football Academy
                    </SelectItem>
                    <SelectItem value="RF For Ever Academy">
                      RF For Ever Academy
                    </SelectItem>
                    <SelectItem value="RWDM Academy">RWDM Academy</SelectItem>
                  </SelectContent>
                </Select>

                {/* Lien vers la page À propos */}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Plus d'informations sur la page{" "}
                  <a
                    href="/about?tab=histoire#academies"
                    className="underline text-rwdm-blue hover:text-rwdm-red transition-colors"
                  >
                    À propos
                  </a>
                  .
                </p>
              </FormSection>
            </div>
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
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    className="form-input-base"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    className="form-input-base"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="mr-3">
                    Date de naissance *
                  </Label>
                  <BirthDatePicker
                    selectedDate={birthDate ?? null}
                    onChange={setBirthDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                  <Input
                    id="birthPlace"
                    className="form-input-base"
                    onChange={(e) => setBirthPlace(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    className="form-input-base"
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    className="form-input-base"
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    className="form-input-base"
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="currentClub"
                    className="flex items-center space-x-1"
                  >
                    <span>Club actuel</span>

                    {/* Icône d'information avec Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Si le joueur n'a pas de club, vous pouvez laisser
                          vide.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Input
                    id="currentClub"
                    className="form-input-base"
                    onChange={(e) => setCurrentClub(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
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
                      <Label htmlFor="parent1Type">Type *</Label>
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
                        <Label htmlFor="parent1LastName">Nom *</Label>
                        <Input
                          id="parent1LastName"
                          className="form-input-base"
                          value={parent1LastName}
                          onChange={(e) => setParent1LastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent1FirstName">Prénom *</Label>
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
                      <Label htmlFor="parent1Phone">Téléphone *</Label>
                      <Input
                        id="parent1Phone"
                        className="form-input-base"
                        type="tel"
                        onChange={(e) => setParent1Phone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Email">Email *</Label>
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
                      <Label htmlFor="parent1Address">Adresse *</Label>
                      <Input
                        id="parent1Address"
                        className="form-input-base"
                        onChange={(e) => setParent1Address(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1PostalCode">Code postal *</Label>
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
                        <Select
                          value={parent2Type}
                          onValueChange={setParent2Type}
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
            disabled={isCooldown || !signature}
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            {isCooldown
              ? "Veuillez patienter..."
              : "Soumettre la demande d'inscription"}
          </Button>
        </div>
      </form>

      {/* ⏳ Chrono visible en bas à gauche */}
      {isCooldown && (
        <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100">
          Vous pourrez renvoyer une demande d'inscription dans{" "}
          {formatTime(timeLeft)}
        </div>
      )}

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
