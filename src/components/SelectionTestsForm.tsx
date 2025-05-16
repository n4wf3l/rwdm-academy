import React, { useEffect, useRef, useState } from "react";
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
import { useTranslation } from "@/hooks/useTranslation";

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

const SelectionTestsForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useTranslation();

  const NOYAUX = React.useMemo(
    () => [
      t("category_U5"),
      t("category_U6"),
      t("category_U7"),
      t("category_U8"),
      t("category_U9"),
      t("category_U10"),
      t("category_U11"),
      t("category_U12"),
      t("category_U13"),
      t("category_U14_full"),
      t("category_U15_full"),
      t("category_U16"),
      t("category_U17"),
      t("category_U18"),
      t("category_U19_full"),
      t("category_U21"),
    ],
    [t]
  );

  const POSITIONS = React.useMemo(
    () => [
      t("position_goalkeeper"),
      t("position_right_back"),
      t("position_left_back"),
      t("position_center_back"),
      t("position_defensive_mid"),
      t("position_central_mid"),
      t("position_attacking_mid"),
      t("position_right_wing"),
      t("position_left_wing"),
      t("position_striker"),
    ],
    [t]
  );

  const ACADEMIES = React.useMemo(
    () => [t("academy_RWDM_elite"), t("academy_RFE_provincial")],
    [t]
  );
  // États pour les informations sur les tests
  const [noyau, setNoyau] = useState<string>("");
  const [academy, setAcademy] = useState<string>("");
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
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Gestion des dates avec vérification
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast({
        title: t("selection_error_date_past_title"),
        description: t("selection_error_date_past_desc"),
        variant: "destructive",
      });
      return;
    }
    setTestStartDate(date);
    if (testEndDate && date > testEndDate) {
      setTestEndDate(null);
      toast({
        title: t("selection_error_end_before_start_title"),
        description: t("selection_error_end_before_start_desc"),
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
        title: t("selection_error_date_past_title"),
        description: t("selection_error_date_past_desc"),
        variant: "destructive",
      });
      return;
    }
    if (testStartDate && date < testStartDate) {
      toast({
        title: t("selection_error_end_before_start_title"),
        description: t("selection_error_end_before_start_desc"),
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

  useEffect(() => {
    const isPetit = ["U5", "U6", "U7", "U8", "U9"].some((prefix) =>
      noyau.startsWith(prefix)
    );

    if (isPetit) {
      setPosition(t("selection_position_default"));
    } else {
      setPosition(""); // autoriser la sélection manuelle
    }
  }, [noyau, t]);

  useEffect(() => {
    if (!isCooldown) return;

    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          setIsCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [isCooldown]);

  useEffect(() => {
    const lastSubmit = localStorage.getItem("selectionTestsLastSubmitTime");
    if (lastSubmit) {
      const diff = Math.floor((Date.now() - parseInt(lastSubmit)) / 1000);
      if (diff < 600) {
        setIsCooldown(true);
        setCooldownRemaining(600 - diff);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown) return;

    if (!playerBirthDate) {
      toast({
        title: t("selection_error_birthdate_missing_title"),
        description: t("selection_error_birthdate_missing_desc"),
        variant: "destructive",
      });
      return;
    }
    const age = getAge(playerBirthDate);
    if (age < 4 || age > 20) {
      toast({
        title: t("selection_error_age_invalid_title"),
        description: t("selection_error_age_invalid_desc"),
        variant: "destructive",
      });
      return;
    }
    if (!academy) {
      toast({
        title: t("selection_error_academy_missing_title"),
        description: t("selection_error_academy_missing_desc"),
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
        noyau,
        academy,
        testStartDate,
        testEndDate,
        // Informations du joueur
        lastName,
        firstName,
        playerBirthDate,
        phone,
        email,
        currentClub,
        previousClub,
        position,
        // Informations du responsable légal
        parentLastName,
        parentFirstName,
        parentEmail,
        parentPhone,
        parentRelation,
        // Signature
        signature,
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

      const { requestId } = await response.json(); // 🆔 Récupère l'ID généré

      // ✅ Envoi de l'email de confirmation
      await fetch(
        "http://localhost:5000/api/form-mail/send-selection-test-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData: requestData.formData,
            requestId,
          }),
        }
      );

      toast({
        title: t("selection_success_submission_title"),
        description: t("selection_success_submission_description"),
      });
      setIsSpellCheckOpen(false);
      localStorage.setItem(
        "selectionTestsLastSubmitTime",
        Date.now().toString()
      );
      setIsCooldown(true);
      setCooldownRemaining(600);
      navigate("/success/selectionTests");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast({
        title: t("selection_error_submission_title"),
        description: t("selection_error_submission_description"),
        variant: "destructive",
      });
    }
  };

  const spellCheckFields = [
    {
      label: t("selection_spellcheck_field_player_last_name"),
      value: lastName,
    },
    {
      label: t("selection_spellcheck_field_player_first_name"),
      value: firstName,
    },
    { label: t("selection_spellcheck_field_player_email"), value: email },
    {
      label: t("selection_spellcheck_field_parent_last_name"),
      value: parentLastName,
    },
    {
      label: t("selection_spellcheck_field_parent_first_name"),
      value: parentFirstName,
    },
    { label: t("selection_spellcheck_field_parent_email"), value: parentEmail },
  ];

  useEffect(() => {
    if (["U5", "U6", "U7", "U8", "U9"].includes(noyau)) {
      setPosition(t("selection_position_default"));
    } else {
      setPosition(""); // Réinitialiser si l'utilisateur choisit un autre noyau
    }
  }, [noyau, t]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
        {/* Informations sur les tests */}
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-6">
              {t("selection_tests")}
            </h2>
            <FormSection
              title={t("selection_tests_section_title")}
              subtitle={t("selection_tests_section_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Colonne 1 : Catégorie */}
                <div className="space-y-2">
                  <Label htmlFor="noyau">{t("selection_label_category")}</Label>
                  <Select onValueChange={setNoyau} value={noyau} required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue
                        placeholder={t("selection_placeholder_category")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {NOYAUX.map((option) => {
                        const [main, noteWithParen] = option.split("(");
                        const note = noteWithParen
                          ? noteWithParen.replace(")", "")
                          : null;
                        return (
                          <SelectItem key={option} value={option}>
                            <span>{main.trim()}</span>
                            {note && (
                              <span className="ml-1 text-xs text-gray-500">
                                ({note.trim()})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Colonne 2 : Académie */}
                <div className="space-y-2">
                  <Label htmlFor="academy">
                    {t("selection_label_academy")}
                  </Label>
                  <Select onValueChange={setAcademy} value={academy} required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue
                        placeholder={t("selection_placeholder_academy")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(["U15", "U14", "U19"].some((p) => noyau.startsWith(p))
                        ? ACADEMIES
                        : ["RWDM Academy"]
                      ).map((option) => (
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
              title={t("selection_player_section_title")}
              subtitle={t("selection_player_section_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("selection_label_last_name")}
                  </Label>
                  <Input
                    id="lastName"
                    className="form-input-base"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("selection_label_first_name")}
                  </Label>
                  <Input
                    id="firstName"
                    className="form-input-base"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerBirthDate" className="mr-3">
                    {t("selection_label_birth_date")}
                  </Label>
                  <BirthDatePicker
                    selectedDate={playerBirthDate}
                    onChange={setPlayerBirthDate}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("selection_label_phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="form-input-base"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("selection_label_email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    className="form-input-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="currentClub"
                    className="flex items-center space-x-1"
                  >
                    <span>{t("selection_label_current_club")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("selection_tooltip_current_club")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="currentClub"
                    className="form-input-base"
                    value={currentClub}
                    onChange={(e) => setCurrentClub(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="previousClub"
                    className="flex items-center space-x-1"
                  >
                    <span>{t("selection_label_previous_club")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("selection_tooltip_previous_club")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="previousClub"
                    className="form-input-base"
                    value={previousClub}
                    onChange={(e) => setPreviousClub(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">
                    {t("selection_label_position")}
                  </Label>
                  {["U5", "U6", "U7", "U8", "U9"].includes(noyau) ? (
                    <Input
                      id="position"
                      className="form-input-base bg-gray-100 text-gray-500 cursor-not-allowed"
                      value={t("selection_position_default")}
                      disabled
                    />
                  ) : (
                    <Select
                      onValueChange={setPosition}
                      value={position}
                      required
                    >
                      <SelectTrigger className="form-input-base">
                        <SelectValue
                          placeholder={t("selection_placeholder_position")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        {/* Informations des responsables légaux */}
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title={t("selection_legal_section_title")}
              subtitle={t("selection_legal_section_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">
                    {t("selection_label_parent_last_name")}
                  </Label>
                  <Input
                    id="parentLastName"
                    className="form-input-base"
                    value={parentLastName}
                    onChange={(e) => setParentLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentFirstName">
                    {t("selection_label_parent_first_name")}
                  </Label>
                  <Input
                    id="parentFirstName"
                    className="form-input-base"
                    value={parentFirstName}
                    onChange={(e) => setParentFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">
                    {t("selection_label_parent_phone")}
                  </Label>
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
                  <Label htmlFor="parentEmail">
                    {t("selection_label_parent_email")}
                  </Label>
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
                  <Label htmlFor="parentRelation">
                    {t("selection_label_parent_relation")}
                  </Label>
                  <Select
                    onValueChange={setParentRelation}
                    value={parentRelation}
                    required
                  >
                    <SelectTrigger className="form-input-base">
                      <SelectValue
                        placeholder={t("selection_placeholder_parent_relation")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">
                        {t("selection_option_parent")}
                      </SelectItem>
                      <SelectItem value="representant">
                        {t("selection_option_representative")}
                      </SelectItem>
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
              title={t("selection_signature_section_title")}
              subtitle={t("selection_signature_section_subtitle")}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t("selection_signature_info")}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>{t("selection_signature_label")}</strong>
                </p>
                <SignaturePad
                  onChange={setSignature}
                  placeholder={t("selection_signature_placeholder")}
                />
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
            dangerouslySetInnerHTML={{
              __html: t("selection_accept_policy_html"),
            }}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!signature || isCooldown}
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            {isCooldown
              ? t("selection_button_cooldown").replace(
                  "{{time}}",
                  `${Math.floor(cooldownRemaining / 60)
                    .toString()
                    .padStart(2, "0")}:${(cooldownRemaining % 60)
                    .toString()
                    .padStart(2, "0")}`
                )
              : t("selection_button_submit")}
          </Button>
        </div>
      </form>

      {isCooldown && (
        <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100">
          {t("selection_cooldown_message").replace(
            "{{time}}",
            `${String(Math.floor(cooldownRemaining / 60)).padStart(
              2,
              "0"
            )}:${String(cooldownRemaining % 60).padStart(2, "0")}`
          )}
        </div>
      )}

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
