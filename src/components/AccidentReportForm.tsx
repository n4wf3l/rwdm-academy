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

const AccidentReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accidentDate, setAccidentDate] = useState<Date | undefined>();
  const [accidentCode, setAccidentCode] = useState<string>(""); // Pour déclaration d'accident
  const [healingCode, setHealingCode] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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
  const [codeDossier, setCodeDossier] = useState<string>("");
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [hasSentDeclaration, setHasSentDeclaration] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
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
        title: "Date invalide",
        description: "Vous ne pouvez pas déclarer un accident dans le futur.",
        variant: "destructive",
      });
    } else if (differenceInDays > 19) {
      toast({
        title: "Déclaration refusée",
        description:
          "Votre déclaration ne peut plus être prise en compte, car l'accident a eu lieu il y a plus de 19 jours.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déclaration valide",
        description:
          "Votre déclaration d'accident respecte la limite du délai de 19 jours.",
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

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCodeDossier(code);

    toast({
      title: "Code généré avec succès",
      description:
        "Conservez bien ce code pour pouvoir lier votre certificat de guérison plus tard.",
      variant: "default", // tu peux mettre "success" si tu veux un style spécial
    });
  };

  const checkCodeValidity = async (code: string, emailToMatch: string) => {
    if (!code || !emailToMatch) return;

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const allRequests = await response.json();

      if (!Array.isArray(allRequests)) {
        console.error(
          "La réponse de l'API n'est pas un tableau :",
          allRequests
        );
        setCodeValid(false);
        return;
      }

      const matching = allRequests.find((req) => {
        if (req.type !== "accident-report") return false;

        try {
          const parsedData = JSON.parse(req.data);

          return (
            parsedData.codeDossier === code &&
            parsedData.documentLabel === "Déclaration d'accident" &&
            parsedData.email?.toLowerCase() === emailToMatch.toLowerCase()
          );
        } catch (e) {
          console.warn("Impossible de parser req.data pour req.id =", req.id);
          return false;
        }
      });

      setCodeValid(!!matching);
    } catch (err) {
      console.error("Erreur lors de la vérification du code :", err);
      setCodeValid(false);
    }
  };

  const finalSubmit = async () => {
    if (!pdfFile) {
      console.error("❌ Aucun fichier sélectionné !");
      return;
    }

    // ✅ BLOQUER TOUT SI LE CODE EST INVALIDE POUR "certificat de guérison"
    if (documentType === "healing-certificate" && !codeValid) {
      toast({
        title: "Code de dossier invalide",
        description: "Veuillez entrer un code valide de déclaration existante.",
        variant: "destructive",
      });
      return; // ⛔ Empêche toute suite d'exécution
    }

    try {
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      console.log(
        "📤 Données envoyées à /api/upload :",
        formData.get("pdfFile")
      );

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const fileData = await response.json();
      console.log("✅ Réponse API après upload :", fileData);

      if (!fileData.filePath) {
        throw new Error("Chemin du fichier non reçu !");
      }

      if (response.status === 413) {
        toast({
          title: "Fichier trop volumineux",
          description:
            "Veuillez sélectionner un fichier PDF de moins de 10 Mo.",
          variant: "destructive",
        });
        return;
      }

      const requestData = {
        type: "accident-report",
        formData: {
          clubName,
          playerLastName,
          playerFirstName,
          email,
          phone,
          accidentDate,
          description: accidentDescription,
          filePath: fileData.filePath,
          signature,
          category,
          codeDossier:
            documentType === "accident-report" ? accidentCode : healingCode,
          documentLabel:
            documentType === "healing-certificate"
              ? "Certificat de guérison"
              : "Déclaration d'accident",
        },
        assignedTo: null,
      };

      console.log("📤 Données envoyées à /api/requests :", requestData);

      const requestResponse = await fetch(
        "http://localhost:5000/api/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!requestResponse.ok) {
        throw new Error("Erreur lors de l'envoi du formulaire");
      }

      toast({
        title: "Déclaration soumise avec succès",
        description: "Votre déclaration a été envoyée.",
      });

      localStorage.setItem("accidentLastSubmitTime", Date.now().toString());
      setIsCooldown(true);
      setCooldownRemaining(600);
      navigate("/success/accidentReport");
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier dépasse la limite de 10 Mo.");
        return;
      }

      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Veuillez sélectionner un fichier PDF");
      }
    }
  };

  const UploadSection = ({
    file,
    setFile,
    handleFileChange,
    documentType,
  }: {
    file: File | null;
    setFile: (file: File | null) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    documentType: "accident-report" | "healing-certificate";
  }) => {
    const inputId = `pdfUpload-${documentType}`;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Cliquez pour télécharger</span>{" "}
                ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF uniquement (MAX. 10MB)
              </p>
            </div>
            <input
              id={inputId}
              name="pdfFile"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs text-rwdm-red hover:text-rwdm-red/80 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    );
  };

  const spellCheckFields = [
    { label: "Nom du joueur", value: playerLastName },
    { label: "Prénom du joueur", value: playerFirstName },
    { label: "Adresse e-mail", value: email },
    { label: "Numéro de téléphone", value: phone },
    { label: "Catégorie", value: category }, // Ajout de la catégorie pour la vérification
  ];

  return (
    <>
      <Card className="space-y-8 w-full max-w-4xl mx-auto animate-slide-up pb-6">
        <CardContent className="pt-6">
          <FormSection
            title="Important"
            subtitle={
              <>
                Veuillez noter qu’il est vivement recommandé d’envoyer votre
                déclaration dans un délai maximum de{" "}
                <span className="text-red-500 font-semibold">19 jours</span>{" "}
                suivant l’accident. Le dix-neuvième jour peut être refusé. Passé
                ce délai, la demande ne pourra plus être prise en compte.
                <br />
                <br />
                La déclaration sera d’abord validée par le club, puis transmise
                à l’Union belge de football. Les frais médicaux sont dans un
                premier temps à votre charge.
                <br />
                <br />
                À la fin de la blessure, vous devrez téléverser sur cette page
                votre certificat de guérison ainsi que les frais transmis par
                votre médecin. Ces documents seront également approuvés par le
                club avant d’être envoyés à l’Union belge pour un éventuel
                remboursement.
                <br />
                <br />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Veuillez également télécharger le PDF ci-dessous, le faire
                  remplir par votre médecin, puis le joindre en tant que fichier
                  PDF lors de la déclaration d’accident.
                </span>
              </>
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
              title="Informations sur l'accident"
              subtitle="Veuillez fournir les informations de base concernant l'accident"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="accidentDate"
                    className="flex items-center space-x-1"
                  >
                    <span>Date de l'accident *</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vous ne pouvez pas sélectionner une date future.</p>
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
                          <span>Sélectionnez une date</span>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clubName">Nom du club *</Label>
                  <Input
                    id="clubName"
                    className="form-input-base"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select onValueChange={setCategory} required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
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

                <div className="space-y-2">
                  <Label htmlFor="playerLastName">Nom du joueur *</Label>
                  <Input
                    id="playerLastName"
                    className="form-input-base"
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">Prénom du joueur *</Label>
                  <Input
                    id="playerFirstName"
                    className="form-input-base"
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail *</Label>
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
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
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

              <div className="space-y-2 mt-4">
                <Label htmlFor="accidentDescription">
                  Description de l'accident *
                </Label>
                <Textarea
                  id="accidentDescription"
                  className="form-input-base min-h-32"
                  placeholder="Décrivez comment l'accident s'est produit, où, quand et les conséquences immédiates..."
                  required
                  maxLength={700} // Limite côté HTML
                  value={accidentDescription}
                  onChange={(e) => setAccidentDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {accidentDescription.length}/700 caractères
                </p>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Document justificatif"
              subtitle="Veuillez choisir le type de document à téléverser puis charger un fichier PDF justificatif (rapport médical, etc.)"
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
                    Déclaration d'accident
                  </TabsTrigger>
                  <TabsTrigger value="healing-certificate">
                    Certificat de guérison
                  </TabsTrigger>
                </TabsList>

                {/* Déclaration d'accident */}
                <TabsContent value="accident-report">
                  <div className="space-y-4">
                    <div className="flex gap-3 items-end">
                      <div className="w-full">
                        <Label htmlFor="accidentCode">Code du dossier</Label>
                        <Input
                          id="accidentCode"
                          value={accidentCode}
                          readOnly
                          placeholder="Cliquez sur 'Générer' pour obtenir un code"
                          className="form-input-base bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const newCode = Math.random()
                            .toString(36)
                            .substring(2, 8)
                            .toUpperCase();
                          setAccidentCode(newCode);
                          toast({
                            title: "Code généré",
                            description: `Voici votre code : ${newCode}`,
                          });
                        }}
                      >
                        Générer
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ce code est essentiel pour délivrer plus tard le
                      certificat de guérison.
                      <span className="ml-1 font-medium text-red-500">
                        Sans ce code
                      </span>
                      , il ne sera pas possible d’envoyer un certificat de
                      guérison lié à cette déclaration.
                    </p>

                    <UploadSection
                      file={pdfFile}
                      setFile={setPdfFile}
                      handleFileChange={handleFileChange}
                      documentType="accident-report"
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
                        J’ai déjà effectué l’envoi d’une déclaration d’accident
                      </label>
                    </div>

                    {hasSentDeclaration && (
                      <>
                        <div>
                          <Label htmlFor="healingCode">
                            Code du dossier reçu lors de la déclaration *
                          </Label>
                          <Input
                            id="healingCode"
                            value={healingCode}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setHealingCode(val);
                              checkCodeValidity(val, email);
                            }}
                            placeholder="Ex : XG72ZL"
                            className={`form-input-base ${
                              codeValid === false
                                ? "border-red-500"
                                : codeValid === true
                                ? "border-green-500"
                                : ""
                            }`}
                            required
                          />

                          {codeValid === true && (
                            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Code valide ! Le dossier est bien lié à l’adresse
                              :
                              <span className="font-semibold ml-1">
                                {email}
                              </span>
                            </p>
                          )}

                          {codeValid === false && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              Aucun dossier ne correspond à ce code pour l’email
                              :
                              <span className="font-semibold ml-1">
                                {email || "non renseigné"}
                              </span>
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Veuilllez joindre votre certificat de guérison
                          ci-dessous :
                        </p>

                        <UploadSection
                          file={pdfFile}
                          setFile={setPdfFile}
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
              title="Signature"
              subtitle="Veuillez signer pour confirmer l'exactitude des informations fournies"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  En vue d'une gestion efficace de mon dossier, et uniquement à
                  cet effet, je donne autorisation au traitement des données
                  médicales me concernant relatives à l'accident dont j'ai été
                  victime, comme décrit dans la{" "}
                  <a
                    href="https://www.arena-nv.be/CONFIDENTIALITE.pdf"
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Déclaration de confidentialité
                  </a>{" "}
                  qui peut être consultée ici. Conformément à la loi RGPD, j'ai
                  le droit d'accès, de rectification, de portabilité,
                  d'opposition et d'effacement de mes données
                  (arena@arena-nv.be).
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>
                    Signature victime ou des parents/tuteur légal (pour les
                    enfants de moins de 13 ans)
                  </strong>
                </p>
                <SignaturePad
                  onChange={setSignature}
                  placeholder="Signez ici pour valider la déclaration d'accident"
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
            disabled={!signature || !pdfFile || isCooldown}
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            {isCooldown ? "Veuillez patienter..." : "Soumettre la déclaration"}
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
        title="Vérification des informations de la déclaration"
      />
    </>
  );
};

export default AccidentReportForm;
