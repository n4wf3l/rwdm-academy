import React, { useState } from "react";
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
import { CalendarIcon, Info, Upload } from "lucide-react";
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

interface FormSection {
  title: string;
  subtitle?: string;
}

const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Hello World", 10, 10);
  doc.save("document.pdf");
};

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

const AccidentReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accidentDate, setAccidentDate] = useState<Date | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [playerLastName, setPlayerLastName] = useState<string>("");
  const [playerFirstName, setPlayerFirstName] = useState<string>("");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState<boolean>(false);
  const [accidentDescription, setAccidentDescription] = useState<string>("");

  const handleDateSelect = (date: Date | undefined) => {
    if (date && date > new Date()) {
      toast({
        title: "Date invalide",
        description: "Vous ne pouvez pas déclarer un accident dans le futur.",
        variant: "destructive",
      });
    } else {
      setAccidentDate(date || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpellCheckOpen(true);
  };

  const finalSubmit = async () => {
    if (!pdfFile) {
      console.error("❌ Aucun fichier sélectionné !");
      return;
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

      // Ajout de la signature dans l'objet requestData
      const requestData = {
        type: "accident-report",
        formData: {
          clubName,
          playerLastName,
          playerFirstName,
          accidentDate,
          description: accidentDescription, // à adapter selon vos besoins
          filePath: fileData.filePath,
          signature, // <-- Assurez-vous que cette variable contient la signature au format attendu (ex. base64)
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

      console.log("✅ Demande envoyée avec succès !");
      toast({
        title: "Déclaration soumise avec succès",
        description: "Votre déclaration d'accident a été envoyée.",
      });

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
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Veuillez sélectionner un fichier PDF");
      }
    }
  };

  const spellCheckFields = [
    { label: "Nom du club", value: clubName },
    { label: "Nom du joueur", value: playerLastName },
    { label: "Prénom du joueur", value: playerFirstName },
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
              title="Informations sur l'accident"
              subtitle="Veuillez fournir les informations de base concernant l'accident"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="accidentDate"
                    className="flex items-center space-x-1"
                  >
                    <span>Date de l'accident</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vous ne pouvez pas sélectionner une date future.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>

                  <Popover>
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
                        disabled={(date) => date > new Date()} // Bloque les dates futures
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clubName">Nom du club</Label>
                  <Input
                    id="clubName"
                    className="form-input-base"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerLastName">Nom du joueur</Label>
                  <Input
                    id="playerLastName"
                    className="form-input-base"
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">Prénom du joueur</Label>
                  <Input
                    id="playerFirstName"
                    className="form-input-base"
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="accidentDescription">
                  Description de l'accident
                </Label>
                <Textarea
                  id="accidentDescription"
                  className="form-input-base min-h-32"
                  placeholder="Décrivez comment l'accident s'est produit, où, quand et les conséquences immédiates..."
                  required
                  value={accidentDescription}
                  onChange={(e) => setAccidentDescription(e.target.value)}
                />
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Document justificatif"
              subtitle="Veuillez télécharger un document PDF justificatif (rapport médical, etc.)"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="pdfUpload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Cliquez pour télécharger
                        </span>{" "}
                        ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF uniquement (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="pdfUpload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                </div>

                {pdfFile && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm truncate">{pdfFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-xs text-rwdm-red hover:text-rwdm-red/80 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  <MedicalReportPDF />
                </div>
              </div>
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
                    "Déclaration de confidentialité"
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
            disabled={!signature || !pdfFile}
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            Soumettre la déclaration
          </Button>
        </div>
      </form>

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
