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
import { useTranslation } from "@/hooks/useTranslation";
import { FormProps } from "@/types/form";
import { API_BASE, fetchConfig } from "@/lib/api-config";

interface FormSectionProps {
  title: string;
  subtitle?: React.ReactNode; // <-- au lieu de `string`
  children: React.ReactNode;
}

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

const BASE_YEAR = CURRENT_YEAR;

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

const RegistrationForm: React.FC<FormProps> = ({
  formData,
  onFormDataChange,
  preselectedAcademy,
  disableAcademy = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t, lang } = useTranslation();
  const currentLang = lang.toUpperCase();
  // États pour les informations du joueur
  const [season, setSeason] = useState(SEASONS[1]);
  const [academy, setAcademy] = useState(preselectedAcademy || "");
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const spellCheckFields = [
    { label: t("spellcheck_field_player_last_name"), value: lastName },
    { label: t("spellcheck_field_player_first_name"), value: firstName },
    { label: t("spellcheck_field_parent1_last_name"), value: parent1LastName },
    {
      label: t("spellcheck_field_parent1_first_name"),
      value: parent1FirstName,
    },
    { label: t("spellcheck_field_parent1_email"), value: parent1Email },
  ];

  if (parent2LastName || parent2FirstName || parent2Email) {
    spellCheckFields.push(
      {
        label: t("spellcheck_field_parent2_last_name"),
        value: parent2LastName,
      },
      {
        label: t("spellcheck_field_parent2_first_name"),
        value: parent2FirstName,
      },
      { label: t("spellcheck_field_parent2_email"), value: parent2Email }
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthDate) {
      toast({
        title: t("toast_birthdate_missing_title"),
        description: t("toast_birthdate_missing_desc"),
        variant: "destructive",
      });
      return;
    }

    const age = getAge(birthDate);
    if (age < 4 || age > 9) {
      toast({
        title: t("toast_age_invalid_title"),
        description: t("toast_age_invalid_desc"),
        variant: "destructive",
      });
      return;
    }

    setIsSpellCheckOpen(true);
  };

  useEffect(() => {
    const storedEnd = localStorage.getItem("registrationCooldownEnd");
    if (storedEnd) {
      const endTime = parseInt(storedEnd, 10);
      if (Date.now() < endTime) {
        setCooldownEndTime(endTime);
      } else {
        localStorage.removeItem("registrationCooldownEnd");
      }
    }
  }, []);

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
    setIsSubmitting(true);
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
      // 1. Envoi de la demande vers la DB
      const response = await fetch(
        `${API_BASE}/api/requests`,
        {
          ...fetchConfig,
          method: "POST",
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      const { requestId } = await response.json();

      // 2. Envoi de l'email directement avec le template
      await fetch(
        `${API_BASE}/api/form-mail/send-registration-email`,
        {
          ...fetchConfig,
          method: "POST",
          body: JSON.stringify({
            formData: requestData.formData,
            requestId,
          }),
        }
      );

      // 3. Toast + Redirection
      toast({
        title: t("toast_success_title"),
        description: t("toast_success_description"),
      });

      setIsSpellCheckOpen(false);
      navigate("/success/registration");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast({
        title: t("toast_error_title"),
        description: t("toast_error_description"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    const endTime = Date.now() + TEN_MINUTES_MS;
    setCooldownEndTime(endTime);
    localStorage.setItem("registrationCooldownEnd", endTime.toString());
  };

  const isCooldown = cooldownEndTime !== null && timeLeft > 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleBirthDateChange = (date: Date | null) => {
    if (!date) {
      setBirthDate(undefined);
      return;
    }
    const age = getAge(date);
    if (age < 4 || age > 9) {
      toast({
        title: t("toast_age_invalid_title"),
        description: t("toast_age_invalid_desc"),
        variant: "destructive",
      });
      // on peut choisir de réinitialiser le champ
      setBirthDate(undefined);
      return;
    }
    setBirthDate(date);
  };

  // Ajoutez ces états pour tracker la synchronisation
  const [syncAddressWithPlayer, setSyncAddressWithPlayer] = useState(true);
  const [syncPostalCodeWithPlayer, setSyncPostalCodeWithPlayer] =
    useState(true);

  // Ajoutez ces effets pour synchroniser automatiquement
  useEffect(() => {
    if (syncAddressWithPlayer) {
      setParent1Address(address);
    }
  }, [address, syncAddressWithPlayer]);

  useEffect(() => {
    if (syncPostalCodeWithPlayer) {
      setParent1PostalCode(postalCode);
    }
  }, [postalCode, syncPostalCodeWithPlayer]);

  // Modifiez les champs d'adresse et code postal du parent1
  // Dans la partie "primary_guardian"
  <div className="space-y-2">
    <Label htmlFor="parent1Address">{t("label_parent_address")}</Label>
    <div className="relative">
      <Input
        id="parent1Address"
        className="form-input-base pr-8"
        value={parent1Address}
        onChange={(e) => {
          setParent1Address(alphaNumeric(e.target.value));
          setSyncAddressWithPlayer(false);
        }}
        placeholder="Rue Charles Malis 61"
        required
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={() => {
          setParent1Address("");
          setSyncAddressWithPlayer(false);
        }}
        aria-label="Effacer l'adresse"
      >
        ×
      </button>
    </div>
  </div>;

  <div className="space-y-2">
    <Label htmlFor="parent1PostalCode">{t("label_parent_postal_code")}</Label>
    <div className="relative">
      <Input
        id="parent1PostalCode"
        className="form-input-base pr-8"
        value={parent1PostalCode}
        onChange={(e) => {
          setParent1PostalCode(numbersOnly(e.target.value));
          setSyncPostalCodeWithPlayer(false);
        }}
        placeholder="1080"
        maxLength={4}
        required
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={() => {
          setParent1PostalCode("");
          setSyncPostalCodeWithPlayer(false);
        }}
        aria-label="Effacer le code postal"
      >
        ×
      </button>
    </div>
  </div>;

  // Ajoutez ces fonctions de validation en haut du composant
  const numbersOnly = (value: string) => value.replace(/[^0-9]/g, "");
  const lettersOnly = (value: string) => value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, "");
  const alphaNumeric = (value: string) =>
    value.replace(/[^a-zA-ZÀ-ÿ0-9\s-]/g, "");

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
            <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-6">
              {preselectedAcademy === "Brussels Eagles Football Academy" ? t("befa_registration_request") : t("academy_registration")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sélection de la saison */}
              <FormSection
                title={t("season_selection")}
                subtitle={t("season_selection_desc")}
              >
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger id="season" name="season" className="form-input-base">
                    <SelectValue placeholder={t("select_season_placeholder")} />
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
                title={t("academy_selection")}
                subtitle={t("academy_selection_desc")}
              >
                {/* Sélecteur */}
                <Select value={academy} onValueChange={setAcademy} disabled={disableAcademy}>
                  <SelectTrigger id="academy" name="academy" className="form-input-base">
                    <SelectValue
                      placeholder={t("select_academy_placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brussels Eagles Football Academy">
                      Eagles Brussels Football Academy
                    </SelectItem>
                    <SelectItem value="Red For Ever Academy">
                      DB ForEver Academy
                    </SelectItem>
                    <SelectItem value="RWDM Academy">
                      RWDM Academy
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Lien vers la page À propos */}
                <p
                  className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: t("academy_info_html") }}
                />
              </FormSection>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title={t("player_info")}
              subtitle={t("player_info_desc")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("label_last_name")}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    className="form-input-base"
                    value={lastName}
                    onChange={(e) => setLastName(lettersOnly(e.target.value))}
                    placeholder="Dupont"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("label_first_name")}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    className="form-input-base"
                    value={firstName}
                    onChange={(e) => setFirstName(lettersOnly(e.target.value))}
                    placeholder="Jean"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="mr-3">
                    {t("label_birth_date")}
                  </Label>
                  <BirthDatePicker
                    selectedDate={birthDate ?? null}
                    onChange={handleBirthDateChange}
                    required
                    id="birthDate"
                    name="birthDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">{t("label_birth_place")}</Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    autoComplete="address-level2"
                    className="form-input-base"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(lettersOnly(e.target.value))}
                    placeholder={t("brussels")}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address"> {t("label_address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    autoComplete="address-line1"
                    className="form-input-base"
                    value={address}
                    onChange={(e) => setAddress(alphaNumeric(e.target.value))}
                    placeholder="Rue Charles Malis 61"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t("label_postal_code")}</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    autoComplete="postal-code"
                    className="form-input-base"
                    value={postalCode}
                    onChange={(e) => setPostalCode(numbersOnly(e.target.value))}
                    placeholder="1080"
                    maxLength={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city"> {t("label_city")}</Label>
                  <Input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    className="form-input-base"
                    value={city}
                    onChange={(e) => setCity(lettersOnly(e.target.value))}
                    placeholder="Molenbeek-Saint-Jean"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="currentClub"
                    className="flex items-center space-x-1"
                  >
                    <span>{t("label_current_club")}</span>

                    {/* Icône d'information avec Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("tooltip_current_club")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Input
                    id="currentClub"
                    name="currentClub"
                    autoComplete="organization"
                    className="form-input-base"
                    value={currentClub}
                    onChange={(e) =>
                      setCurrentClub(alphaNumeric(e.target.value))
                    }
                    placeholder="RWDM Brussels"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category"> {t("label_category")}</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger id="category" name="category" className="form-input-base">
                      <SelectValue
                        placeholder={t("select_category_placeholder")}
                      />
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
              title={t("legal_info")}
              subtitle={t("legal_info_desc")}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-3">
                    {t("primary_guardian")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="parent1Type">
                        {t("label_guardian_type")}
                      </Label>
                      <Select
                        onValueChange={setParent1Type}
                        value={parent1Type}
                      >
                        <SelectTrigger id="parent1Type" name="parent1Type" className="form-input-base">
                          <SelectValue
                            placeholder={t("select_type_placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="père">
                            {t("option_father")}
                          </SelectItem>
                          <SelectItem value="mère">
                            {t("option_mother")}
                          </SelectItem>
                          <SelectItem value="tuteur">
                            {t("option_legal_guardian")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="parent1LastName">
                          {t("label_parent_last_name")}
                        </Label>
                        <Input
                          id="parent1LastName"
                          name="parent1LastName"
                          autoComplete="family-name"
                          className="form-input-base"
                          value={parent1LastName}
                          onChange={(e) =>
                            setParent1LastName(lettersOnly(e.target.value))
                          }
                          placeholder="Dupont"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent1FirstName">
                          {t("label_parent_first_name")}
                        </Label>
                        <Input
                          id="parent1FirstName"
                          name="parent1FirstName"
                          autoComplete="given-name"
                          className="form-input-base"
                          value={parent1FirstName}
                          onChange={(e) =>
                            setParent1FirstName(lettersOnly(e.target.value))
                          }
                          placeholder="Jean"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Phone">
                        {t("label_parent_phone")}
                      </Label>
                      <Input
                        id="parent1Phone"
                        name="parent1Phone"
                        autoComplete="tel"
                        className="form-input-base"
                        type="tel"
                        value={parent1Phone}
                        onChange={(e) =>
                          setParent1Phone(numbersOnly(e.target.value))
                        }
                        placeholder="0123456789"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Email">
                        {t("label_parent_email")}
                      </Label>
                      <Input
                        id="parent1Email"
                        name="parent1Email"
                        autoComplete="email"
                        className="form-input-base"
                        type="email"
                        value={parent1Email}
                        onChange={(e) =>
                          setParent1Email(e.target.value.toLowerCase())
                        }
                        placeholder="jean.dupont@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Address">
                        {t("label_parent_address")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="parent1Address"
                          name="parent1Address"
                          autoComplete="address-line1"
                          className="form-input-base pr-8"
                          value={parent1Address}
                          onChange={(e) => {
                            setParent1Address(alphaNumeric(e.target.value));
                            setSyncAddressWithPlayer(false);
                          }}
                          placeholder="Rue Charles Malis 61"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setParent1Address("");
                            setSyncAddressWithPlayer(false);
                          }}
                          aria-label="Effacer l'adresse"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1PostalCode">
                        {t("label_parent_postal_code")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="parent1PostalCode"
                          name="parent1PostalCode"
                          autoComplete="postal-code"
                          className="form-input-base pr-8"
                          value={parent1PostalCode}
                          onChange={(e) => {
                            setParent1PostalCode(numbersOnly(e.target.value));
                            setSyncPostalCodeWithPlayer(false);
                          }}
                          placeholder="1080"
                          maxLength={4}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setParent1PostalCode("");
                            setSyncPostalCodeWithPlayer(false);
                          }}
                          aria-label="Effacer le code postal"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent1Gsm">
                        {" "}
                        {t("label_parent_gsm")}
                      </Label>
                      <Input
                        id="parent1Gsm"
                        name="parent1Gsm"
                        autoComplete="tel"
                        className="form-input-base"
                        type="tel"
                        value={parent1Gsm}
                        onChange={(e) =>
                          setParent1Gsm(numbersOnly(e.target.value))
                        }
                        placeholder="0470123456"
                        maxLength={10}
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
                    {t("secondary_guardian_button")}
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
                        <Label htmlFor="parent2Type">
                          {t("label_guardian_type")}
                        </Label>
                        <Select
                          value={parent2Type}
                          onValueChange={setParent2Type}
                        >
                          <SelectTrigger id="parent2Type" name="parent2Type" className="form-input-base">
                            <SelectValue
                              placeholder={t("select_type_placeholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="père">
                              {t("option_father")}
                            </SelectItem>
                            <SelectItem value="mère">
                              {t("option_mother")}
                            </SelectItem>
                            <SelectItem value="tuteur">
                              {t("option_legal_guardian")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="parent2LastName">
                            {t("label_parent_last_name")}
                          </Label>
                          <Input
                            id="parent2LastName"
                            name="parent2LastName"
                            autoComplete="family-name"
                            className="form-input-base"
                            value={parent2LastName}
                            onChange={(e) =>
                              setParent2LastName(lettersOnly(e.target.value))
                            }
                            placeholder="Dupont"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent2FirstName">
                            {t("label_parent_first_name")}
                          </Label>
                          <Input
                            id="parent2FirstName"
                            name="parent2FirstName"
                            autoComplete="given-name"
                            className="form-input-base"
                            value={parent2FirstName}
                            onChange={(e) =>
                              setParent2FirstName(lettersOnly(e.target.value))
                            }
                            placeholder="Jean"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2Phone">
                          {" "}
                          {t("label_parent_phone")}
                        </Label>
                        <Input
                          id="parent2Phone"
                          name="parent2Phone"
                          autoComplete="tel"
                          className="form-input-base"
                          type="tel"
                          value={parent2Phone}
                          onChange={(e) =>
                            setParent2Phone(numbersOnly(e.target.value))
                          }
                          placeholder="0123456789"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2Email">
                          {" "}
                          {t("label_parent_email")}
                        </Label>
                        <Input
                          id="parent2Email"
                          name="parent2Email"
                          autoComplete="email"
                          className="form-input-base"
                          type="email"
                          value={parent2Email}
                          onChange={(e) =>
                            setParent2Email(e.target.value.toLowerCase())
                          }
                          placeholder="jean.dupont@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2Address">
                          {" "}
                          {t("label_parent_address")}
                        </Label>
                        <Input
                          id="parent2Address"
                          name="parent2Address"
                          autoComplete="address-line1"
                          className="form-input-base"
                          value={parent2Address}
                          onChange={(e) =>
                            setParent2Address(alphaNumeric(e.target.value))
                          }
                          placeholder="Rue Charles Malis 61"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2PostalCode">
                          {" "}
                          {t("label_parent_postal_code")}
                        </Label>
                        <Input
                          id="parent2PostalCode"
                          name="parent2PostalCode"
                          autoComplete="postal-code"
                          className="form-input-base"
                          value={parent2PostalCode}
                          onChange={(e) =>
                            setParent2PostalCode(numbersOnly(e.target.value))
                          }
                          placeholder="1080"
                          maxLength={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent2Gsm">
                          {" "}
                          {t("label_parent_gsm")}
                        </Label>
                        <Input
                          id="parent2Gsm"
                          name="parent2Gsm"
                          autoComplete="tel"
                          className="form-input-base"
                          type="tel"
                          value={parent2Gsm}
                          onChange={(e) =>
                            setParent2Gsm(numbersOnly(e.target.value))
                          }
                          placeholder="0470123456"
                          maxLength={10}
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
              title={t("consent_image")}
              subtitle={t("consent_image_desc")}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="imageConsent"
                  checked={imageConsent}
                  onCheckedChange={(checked) => setImageConsent(!!checked)}
                />
                <Label htmlFor="imageConsent" className="cursor-pointer">
                  {t("consent_image_label")}
                </Label>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection title={t("signature")} subtitle={t("signature_desc")}>
              <div className="space-y-4">
                {/* Voici la correction: on ne peut pas avoir un div enfant d'un p */}
                <div
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: t("signature_reminder_html"),
                  }}
                />
                <SignaturePad onChange={setSignature} />
                <p className="text-sm text-gray-500 mt-2">
                  {t("label_date")} {currentDate}
                </p>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacyPolicy"
            checked={hasAcceptedPolicy}
            onCheckedChange={(checked) => setHasAcceptedPolicy(!!checked)}
            className="w-5 h-5 text-rwdm-blue border-gray-300 rounded focus:ring-rwdm-blue"
          />
          <Label
            htmlFor="privacyPolicy"
            className="text-sm text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: t("accept_policy_html") }}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isCooldown || !signature || !hasAcceptedPolicy}
            className={`
              px-8 py-6 rounded-lg text-base
              ${
                isCooldown || !signature || !hasAcceptedPolicy
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white"
              }
              button-transition
            `}
          >
            {isCooldown ? t("button_submit_loading") : t("button_submit")}
          </Button>
        </div>
      </form>

      {isCooldown && (
        <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100">
          {t("cooldown_message").replace("{{time}}", formatTime(timeLeft))}
        </div>
      )}

      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title={t("spellcheck_title")}
        loading={isSubmitting}
      />
    </>
  );
};

export default RegistrationForm;
