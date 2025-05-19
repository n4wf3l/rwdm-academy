import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MedicalReportPDF from "./MedicalReportPDF";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, Info, Upload, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SignaturePad from "./ui/SignaturePad";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import SpellCheckModal from "./ui/SpellCheckModal";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; // Assurez-vous que ce chemin est correct
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";

interface FormSectionProps {
  title: string;
  subtitle?: React.ReactNode;
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

interface FormProps {
  formData: Record<string, any>;
  onFormDataChange: (key: string, value: any) => void;
}

const AccidentReportForm: React.FC<FormProps> = ({
  formData,
  onFormDataChange,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [accidentDate, setAccidentDate] = useState(formData.accidentDate);
  const [accidentCode, setAccidentCode] = useState(formData.accidentCode || "");
  const [codeDossier, setCodeDossier] = useState<string>("");
  const [healingCode, setHealingCode] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  const [clubName, setClubName] = useState<string>("RWDM"); // Met RWDM par défaut
  const [playerLastName, setPlayerLastName] = useState<string>("");
  const [playerFirstName, setPlayerFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [phone, setPhone] = useState<string>("");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);
  const [accidentDescription, setAccidentDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(""); // État pour la catégorie
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [hasSentDeclaration, setHasSentDeclaration] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [academy, setAcademy] = useState<string>("RWDM Academy");
  const [documentType, setDocumentType] = useState<
    "accident-report" | "healing-certificate"
  >("accident-report");

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    const differenceInTime = today.getTime() - date.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    if (date > today) {
      toast({
        title: t("date_invalid_title"),
        description: t("date_invalid_desc"),
        variant: "destructive",
      });
    } else if (differenceInDays > 19) {
      toast({
        title: t("declaration_refused_title"),
        description: t("declaration_refused_desc"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("declaration_valid_title"),
        description: t("declaration_valid_desc"),
        variant: "default",
      });
      setAccidentDate(date);
      setOpen(false); // ✅ ferme le calendrier après sélection valide
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpellCheckOpen(true);
  };

  useEffect(() => {
    const lastSubmit = localStorage.getItem("accidentLastSubmitTime");
    if (lastSubmit) {
      const diff = Math.floor((Date.now() - parseInt(lastSubmit)) / 1000);
      if (diff < 600) {
        setIsCooldown(true);
        setCooldownRemaining(600 - diff);
      }
    }
  }, []);

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
    // à chaque fois qu'on change de type de document, on vide la zone d'upload
    setPdfFiles([]);
  }, [documentType]);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAccidentCode(code);
    setCodeDossier(code);
    toast({
      title: t("toast_generate_code_title"),
      description: t("toast_generate_code_desc"),
      variant: "default",
    });
  };

  const checkCodeValidity = async (code: string, emailToMatch: string) => {
    if (!code || !emailToMatch) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/check-accident-code?code=${code}&email=${emailToMatch}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCodeValid(data.valid);
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
      setCodeValid(false);
    }
  };

