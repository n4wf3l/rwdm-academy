import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface FormSection {
  title: string;
  subtitle?: string;
}

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

const ResponsibilityWaiverForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parentLastName, setParentLastName] = useState<string>("");
  const [parentFirstName, setParentFirstName] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [playerLastName, setPlayerLastName] = useState<string>("");
  const [playerFirstName, setPlayerFirstName] = useState<string>("");
  const [playerBirthDate, setPlayerBirthDate] = useState<Date | null>(null);
  const [currentClub, setCurrentClub] = useState<string>("");
  const [previousClub, setPreviousClub] = useState<string>("");
  const [signatureDate, setSignatureDate] = useState<Date | undefined>(
    new Date()
  );
  const [signature, setSignature] = useState<string | null>(null);
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
      // Vérification des champs obligatoires
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
        console.error("❌ Données incomplètes avant envoi !");
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Étape 1 : Upload du fichier signature (Base64 en PNG)
      let filePath = null;
      if (signature) {
        const formData = new FormData();
        const blob = await fetch(signature).then((res) => res.blob());
        formData.append("pdfFile", blob, "signature.png");

        const uploadResponse = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.error("❌ Erreur lors de l'upload du fichier :", uploadError);
          throw new Error(uploadError.error || "Échec de l'upload du fichier.");
        }

        const uploadData = await uploadResponse.json();
        filePath = uploadData.filePath;
      }

      // ✅ Étape 2 : Construire les données à envoyer
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
          signature, // Garde la signature en base64 en plus
          filePath, // ✅ Ajout du fichier uploadé
        },
        assignedTo: null,
      };

      console.log(
        "📤 Données envoyées à /api/requests :",
        JSON.stringify(requestData, null, 2)
      );

      // ✅ Étape 3 : Envoyer les données finales avec le fichier
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur API:", errorData);
        throw new Error(
          errorData.error || "Erreur lors de l'envoi de la décharge"
        );
      }

      console.log("✅ Décharge envoyée avec succès !");
      toast({
        title: "Décharge soumise avec succès",
        description: "Votre décharge de responsabilité a été envoyée.",
      });
      const now = Date.now();
      localStorage.setItem("waiverLastSubmitTime", now.toString());

      setIsCooldown(true);
      setCooldownRemaining(600); // 10 minutes
      navigate("/success/responsibilityWaiver");
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
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

  const waiverText = `Je soussigné(e), ${parentFirstName || ""} ${
    parentLastName || "[Prénom du représentant]" + " [Nom de famille]"
  }, représentant légal du joueur ${playerFirstName || "[Prénom du joueur]"} ${
    playerLastName || "[Nom de famille]"
  }, né le ${
    playerBirthDate ? format(playerBirthDate, "dd/MM/yyyy") : "[JJ-MM-AAAA]"
  }, et affilié au club ${
    currentClub || "[Club actuel]"
  } décharge la RWDM Academy de toute responsabilité en cas d'accident pouvant survenir au cours des entraînements et/ou matchs amicaux auxquels le joueur pourrait participer à partir de ce jour.`;

  const spellCheckFields = [
    { label: "Nom du parent", value: parentLastName },
    { label: "Prénom du parent", value: parentFirstName },
    { label: "Email du parent", value: parentEmail },
    { label: "Nom du joueur", value: playerLastName },
    { label: "Prénom du joueur", value: playerFirstName },
    { label: "Club actuel", value: currentClub },
  ];

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
            <FormSection
              title="Informations du joueur"
              subtitle="Veuillez remplir les informations concernant le joueur"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="playerLastName">Nom *</Label>
                  <Input
                    id="playerLastName"
                    className="form-input-base"
                    value={playerLastName}
                    onChange={(e) => setPlayerLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playerFirstName">Prénom *</Label>
                  <Input
                    id="playerFirstName"
                    className="form-input-base"
                    value={playerFirstName}
                    onChange={(e) => setPlayerFirstName(e.target.value)}
                    required
                  />
                </div>

                {/* Gestion dynamique de l'affichage du calendrier */}
                <div className="space-y-2 relative">
                  <Label htmlFor="birthDate">Date de naissance *</Label>
                  <div className="space-y-4">
                    <BirthDatePicker
                      selectedDate={playerBirthDate}
                      onChange={(date) => {
                        setPlayerBirthDate(date);
                        setIsCalendarOpen(false); // Ferme le calendrier après sélection
                      }}
                      onCalendarOpen={() => setIsCalendarOpen(true)} // Ouvre la card
                      onCalendarClose={() => setIsCalendarOpen(false)} // Ferme la card
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentClub">Nom du club *</Label>
                  <Input
                    id="currentClub"
                    className="form-input-base"
                    value={currentClub}
                    onChange={(e) => setCurrentClub(e.target.value)}
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
              title="Informations du parent/tuteur"
              subtitle="Veuillez remplir vos informations en tant que responsable légal"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">Nom</Label>
                  <Input
                    id="parentLast Name"
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
                  <Label htmlFor="parentPhone">Téléphone</Label>
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
                  <Label htmlFor="parentEmail">Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    className="form-input-base"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
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
              title="Décharge de responsabilité"
              subtitle="Lisez attentivement avant de signer"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {waiverText}
                </p>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <FormSection
              title="Date et confirmation"
              subtitle="Veuillez confirmer la date et saisir 'Lu et approuvé'"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="waiverDate">Date de signature</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-input-base justify-start text-left font-normal",
                          "text-muted-foreground" // Toujours grisé, car l'utilisateur ne peut pas changer la date
                        )}
                        disabled // Empêche l'édition manuelle
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
                        disabled={() => true} // Toutes les dates sont désactivées
                        locale={fr}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalText">Mention "Lu et approuvé"</Label>

                  <Select onValueChange={setApprovalText} required>
                    <SelectTrigger className="form-input-base">
                      <SelectValue placeholder="Sélectionnez votre accord" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lu et approuvé">
                        Lu et approuvé
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "glass-panel overflow-visible transition-all duration-300",
            isCalendarOpen ? "min-h-[550px]" : "min-h-[250px]"
          )}
        >
          <CardContent className="pt-6">
            <FormSection
              title="Signature"
              subtitle="Veuillez signer cette décharge de responsabilité"
            >
              <SignaturePad
                onChange={setSignature}
                placeholder="Signez ici pour valider la décharge de responsabilité"
              />
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
            disabled={
              !signature || approvalText !== "Lu et approuvé" || isCooldown
            }
            className="px-8 py-6 bg-rwdm-blue hover:bg-rwdm-blue/90 dark:bg-rwdm-blue/80 dark:hover:bg-rwdm-blue text-white rounded-lg button-transition text-base"
          >
            Soumettre la décharge
          </Button>
        </div>
      </form>

      {/* Timer en bas à gauche */}
      {isCooldown && (
        <div className="fixed bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded shadow text-sm text-gray-800 dark:text-gray-100">
          Vous pourrez renvoyer une décharge de responsabilité dans{" "}
          <span className="font-semibold">
            {String(Math.floor(cooldownRemaining / 60)).padStart(2, "0")}:
            {String(cooldownRemaining % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        onClose={() => setIsSpellCheckOpen(false)}
        onConfirm={finalSubmit}
        fields={spellCheckFields}
        title="Vérification des informations de la décharge"
      />
    </>
  );
};

export default ResponsibilityWaiverForm;
