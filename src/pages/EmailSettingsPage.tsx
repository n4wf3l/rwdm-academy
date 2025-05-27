import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Bold,
  Italic,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Check,
  X,
  Send,
  Calendar,
} from "lucide-react";
import DOMPurify from "dompurify"; // Ajoutez cette import après npm install dompurify @types/dompurify
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailTemplate {
  type: string;
  subject: string;
  body: string;
}

const emailTypes = [
  // Demandes
  { key: "registration" },
  { key: "selection" },
  { key: "accident" },
  { key: "healing" },
  { key: "waiver" },
  // Confirmations
  { key: "registration_confirmed" },
  { key: "selection_confirmed" },
  { key: "accident_confirmed" },
  { key: "healing_confirmed" },
  { key: "waiver_confirmed" },
  // Refus (nouveaux types)
  { key: "refus_registration" },
  { key: "refus_selection" },
  { key: "refus_accident" },
  { key: "refus_healing" },
  { key: "refus_waiver" },
  // Envois Union Belge
  { key: "accident-notify" },
  { key: "healing-notify" },
  // Rendez-vous
  { key: "appointment_scheduled" },
  { key: "appointment_cancelled" },
];

const EmailSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("registration");
  const [emailTemplates, setEmailTemplates] = useState<
    Record<string, EmailTemplate>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  // Changé la valeur initiale de false à true
  const [previewMode, setPreviewMode] = useState(true);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const { toast } = useToast();

  // 1. Ajoutez une référence au textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 2. Ajoutez une référence pour la position de défilement
  const scrollPositionRef = useRef<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Charger les templates depuis l'API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/form-mail", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            "❌ Erreur HTTP:",
            response.status,
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Vérification spécifique pour les templates qui nous intéressent
        const accidentTemplate = data.find((t) => t.type === "accident-report");
        const healingTemplate = data.find(
          (t) => t.type === "healing-certificate"
        );

        const templatesMap = data.reduce((acc, template) => {
          // Assurez-vous que le type correspond exactement
          acc[template.type] = {
            type: template.type,
            subject: template.subject || "",
            body: template.body || "",
          };
          return acc;
        }, {});

        setEmailTemplates(templatesMap);
      } catch (error) {
        console.error("❌ Erreur détaillée:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les templates d'emails",
          variant: "destructive",
        });
      }
    };

    fetchTemplates();
  }, [toast]);

  const handleSave = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/form-mail/${type}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(emailTemplates[type]),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      // Passer en mode aperçu après la sauvegarde
      setPreviewMode(true);

      toast({
        title: "Succès",
        description: "Le template d'email a été mis à jour",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Modifiez la fonction handleChange pour préserver la position de défilement
  const handleChange = (
    type: string,
    field: keyof EmailTemplate,
    value: string,
    shouldAddToHistory: boolean = true
  ) => {
    // Stocker la position de défilement actuelle avant la mise à jour
    if (field === "body") {
      scrollPositionRef.current = {
        top: window.scrollY,
        left: window.scrollX,
      };
    }

    if (field === "body" && shouldAddToHistory) {
      setUndoStack((prev) => [...prev, emailTemplates[type]?.body || ""]);
      setRedoStack([]); // Clear redo stack on new changes
    }

    setEmailTemplates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));

    // Pour le champ body, on utilise requestAnimationFrame pour restaurer la position après le rendu
    if (field === "body") {
      requestAnimationFrame(() => {
        window.scrollTo(
          scrollPositionRef.current.left,
          scrollPositionRef.current.top
        );
      });
    }
  };

  const handleFormatting = (type: string, value?: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let newText = "";
    let newSelectionStart = start;
    let newSelectionEnd = end;

    switch (type) {
      case "bold":
        newText =
          text.slice(0, start) +
          "<strong>" +
          text.slice(start, end) +
          "</strong>" +
          text.slice(end);
        newSelectionStart = start + 8; // <strong> length
        newSelectionEnd = end + 8;
        break;
      case "italic":
        newText =
          text.slice(0, start) +
          "<em>" +
          text.slice(start, end) +
          "</em>" +
          text.slice(end);
        newSelectionStart = start + 4; // <em> length
        newSelectionEnd = end + 4;
        break;
      case "left":
        newText =
          text.slice(0, start) +
          '<div style="text-align: left">' +
          text.slice(start, end) +
          "</div>" +
          text.slice(end);
        newSelectionStart = start + 28; // <div style="text-align: left"> length
        newSelectionEnd = end + 28;
        break;
      case "center":
        newText =
          text.slice(0, start) +
          '<div style="text-align: center">' +
          text.slice(start, end) +
          "</div>" +
          text.slice(end);
        newSelectionStart = start + 30; // <div style="text-align: center"> length
        newSelectionEnd = end + 30;
        break;
      case "right":
        newText =
          text.slice(0, start) +
          '<div style="text-align: right">' +
          text.slice(start, end) +
          "</div>" +
          text.slice(end);
        newSelectionStart = start + 29; // <div style="text-align: right"> length
        newSelectionEnd = end + 29;
        break;
      case "color":
        if (value) {
          // Vérifier si le texte sélectionné est déjà dans une balise de couleur
          const beforeSelection = text.slice(0, start);
          const selectedText = text.slice(start, end);
          const afterSelection = text.slice(end);

          // Regex pour détecter une balise span de couleur qui englobe exactement la sélection
          const colorSpanRegex =
            /<span style="color: (#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\))">([^<]+)<\/span>/g;

          let match;
          let found = false;
          let lastMatchIndex = -1;

          // Chercher dans le texte avant la sélection
          while ((match = colorSpanRegex.exec(beforeSelection)) !== null) {
            const matchEnd = match.index + match[0].length;
            if (matchEnd === start && match[2] === selectedText) {
              found = true;
              lastMatchIndex = match.index;
              break;
            }
          }

          if (found) {
            // Remplacer la couleur existante
            const openTag = beforeSelection.slice(0, lastMatchIndex);
            const closeTag = afterSelection;
            newText = `${openTag}<span style="color: ${value}">${selectedText}</span>${closeTag}`;
            newSelectionStart =
              lastMatchIndex + `<span style="color: ${value}">`.length;
            newSelectionEnd = newSelectionStart + selectedText.length;
          } else {
            // Ajouter une nouvelle balise de couleur
            newText =
              text.slice(0, start) +
              `<span style="color: ${value}">` +
              text.slice(start, end) +
              "</span>" +
              text.slice(end);
            newSelectionStart = start + `<span style="color: ${value}>`.length;
            newSelectionEnd = newSelectionStart + (end - start);
          }
        }
        break;
    }

    if (newText) {
      handleChange(activeTab, "body", newText);

      // Restaurer la sélection après le rendu
      setTimeout(() => {
        const newTextarea = document.querySelector("textarea");
        if (newTextarea) {
          newTextarea.focus();
          newTextarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }
      }, 0);
    }
  };

  const handleUndo = () => {
    const lastVersion = undoStack[undoStack.length - 1];
    if (lastVersion !== undefined) {
      setRedoStack((prev) => [...prev, emailTemplates[activeTab]?.body || ""]);
      handleChange(activeTab, "body", lastVersion, false);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  const handleRedo = () => {
    const nextVersion = redoStack[redoStack.length - 1];
    if (nextVersion !== undefined) {
      setUndoStack((prev) => [...prev, emailTemplates[activeTab]?.body || ""]);
      handleChange(activeTab, "body", nextVersion, false);
      setRedoStack((prev) => prev.slice(0, -1));
    }
  };

  // Ajoutez un gestionnaire d'événements pour les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, emailTemplates]);

  // Ajuster la hauteur du textarea quand on change d'onglet
  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      setTimeout(() => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }, 0);
    }
  }, [activeTab, emailTemplates[activeTab]?.body]);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              {t("emails.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("emails.description")}
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("emails.guide.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-500">
              <p>{t("emails.guide.instructions")}</p>
              <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {t("emails.guide.union.title")}
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>{t("emails.guide.union.attachments")}</li>
                  <li>{t("emails.guide.union.format")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contenu principal avec sidebar */}
      <div className="flex gap-6">
        {/* Zone d'édition (gauche) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 space-y-4"
        >
          {/* Sujet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-2"
          >
            <Label>{t("emails.field.subject")}</Label>
            <Input
              value={emailTemplates[activeTab]?.subject || ""}
              onChange={(e) =>
                handleChange(activeTab, "subject", e.target.value)
              }
              placeholder={t("emails.subject.placeholder")}
            />
          </motion.div>

          {/* Texte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-2"
          >
            <Label>{t("emails.field.text")}</Label>

            {/* Variables disponibles */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md mb-2 text-sm"
            >
              <p className="font-medium mb-2">
                {t("emails.variables.available")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {/* Variables de base */}
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {t("emails.variables.playerName")} : {"{playerName}"}
                </code>

                {/* Variables pour inscription */}
                {activeTab === "registration" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("firstName")} : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("lastName")} : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("birthDate")} : {"{birthDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("birthPlace")} : {"{birthPlace}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("address")} : {"{address}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("postalCode")} : {"{postalCode}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("city")} : {"{city}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("category")} : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("currentClub")} : {"{currentClub}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("season")} : {"{season}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("parent1LastName")} : {"{parent1LastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("parent1FirstName")} : {"{parent1FirstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("parent1Phone")} : {"{parent1Phone}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("parent1Email")} : {"{parent1Email}"}
                    </code>
                  </>
                )}

                {/* Variables pour déclaration d'accident */}
                {activeTab === "accident" && ( // Modifié de "accident-report" à "accident"
                  <>
                    {/* Variables de base */}

                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour certificat de guérison */}
                {activeTab === "healing" && ( // Modifié de "healing-certificate" à "healing"
                  <>
                    {/* Variables de base */}

                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour tests de sélection */}
                {activeTab === "selection" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{playerName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Catégorie : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du parent : {"{parentName}"}
                    </code>
                    {/* Variables détaillées que vous aviez déjà ajoutées */}
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom du joueur : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Position : {"{position}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Académie : {"{academy}"}
                    </code>
                  </>
                )}

                {/* Variables existantes pour les rendez-vous */}
                {(activeTab === "appointment_scheduled" ||
                  activeTab === "appointment_cancelled") && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Date : {"{appointmentDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Heure : {"{appointmentTime}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Type : {"{appointmentType}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Admin : {"{adminName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Notes : {"{notes}"}
                    </code>
                  </>
                )}

                {/* Variables pour les décharges */}
                {activeTab === "waiver" && (
                  <>
                    {/* Variables de base */}

                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                  </>
                )}

                {/* Variables pour confirmation d'inscription */}
                {activeTab === "registration_confirmed" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom du joueur : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Date de naissance : {"{birthDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Lieu de naissance : {"{birthPlace}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Adresse : {"{address}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code postal : {"{postalCode}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Ville : {"{city}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Catégorie : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Club actuel : {"{currentClub}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Saison : {"{season}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom parent 1 : {"{parent1LastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom parent 1 : {"{parent1FirstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Téléphone parent 1 : {"{parent1Phone}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Email parent 1 : {"{parent1Email}"}
                    </code>
                  </>
                )}

                {/* Variables pour confirmation de test de sélection */}
                {activeTab === "selection_confirmed" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{playerName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Catégorie : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du parent : {"{parentName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom du joueur : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Position : {"{position}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Académie : {"{academy}"}
                    </code>
                  </>
                )}

                {/* Variables pour confirmation de déclaration d'accident */}
                {activeTab === "accident_confirmed" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour confirmation de certificat de guérison */}
                {activeTab === "healing_confirmed" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour confirmation de décharge */}
                {activeTab === "waiver_confirmed" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                  </>
                )}

                {/* Variables pour refus d'inscription */}
                {activeTab === "refus_registration" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom du joueur : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Date de naissance : {"{birthDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Lieu de naissance : {"{birthPlace}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Adresse : {"{address}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code postal : {"{postalCode}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Ville : {"{city}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Catégorie : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Club actuel : {"{currentClub}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Saison : {"{season}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom parent 1 : {"{parent1LastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom parent 1 : {"{parent1FirstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Téléphone parent 1 : {"{parent1Phone}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Email parent 1 : {"{parent1Email}"}
                    </code>
                  </>
                )}

                {/* Variables pour refus de test de sélection */}
                {activeTab === "refus_selection" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{playerName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Catégorie : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du parent : {"{parentName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Prénom du joueur : {"{firstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Nom du joueur : {"{lastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Position : {"{position}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Académie : {"{academy}"}
                    </code>
                  </>
                )}

                {/* Variables pour refus de déclaration d'accident */}
                {activeTab === "refus_accident" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour refus de certificat de guérison */}
                {activeTab === "refus_healing" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Code dossier : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour refus de décharge */}
                {activeTab === "refus_waiver" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      ID de la demande : {"{requestId}"}
                    </code>
                  </>
                )}

                {/* Variables pour les notifications à l'Union Belge - accident */}
                {activeTab === "accident-notify" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("club")} : {"{clubName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("email")} : {"{email}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("phone")} : {"{phone}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("accidentDate")} : {"{accidentDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("description")} : {"{description}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("playerFirstName")} : {"{playerFirstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("playerLastName")} : {"{playerLastName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("codeDossier")} : {"{codeDossier}"}
                    </code>
                  </>
                )}

                {/* Variables pour les notifications à l'Union Belge - guérison */}
                {activeTab === "healing-notify" && (
                  <>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("club")} : {"{clubName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("email")} : {"{email}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("phone")} : {"{phone}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("accidentDate")} : {"{accidentDate}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("codeDossier")} : {"{codeDossier}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("category")} : {"{category}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("playerFirstName")} : {"{playerFirstName}"}
                    </code>
                    <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {t("playerLastName")} : {"{playerLastName}"}
                    </code>
                  </>
                )}
              </div>
            </motion.div>

            {/* Conteneur pour l'éditeur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="border rounded-md border-gray-300 dark:border-gray-600"
            >
              {/* Barre d'outils */}
              <div className="flex items-center justify-between p-2 border-b border-gray-300 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFormatting("bold")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFormatting("italic")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFormatting("left")}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFormatting("center")}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleFormatting("right")}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <select
                    className="h-8 px-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    onChange={(e) => handleFormatting("color", e.target.value)}
                  >
                    <option value="">{t("emails.color.placeholder")}</option>
                    <option value="#EF4444">{t("emails.color.red")}</option>
                    <option value="#3B82F6">{t("emails.color.blue")}</option>
                    <option value="#10B981">{t("emails.color.green")}</option>
                  </select>
                </div>

                {/* Boutons Annuler/Rétablir */}
                <div className="flex items-center space-x-2">
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode
                    ? t("emails.edit.mode")
                    : t("emails.preview.mode")}
                </Button>
              </div>

              {/* Zone d'édition/aperçu */}
              {previewMode ? (
                <div
                  className="p-4 min-h-[200px] prose prose-sm dark:prose-invert max-w-none [&_p]:mb-4 [&_br]:mb-4"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      emailTemplates[activeTab]?.body.replace(
                        /\n/g,
                        "<br />"
                      ) || ""
                    ),
                  }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={emailTemplates[activeTab]?.body || ""}
                  onChange={(e) => {
                    // Mise à jour du contenu sans modifier automatiquement la hauteur
                    handleChange(activeTab, "body", e.target.value);
                  }}
                  placeholder={t("emails.body.placeholder")}
                  rows={20} // Beaucoup plus de lignes par défaut
                  className="w-full border-0 rounded-none p-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-0 overflow-auto resize-vertical"
                  style={{
                    minHeight: "400px", // Hauteur minimale fixe
                    maxHeight: "60vh", // Hauteur maximale relative à la fenêtre
                  }}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Bouton de sauvegarde */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Button
              className="bg-rwdm-blue hover:bg-rwdm-blue/90"
              onClick={() => handleSave(activeTab)}
              disabled={isLoading}
            >
              {isLoading ? t("saving") : t("save_changes")}
            </Button>
          </motion.div>
        </motion.div>

        {/* Sidebar Types d'emails (droite) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-64 shrink-0 border-l border-gray-200 dark:border-gray-700 pl-6"
        >
          <div className="sticky top-6">
            <motion.h2 className="text-sm font-semibold mb-4">
              {t("emails.types")}
            </motion.h2>

            <motion.div className="space-y-4">
              {/* Demandes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs uppercase font-medium text-gray-500">
                    {t("emails.type.requests")}
                  </h3>
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
                    NEW
                  </span>
                </div>
                {emailTypes
                  .filter(
                    (type) =>
                      !type.key.includes("_") &&
                      !type.key.includes("-") &&
                      !type.key.includes("appointment")
                  )
                  .map(({ key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeTab === key
                          ? "bg-rwdm-blue text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(`email.type.${key}` as any)}
                    </button>
                  ))}
              </div>

              {/* Confirmations */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs uppercase font-medium text-gray-500">
                    {t("emails.type.confirmations")}
                  </h3>
                  <button className="py-0 px-1 h-5 border rounded-sm border-green-600 bg-transparent hover:bg-transparent cursor-default">
                    <Check className="h-3 w-3 text-green-600" />
                  </button>
                </div>
                {emailTypes
                  .filter((type) => type.key.includes("_confirmed"))
                  .map(({ key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeTab === key
                          ? "bg-rwdm-blue text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(`email.type.${key}` as any)}
                    </button>
                  ))}
              </div>

              {/* Refus */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs uppercase font-medium text-gray-500">
                    {t("rejection")}
                  </h3>
                  <button className="py-0 px-1 h-5 border rounded-sm border-red-600 bg-transparent hover:bg-transparent cursor-default">
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                </div>
                {emailTypes
                  .filter((type) => type.key.includes("refus_"))
                  .map(({ key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeTab === key
                          ? "bg-rwdm-blue text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(`email.type.${key}` as any)}
                    </button>
                  ))}
              </div>

              {/* Envois Union Belge */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs uppercase font-medium text-gray-500">
                    {t("emails.type.union")}
                  </h3>
                  <button className="py-0 px-1 h-5 border rounded-sm border-yellow-600 bg-transparent hover:bg-transparent text-yellow-600 cursor-default">
                    <Send className="h-3 w-3" />
                  </button>
                </div>
                {emailTypes
                  .filter((type) => type.key.includes("-notify"))
                  .map(({ key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeTab === key
                          ? "bg-rwdm-blue text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(`email.type.${key}` as any)}
                    </button>
                  ))}
              </div>

              {/* Rendez-vous */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs uppercase font-medium text-gray-500">
                    {t("emails.type.appointments")}
                  </h3>
                  <button className="py-0 px-1 h-5 w-5 border rounded border-blue-900 bg-blue-900 hover:bg-blue-900 cursor-default flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-white" />
                  </button>
                </div>
                {emailTypes
                  .filter((type) => type.key.includes("appointment"))
                  .map(({ key }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        activeTab === key
                          ? "bg-rwdm-blue text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t(`email.type.${key}` as any)}
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Ajouter dans votre fichier CSS global */}
      <style>{`
        .resize-handle-fix {
          resize: vertical;
        }

        .resize-handle-fix::-webkit-resizer {
          height: 10px;
          width: 10px;
          background: transparent;
          border-right: 2px solid rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid rgba(0, 0, 0, 0.2);
        }

        .dark .resize-handle-fix::-webkit-resizer {
          border-right: 2px solid rgba(255, 255, 255, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </AdminLayout>
  );
};

export default EmailSettingsPage;