  const finalSubmit = async () => {
    // Vérification du nombre de fichiers
    if (
      (documentType === "healing-certificate" && pdfFiles.length === 0) ||
      (documentType === "accident-report" && pdfFiles.length !== 1)
    ) {
      toast({
        title: t("toast_file_error_title"),
        description:
          documentType === "healing-certificate"
            ? t("toast_file_error_healing_desc")
            : t("toast_file_error_accident_desc"),
        variant: "destructive",
      });
      return;
    }

    // Vérification du code pour le certificat
    if (documentType === "healing-certificate" && !codeValid) {
      toast({
        title: t("toast_invalid_code_title"),
        description: t("toast_invalid_code_desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload des fichiers
      const formData = new FormData();
      pdfFiles.forEach((file) => formData.append("pdfFiles", file));

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("upload_error");
      }
      if (response.status === 413) {
        toast({
          title: t("toast_upload_too_large_title"),
          description: t("toast_upload_too_large_desc"),
          variant: "destructive",
        });
        return;
      }

      const fileData = await response.json();
      if (!fileData.filePaths || !Array.isArray(fileData.filePaths)) {
        throw new Error("invalid_file_paths");
      }

      // Préparation de la requête finale
      const requestData = {
        type: "accident-report",
        formData: {
          clubName,
          academy,
          playerLastName,
          playerFirstName,
          email,
          phone,
          accidentDate,
          description: accidentDescription,
          filePaths: fileData.filePaths,
          signature,
          category,
          codeDossier:
            documentType === "accident-report" ? accidentCode : healingCode,
          documentLabel:
            documentType === "healing-certificate"
              ? t("document_label_healing")
              : t("document_label_accident"),
        },
        assignedTo: null,
      };

      // Envoi du formulaire
      const requestResponse = await fetch(
        "http://localhost:5000/api/requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );
      if (!requestResponse.ok) {
        throw new Error("submit_error");
      }

      const { requestId } = await requestResponse.json();

      // Envoi de l'email de confirmation
      await fetch(
        "http://localhost:5000/api/form-mail/send-accident-report-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: requestData.formData, requestId }),
        }
      );

      // Toast de succès
      toast({
        title: t("toast_submit_success_title"),
        description: t("toast_submit_success_desc"),
      });

      // Cooldown et redirection
      localStorage.setItem("accidentLastSubmitTime", Date.now().toString());
      setIsCooldown(true);
      setCooldownRemaining(600);
      navigate("/success/accidentReport");
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
      // Choix du message d'erreur
      let titleKey = "toast_general_error_title";
      let descKey = "toast_general_error_desc";
      if ((error as Error).message === "upload_error") {
        titleKey = "toast_upload_error_title";
        descKey = "toast_upload_error_desc";
      }
      toast({
        title:
          error.message === "upload_error"
            ? t("toast_upload_error_title")
            : t("toast_general_error_title"),
        description:
          error.message === "upload_error"
            ? t("toast_upload_error_desc")
            : t("toast_general_error_desc"),
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // Convertit la FileList en tableau et supprime les doublons par nom
    const newFiles = Array.from(e.target.files);
    const allFiles = [...pdfFiles, ...newFiles].filter(
      (file, index, self) =>
        index === self.findIndex((f) => f.name === file.name)
    );

    // 3 fichiers max pour le certificat, 1 pour la déclaration
    const maxFiles = documentType === "healing-certificate" ? 3 : 1;

    if (allFiles.length > maxFiles) {
      toast({
        title: "Trop de fichiers",
        description: `Maximum ${maxFiles} fichier${
          maxFiles > 1 ? "s" : ""
        } autorisé${maxFiles > 1 ? "s" : ""}.`,
        variant: "destructive",
      });
      return;
    }

    // On ne conserve que les maxFiles premiers
    const limitedFiles = allFiles.slice(0, maxFiles);

    // Autorise PDF, JPG/JPEG, PNG, taille 10 Mo max
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const invalidFiles = limitedFiles.filter(
      (file) =>
        !allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      toast({
        title: "Fichier invalide",
        description:
          "Seuls les PDF, JPG ou PNG de moins de 10 Mo sont autorisés.",
        variant: "destructive",
      });
      return;
    }

    // Tout est OK
    setPdfFiles(limitedFiles);
  };

  const UploadSection = ({
    files,
    setFiles,
    handleFileChange,
    documentType,
  }: {
    files: File[];
    setFiles: (files: File[]) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    documentType: "accident-report" | "healing-certificate";
  }) => {
    const { t } = useTranslation();
    const inputId = `pdfUpload-${documentType}`;
    const acceptAttr =
      documentType === "accident-report"
        ? "application/pdf"
        : "application/pdf,image/jpeg,image/png";
    const multipleAttr = documentType === "healing-certificate";

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
              <div
                className="mb-2 text-sm text-gray-500 dark:text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: t("upload_click_to_upload"),
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {documentType === "healing-certificate"
                  ? t("upload_guidance_pdf").replace("{{max}}", "3")
                  : t("upload_guidance_single")}
              </p>
            </div>
            <input
              id={inputId}
              name="pdfFiles"
              type="file"
              accept={acceptAttr}
              multiple={multipleAttr}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <span className="text-sm truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  className="text-xs text-rwdm-red hover:text-rwdm-red/80 transition-colors"
                >
                  {t("button_remove_file")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const spellCheckFields = [
    { label: t("spellcheck_field_player_last_name"), value: playerLastName },
    { label: t("spellcheck_field_player_first_name"), value: playerFirstName },
    { label: t("spellcheck_field_email"), value: email },
    { label: t("spellcheck_field_phone"), value: phone },
  ];

  return (
    <>
      <Card className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up pb-6">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-6">
            {t("accident_report")}
          </h2>
          <FormSection
            title={t("accident_info_alert_title")}
            subtitle={
              <div
                className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t("accident_info_alert_html"),
                }}
              />
            }
            children={null}
          />

          <MedicalReportPDF />
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isCooldown) return;
          handleSubmit(e);
        }}
        className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up pt-6"
      >
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title={t("accident_section_title")}
              subtitle={t("accident_section_subtitle")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date de l'accident */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accidentDate"
                    className="flex items-center space-x-1"
                  >
                    <span>{t("label_accident_date")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("tooltip_accident_date")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-input-base justify-start text-left font-normal w-full",
                          !accidentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {accidentDate ? (
                          format(accidentDate, "PPP", { locale: fr })
                        ) : (
                          <span>{t("select_date_placeholder")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 pointer-events-auto"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={accidentDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={fr}
                        className="p-3"
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Nom du club */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clubName">{t("label_club_name")}</Label>
                  <Input
                    id="clubName"
                    className="form-input-base"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    required
                  />
                </div>

                {/* Académie & Catégorie côte à côte */}
                <div className="space-y-2 md:col-span-2 grid md:grid-cols-2 gap-5">
                  {/* Académie */}
                  <div className="space-y-2">
                    <Label htmlFor="academy">{t("label_academy")}</Label>
                    <Select value={academy} onValueChange={setAcademy} required>
                      <SelectTrigger className="form-input-base">
                        <SelectValue
                          placeholder={t("placeholder_select_academy")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWDM Academy">
                          RWDM Academy
                        </SelectItem>
                        <SelectItem value="Brussels Eagles Football Academy">
                          Brussels Eagles Football Academy
                        </SelectItem>
                        <SelectItem value="Red For Ever Academy">
                          Red For Ever Academy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Catégorie */}
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("label_category")}</Label>
                    <Select onValueChange={setCategory} required>
                      <SelectTrigger className="form-input-base">
                        <SelectValue placeholder={t("placeholder_category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 17 }, (_, i) => i + 5)
                          .filter((age) => age !== 20)
                          .map((age) => (
                            <SelectItem key={`U${age}`} value={`U${age}`}>
                              {`U${age}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nom du joueur */}
                <div className="space-y-2">
                  <Label htmlFor="playerLastName">
                    {t("label_player_last_name")}
                  </Label>
                  <Input
                    id="playerLastName"
                    className="form-input-base"
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    required
                  />
                </div>

                {/* Prénom du joueur */}
                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">
                    {t("label_player_first_name")}
                  </Label>
                  <Input
                    id="playerFirstName"
                    className="form-input-base"
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* E-mail & Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("label_email")}</Label>
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
                  <Label htmlFor="phone">{t("label_phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="form-input-base"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description de l'accident */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="accidentDescription">
                  {t("label_accident_description")}
                </Label>
                <Textarea
                  id="accidentDescription"
                  className="form-input-base min-h-32"
                  placeholder={t("placeholder_accident_description")}
                  required
                  maxLength={700}
                  value={accidentDescription}
                  onChange={(e) => setAccidentDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {t("accident_description_counter").replace(
                    "{{count}}",
                    accidentDescription.length.toString()
                  )}
                </p>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title={t("document_section_title")}
              subtitle={t("document_section_subtitle")}
            >
              <Tabs
                defaultValue="accident-report"
                value={documentType}
                onValueChange={(value) =>
                  setDocumentType(
                    value as "accident-report" | "healing-certificate"
                  )
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="accident-report">
                    {t("tabs_accident_report")}
                  </TabsTrigger>
                  <TabsTrigger value="healing-certificate">
                    {t("tabs_healing_certificate")}
                  </TabsTrigger>
                </TabsList>

                {/* Déclaration d'accident */}
                <TabsContent value="accident-report">
                  <div className="space-y-4">
                    <div className="flex gap-3 items-end">
                      <div className="w-full">
                        <Label htmlFor="accidentCode">
                          {t("label_accident_code")}
                        </Label>
                        <Input
                          id="accidentCode"
                          value={accidentCode}
                          readOnly
                          placeholder={t("placeholder_accident_code")}
                          className="form-input-base bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          required
                        />
                      </div>
                      <Button type="button" onClick={generateCode}>
                        {t("button_generate_code")}
                      </Button>
                    </div>

                    <div
                      className="text-sm text-gray-500 dark:text-gray-400"
                      dangerouslySetInnerHTML={{
                        __html: t("accident_code_info_html"),
                      }}
                    />

                    <UploadSection
                      files={pdfFiles}
                      setFiles={setPdfFiles}
                      handleFileChange={handleFileChange}
                      documentType={documentType}
                    />
                  </div>
                </TabsContent>

                {/* Certificat de guérison */}
                <TabsContent value="healing-certificate">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="confirmSent"
                        checked={hasSentDeclaration}
                        onChange={(e) =>
                          setHasSentDeclaration(e.target.checked)
                        }
                        className="mt-1"
                      />
                      <label
                        htmlFor="confirmSent"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {t("checkbox_healing_sent")}
                      </label>
                    </div>

                    {hasSentDeclaration && (
                      <>
                        <div>
                          <Label htmlFor="healingCode">
                            {t("label_healing_code")}
                          </Label>
                          <Input
                            id="healingCode"
                            value={healingCode}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setHealingCode(val);
                              checkCodeValidity(val, email);
                            }}
                            placeholder={t("placeholder_healing_code")}
                            className={`form-input-base ${
                              codeValid === false
                                ? "border-red-500"
                                : codeValid === true
                                ? "border-green-500"
                                : ""
                            }`}
                            required
                          />
                        </div>

                        {codeValid === true && (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {t("healing_code_valid").replace(
                              "{{email}}",
                              email
                            )}
                          </p>
                        )}
                        {codeValid === false && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {t("healing_code_invalid").replace(
                              "{{email}}",
                              email || t("not_provided")
                            )}
                          </p>
                        )}

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("healing_upload_prompt")}
                        </p>

                        <UploadSection
                          files={pdfFiles}
                          setFiles={setPdfFiles}
                          handleFileChange={handleFileChange}
                          documentType="healing-certificate"
                        />
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title={t("signature_section_title")}
              subtitle={t("signature_section_subtitle")}
            >
              <div className="space-y-4">
                <div
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: t("signature_privacy_html"),
                  }}
                />
                <div
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: t("signature_label_html"),
                  }}
                />
                <SignaturePad
                  onChange={setSignature}
                  placeholder={t("signature_placeholder_decla")}
                />
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
            <div
              dangerouslySetInnerHTML={{ __html: t("accept_policy_html") }}
            />
          </label>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={
              isCooldown ||
              !signature ||
              !hasAcceptedPolicy ||
              !accidentDate ||
              !clubName ||
              !academy ||
              !playerLastName ||
              !playerFirstName ||
              !email ||
              !phone ||
              !accidentDescription ||
              !category ||
              (documentType === "accident-report"
                ? accidentCode === "" || pdfFiles.length !== 1
                : !hasSentDeclaration ||
                  healingCode === "" ||
                  !codeValid ||
                  pdfFiles.length === 0 ||
                  pdfFiles.length > 2)
            }
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            {isCooldown
              ? t("button_submit_accident_loading")
              : t("button_submit_accident")}
          </Button>
        </div>
      </form>

      {isCooldown && (
        <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100">
          Vous pourrez renvoyer une déclaration dans{" "}
          <strong>
            {Math.floor(cooldownRemaining / 60)
              .toString()
              .padStart(2, "0")}
            :{(cooldownRemaining % 60).toString().padStart(2, "0")}
          </strong>
        </div>
      )}
      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title={t("spellcheck_title_2")}
      />
    </>
  );
};

export default AccidentReportForm;
