import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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
import DatePicker from "react-datepicker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { API_BASE, fetchConfig } from "@/lib/api-config";
import { FormProps } from "@/types/form";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
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

const ResponsibilityWaiverForm: React.FC<FormProps> = ({
  formData,
  onFormDataChange,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [parentLastName, setParentLastName] = useState(
    formData.parentLastName || ""
  );
  const [parentFirstName, setParentFirstName] = useState(
    formData.parentFirstName || ""
  );
  const [parentPhone, setParentPhone] = useState(formData.parentPhone || "");
  const [parentEmail, setParentEmail] = useState(formData.parentEmail || "");
  const [playerLastName, setPlayerLastName] = useState(
    formData.playerLastName || ""
  );
  const [playerFirstName, setPlayerFirstName] = useState(
    formData.playerFirstName || ""
  );
  const [playerBirthDate, setPlayerBirthDate] = useState<Date | null>(
    formData.playerBirthDate ? new Date(formData.playerBirthDate) : null
  );
  const [currentClub, setCurrentClub] = useState(formData.currentClub || "");
  const [previousClub, setPreviousClub] = useState(formData.previousClub || "");
  const [signatureDate, setSignatureDate] = useState<Date | undefined>(
    formData.signatureDate ? new Date(formData.signatureDate) : new Date()
  );
  const [signature, setSignature] = useState<string | null>(formData.signature);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [approvalText, setApprovalText] = useState("");
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpellCheckOpen(true);
  };

  interface BirthDatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    onCalendarOpen?: () => void;
    onCalendarClose?: () => void;
  }

  const finalSubmit = async () => {
    try {
      // 1️⃣ Vérification des champs obligatoires
      if (
        !parentLastName ||
        !parentFirstName ||
        !parentPhone ||
        !parentEmail ||
        !playerLastName ||
        !playerFirstName ||
        !playerBirthDate ||
        !currentClub ||
        !signatureDate ||
        !approvalText ||
        !signature
      ) {
        console.error("❌", t("toast_error_description_required"));
        toast({
          title: t("toast_error_title"),
          description: t("toast_error_description_required"),
          variant: "destructive",
        });
        return;
      }

      // 2️⃣ Upload de la signature
      let filePath: string | null = null;
      if (signature) {
        const signatureFormData = new FormData();
        const blob = await fetch(signature).then((res) => res.blob());
        signatureFormData.append("pdfFiles", blob, "signature.png");

        const uploadResponse = await fetch(
          `${API_BASE}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: signatureFormData,
          }
        );
        if (!uploadResponse.ok) {
          toast({
            title: t("toast_error_title"),
            description: t("toast_error_upload_signature"),
            variant: "destructive",
          });
          const err = await uploadResponse.json();
          throw new Error(err.error || t("toast_error_upload_signature"));
        }
        const uploadData = await uploadResponse.json();
        filePath = uploadData.filePath;
      }

      // 3️⃣ Construction de requestData
      const requestData = {
        type: "responsibility-waiver",
        formData: {
          parentLastName,
          parentFirstName,
          parentPhone,
          parentEmail,
          playerLastName,
          playerFirstName,
          playerBirthDate: format(playerBirthDate, "yyyy-MM-dd"),
          currentClub,
          previousClub: previousClub || null,
          signatureDate: format(signatureDate, "yyyy-MM-dd"),
          approvalText,
          signature,
          filePath,
        },
        assignedTo: null,
      };

      // 4️⃣ Enregistrement en base
      const response = await fetch(
        `${API_BASE}/api/requests`,
        {
          ...fetchConfig,
          method: "POST",
          body: JSON.stringify(requestData),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t("toast_error_api"));
      }
      const { requestId } = await response.json();

      // 5️⃣ Envoi de l’email de confirmation
      const emailResponse = await fetch(
        `${API_BASE}/api/form-mail/send-waiver-email`,
        {
          ...fetchConfig,
          method: "POST",
          body: JSON.stringify({
            formData: requestData.formData,
            requestId,
          }),
        }
      );
      if (!emailResponse.ok) {
        console.warn("Email send failed:", await emailResponse.text());
      }

      // 6️⃣ Succès final
      toast({
        title: t("toast_success_waiver_title"),
        description: t("toast_success_waiver_description"),
      });
      const now = Date.now();
      localStorage.setItem("waiverLastSubmitTime", now.toString());
      setIsCooldown(true);
      setCooldownRemaining(600);
      navigate("/success/responsibilityWaiver");
    } catch (error) {
      console.error("❌", error);
      toast({
        title: t("toast_error_title"),
        description: t("toast_error_generic_description"),
        variant: "destructive",
      });
    }
  };

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
    const lastSubmit = localStorage.getItem("waiverLastSubmitTime");
    if (lastSubmit) {
      const diff = Math.floor((Date.now() - parseInt(lastSubmit)) / 1000);
      if (diff < 600) {
        setIsCooldown(true);
        setCooldownRemaining(600 - diff);
      }
    }
  }, []);

  const raw = t("waiver_text_template");

  // 2. replace each placeholder
  const waiverText = raw
    .replace("{{parentFirstName}}", parentFirstName || "")
    .replace("{{parentLastName}}", parentLastName || "")
    .replace("{{playerFirstName}}", playerFirstName || "")
    .replace("{{playerLastName}}", playerLastName || "")
    .replace(
      "{{playerBirthDate}}",
      playerBirthDate ? format(playerBirthDate, "dd/MM/yyyy") : ""
    )
    .replace("{{currentClub}}", currentClub || "");

  const spellCheckFields = [
    { label: t("spellcheck_field_parent_last_name"), value: parentLastName },
    { label: t("spellcheck_field_parent_first_name"), value: parentFirstName },
    { label: t("spellcheck_field_parent_email"), value: parentEmail },
    { label: t("spellcheck_field_player_last_name"), value: playerLastName },
    { label: t("spellcheck_field_player_first_name"), value: playerFirstName },
  ];

  const lettersOnly = (value: string) => value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, "");
  const numbersOnly = (value: string) => value.replace(/[^0-9]/g, "");
  const alphaNumeric = (value: string) =>
    value.replace(/[^a-zA-ZÀ-ÿ0-9\s-]/g, "");

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isCooldown) return;
          handleSubmit(e);
        }}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up"
      >
        <Card
          className={cn(
            "glass-panel transition-all duration-300",
            isCalendarOpen ? "min-h-[650px]" : "min-h-[250px]"
          )}
        >
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-6">
              {t("liability_waiver")}
            </h2>
            <FormSection
              title={t("waiver_player_info_title")}
              subtitle={t("waiver_player_info_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="playerLastName">
                    {t("label_player_last_name")}
                  </Label>
                  <Input
                    id="playerLastName"
                    name="playerLastName"
                    autoComplete="family-name"
                    className="form-input-base"
                    value={playerLastName}
                    onChange={(e) =>
                      setPlayerLastName(lettersOnly(e.target.value))
                    }
                    placeholder="Dupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">
                    {t("label_player_first_name")}
                  </Label>
                  <Input
                    id="playerFirstName"
                    name="playerFirstName"
                    autoComplete="given-name"
                    className="form-input-base"
                    value={playerFirstName}
                    onChange={(e) =>
                      setPlayerFirstName(lettersOnly(e.target.value))
                    }
                    placeholder="Jean"
                    required
                  />
                </div>

                {/* Gestion dynamique de l'affichage du calendrier */}
                <div className="space-y-2 relative">
                  <Label htmlFor="birthDate">
                    {t("label_player_birth_date")}
                  </Label>
                  <div className="space-y-4">
                    <BirthDatePicker
                      selectedDate={playerBirthDate}
                      onChange={(date) => {
                        setPlayerBirthDate(date);
                        setIsCalendarOpen(false);
                      }}
                      onCalendarOpen={() => setIsCalendarOpen(true)}
                      onCalendarClose={() => setIsCalendarOpen(false)}
                      required
                      id="playerBirthDate"
                      name="playerBirthDate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentClub">{t("label_current_club")}</Label>
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
              title={t("waiver_parent_info_title")}
              subtitle={t("waiver_parent_info_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">
                    {t("label_parent_last_name")}
                  </Label>
                  <Input
                    id="parentLastName"
                    name="parentLastName"
                    autoComplete="family-name"
                    className="form-input-base"
                    value={parentLastName}
                    onChange={(e) =>
                      setParentLastName(lettersOnly(e.target.value))
                    }
                    placeholder="Dupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentFirstName">
                    {t("label_parent_first_name")}
                  </Label>
                  <Input
                    id="parentFirstName"
                    name="parentFirstName"
                    autoComplete="given-name"
                    className="form-input-base"
                    value={parentFirstName}
                    onChange={(e) =>
                      setParentFirstName(lettersOnly(e.target.value))
                    }
                    placeholder="Jean"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">{t("label_parent_phone")}</Label>
                  <Input
                    id="parentPhone"
                    name="parentPhone"
                    autoComplete="tel"
                    type="tel"
                    className="form-input-base"
                    value={parentPhone}
                    onChange={(e) =>
                      setParentPhone(numbersOnly(e.target.value))
                    }
                    placeholder="0470123456"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">{t("label_parent_email")}</Label>
                  <Input
                    id="parentEmail"
                    name="parentEmail"
                    autoComplete="email"
                    type="email"
                    className="form-input-base"
                    value={parentEmail}
                    onChange={(e) =>
                      setParentEmail(e.target.value.toLowerCase())
                    }
                    placeholder="jean.dupont@email.com"
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
              title={t("waiver_waiver_title")}
              subtitle={t("waiver_waiver_subtitle")}
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {waiverText}
                </p>
              </div>
            </FormSection>
          </CardContent>

          <CardContent className="pt-6">
            <FormSection
              title={t("waiver_date_confirmation_title")}
              subtitle={t("waiver_date_confirmation_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="waiverDate">{t("label_waiver_date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-input-base justify-start text-left font-normal",
                          "text-muted-foreground"
                        )}
                        disabled
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(signatureDate, "PPP", { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 absolute z-[100] overflow-visible"
                      align="start"
                      forceMount
                    >
                      <Calendar
                        mode="single"
                        selected={signatureDate}
                        disabled={() => true}
                        locale={fr}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalText">
                    {t("label_approval_text")}
                  </Label>
                  <Select onValueChange={setApprovalText} required>
                    <SelectTrigger id="approvalText" name="approvalText" className="form-input-base">
                      <SelectValue
                        placeholder={t("placeholder_approval_text")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={t("option_approval_text")}>
                        {t("option_approval_text")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
          </CardContent>

          <CardContent className="pt-6">
            <FormSection
              title={t("signature_section_title")}
              subtitle={t("signature_section_subtitle")}
            >
              <SignaturePad
                onChange={setSignature}
                placeholder={t("signature_placeholder_waiver")}
              />
            </FormSection>
          </CardContent>
        </Card>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacyPolicy"
            checked={hasAcceptedPolicy}
            onCheckedChange={(checked) => setHasAcceptedPolicy(!!checked)}
            className="w-5 h-5 text-rwdm-blue border-gray-300 rounded focus:ring-rwdm-blue"
            required
          />
          <Label
            htmlFor="privacyPolicy"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            <div
              className="inline"
              dangerouslySetInnerHTML={{ __html: t("accept_policy_html") }}
            />
          </Label>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={
              !signature ||
              approvalText !== t("option_approval_text") ||
              !hasAcceptedPolicy ||
              isCooldown
            }
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            {t("button_submit_waiver")}
          </Button>
        </div>
      </form>

      {/* Timer en bas à gauche */}
      {isCooldown && (
        <div
          className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100"
          dangerouslySetInnerHTML={{
            __html: t("cooldown_message_waiver_html").replace(
              "{{time}}",
              `<strong>${String(Math.floor(cooldownRemaining / 60)).padStart(
                2,
                "0"
              )}:${String(cooldownRemaining % 60).padStart(2, "0")}</strong>`
            ),
          }}
        />
      )}

      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title={t("spellcheck_title_waiver")}
      />
    </>
  );
};

export default ResponsibilityWaiverForm;
