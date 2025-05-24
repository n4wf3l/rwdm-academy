import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  RefreshCcw,
  FileText,
  Eye,
  RotateCcw,
  Settings,
  CalendarIcon,
  Plus,
  Archive,
  Check,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateAccidentReportPDF } from "@/utils/generateAccidentReportPDF";
import { generateResponsibilityWaiverPDF } from "@/utils/generateResponsibilityWaiverPDF";
import generateRegistrationPDF from "@/utils/generateRegistrationPDF";
import generateSelectionTestsPDF from "@/utils/generateSelectionTestsPDF";
import EditRequestModal from "@/components/documents/EditRequestModal";
import { Pencil } from "lucide-react";

// Importation de la modale et de ses types
import RequestDetailsModal, {
  Request as ModalRequest,
} from "@/components/RequestDetailsModal.tsx";
import html2canvas from "html2canvas";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import DocumentsTable from "@/components/documents/DocumentsTable";
import SearchFilters from "@/components/documents/SearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminMonthlyChart from "@/components/documents/StatisticsCard";

import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import { Checkbox } from "@/components/ui/checkbox";
import DatabaseUsageChart from "@/components/charts/DatabaseUsageChart";

// Types pour les documents
type DocumentType =
  | "registration"
  | "selection-tests"
  | "responsibility-waiver"
  | "accident-report";

// Ajout du type RequestStatus
type RequestStatus =
  | "new"
  | "assigned"
  | "in-progress"
  | "completed"
  | "rejected";

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  surname: string;
  email: string;
  phone: string;
  documentUrl: string;
  status: string;
  // Ici, on récupère l'id de l'admin mais on attend qu'en plus on récupère son prénom et son nom depuis l'API
  assignedAdmin: string;
  createdAt?: Date;
  data: any;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { t } = useTranslation();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");
  const { toast } = useToast();
  const containerRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const [confirmPDFRequest, setConfirmPDFRequest] =
    useState<ModalRequest | null>(null);
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);
  // État pour la demande sélectionnée (type attendu par la modale)
  const [selectedRequest, setSelectedRequest] = useState<ModalRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const uniqueAdmins = useMemo(() => {
    const names = documents.map((doc) => doc.assignedAdmin).filter(Boolean);
    return Array.from(new Set(names));
  }, [documents]);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [editRequest, setEditRequest] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [archiveMode, setArchiveMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [archiveProgress, setArchiveProgress] = useState(0);
  const [isArchiving, setIsArchiving] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  function mapDbStatus(dbStatus: string): RequestStatus {
    switch (dbStatus) {
      case "Nouveau":
        return "new";
      case "Assigné":
        return "assigned";
      case "En cours":
        return "in-progress";
      case "Terminé":
        return "completed";
      case "Rejeté":
        return "rejected";
      default:
        return "new";
    }
  }

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();

        const filtered = data.filter(
          (req: any) => mapDbStatus(req.status) === "new"
        );
        setNewRequestsCount(filtered.length);
      } catch (error) {
        console.error("Erreur lors du comptage des demandes :", error);
      }
    };

    fetchNewRequestsCount();
  }, []);

  const handleFilter = () => {
    const filtered = documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.phone.includes(searchQuery);

      const matchesType = typeFilter === "all" || doc.type === typeFilter;
      const matchesAdmin =
        adminFilter === "all" || doc.assignedAdmin === adminFilter;

      return matchesSearch && matchesType && matchesAdmin;
    });
    setFilteredDocuments(filtered);
  };

  useEffect(() => {
    fetchCompletedDocuments();
  }, []);

  const translateDocumentType = (type: string) => {
    switch (type) {
      case "registration":
        return "Inscription";
      case "selection-tests":
        return "Tests techniques";
      case "responsibility-waiver":
        return "Décharge de responsabilité";
      case "accident-report":
        return "Déclaration d'accident";
      default:
        return type;
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok)
          throw new Error("Impossible de récupérer l'utilisateur");

        const userData = await response.json();
        setUserRole(userData.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      }
    };

    fetchUserRole();
  }, []);

  const fetchCompletedDocuments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/requests?status=completed",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des documents terminés"
        );
      }

      const data = await response.json();
      // Filtrer uniquement les demandes dont le status est "Terminé"
      const completedDocuments = data.filter(
        (doc: any) => doc.status === "Terminé"
      );

      function extractEmail(parsedData: any): string {
        const keys = ["parent1Email", "parentEmail", "email", "contactEmail"];
        for (const k of keys) {
          if (parsedData[k]) return parsedData[k];
        }
        return "Non spécifié";
      }

      // helper pour extraire le téléphone
      function extractPhone(parsedData: any): string {
        const keys = ["parent1Phone", "phone", "contactPhone", "parentPhone"];
        for (const k of keys) {
          if (parsedData[k]) return parsedData[k];
        }
        return "Non spécifié";
      }

      // Modifier la partie du code qui crée les documents formatés
      const formattedDocuments: Document[] = completedDocuments.map(
        (doc: any) => {
          const parsedData = JSON.parse(doc.data || "{}");

          // Extraire le nom du joueur avec priorité
          const playerName = {
            firstName: parsedData.playerFirstName || parsedData.firstName || "",
            lastName: parsedData.playerLastName || parsedData.lastName || "",
          };

          // Utiliser le nom du parent seulement si nom du joueur n'existe pas
          return {
            id: doc.id,
            type: doc.type,
            name:
              playerName.firstName ||
              parsedData.parent1FirstName ||
              parsedData.parentFirstName ||
              "Inconnu",
            surname:
              playerName.lastName ||
              parsedData.parent1LastName ||
              parsedData.parentLastName ||
              "Inconnu",
            email: extractEmail(parsedData),
            phone: extractPhone(parsedData),
            documentUrl: doc.documentUrl || "#",
            status: doc.status,
            assignedAdmin: doc.admin_id
              ? `${doc.admin_firstName} ${doc.admin_lastName}`
              : parsedData.assignedAdmin || "Non assigné",
            createdAt: doc.created_at ? new Date(doc.created_at) : undefined,
            data: parsedData,
          };
        }
      );

      setDocuments(formattedDocuments);
      setFilteredDocuments(formattedDocuments);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les documents terminés.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    handleFilter();
  }, [searchQuery, typeFilter, adminFilter, documents]);

  const handleRevertStatus = async (id: string) => {
    try {
      // Appel à l'API pour mettre à jour le statut
      const response = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "En cours" }), // ou "in-progress" selon le mapping
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      toast({
        title: "Statut modifié",
        description: `La demande ${id} a été remise en cours.`,
      });
      // Rafraîchir les données
      fetchCompletedDocuments();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      toast({
        title: "Erreur",
        description: "Impossible de remettre le statut en cours.",
        variant: "destructive",
      });
    }
  };

  const waitForRefThenGeneratePDF = () => {
    let tries = 0;
    const maxTries = 20;

    const interval = setInterval(() => {
      if (modalRef.current) {
        clearInterval(interval);
        handleGenerateDocPDF();
      } else {
        tries++;
        if (tries >= maxTries) {
          clearInterval(interval);
          toast({
            title: "Erreur",
            description: "La modale n’a pas pu être chargée pour le PDF.",
            variant: "destructive",
          });
        }
      }
    }, 100); // vérifie toutes les 100ms
  };

  const handleGenerateDocPDF = async () => {
    if (!selectedRequest || !modalRef.current) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
      return;
    }

    const input = modalRef.current;
    const originalMaxHeight = input.style.maxHeight;
    const originalOverflow = input.style.overflow;
    input.style.maxHeight = "none";
    input.style.overflow = "visible";

    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      ignoreElements: (element) => {
        return element.hasAttribute("data-ignore-pdf");
      },
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Ajoute l'image qui prend toute la page
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    // Charge et ajoute le logo centré en haut
    const logo = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = "/logo.png";
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    const logoWidth = 15; // deux fois plus petit que 30
    const logoHeight = (logo.height / logo.width) * logoWidth;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 3; // marge en haut

    pdf.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

    // Génère et télécharge le PDF
    pdf.save(`Demande_${selectedRequest.id}.pdf`);

    toast({
      title: "PDF généré",
      description: `Le PDF de la demande ${selectedRequest.id} a été généré.`,
    });

    input.style.maxHeight = originalMaxHeight;
    input.style.overflow = originalOverflow;
  };

  // Fonction utilitaire pour convertir le status en RequestStatus (exemple de mapping)
  const mapStatus = (status: string): RequestStatus => {
    switch (status) {
      case "Terminé":
        return "completed";
      case "Nouveau":
        return "new";
      // Ajoutez d'autres cas de conversion si nécessaire
      default:
        return status as RequestStatus;
    }
  };

  const formatRequestId = (id: string | number): string => {
    const numericId = typeof id === "number" ? id : parseInt(id, 10);
    return `DEM-${numericId.toString().padStart(3, "0")}`;
  };

  // Transformation et ouverture de la modale avec l'objet Request attendu
  const handleViewDetails = (doc: Document, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const request: ModalRequest = {
      id: doc.id,
      type: doc.type,
      name: `${doc.name} ${doc.surname}`,
      email: doc.email,
      date: doc.createdAt ? doc.createdAt : new Date(),
      status: mapStatus(doc.status),
      assignedTo: doc.assignedAdmin,
      details: doc.data,
    };
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // In the modalRequests mapping, cast the type to make it compatible
  const modalRequests = filteredDocuments.map((doc) => ({
    id: doc.id,
    type: doc.type as any, // Use type assertion to avoid type conflicts
    name: `${doc.name} ${doc.surname}`,
    email: doc.email,
    date: doc.createdAt
      ? doc.createdAt.toISOString()
      : new Date().toISOString(), // Convert to string
    status: mapStatus(doc.status),
    assignedTo: doc.assignedAdmin,
    details: doc.data,
  }));

  // Add this function to handle document selection
  const toggleDocumentSelection = (id: string, selected?: boolean) => {
    setSelectedDocuments((prev) => {
      const newSelection = new Set(prev);
      if (selected !== undefined) {
        selected ? newSelection.add(id) : newSelection.delete(id);
      } else {
        prev.has(id) ? newSelection.delete(id) : newSelection.add(id);
      }
      return newSelection;
    });
  };

  // Add this function to select/deselect all documents
  const toggleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(filteredDocuments.map((doc) => doc.id));
      setSelectedDocuments(allIds);
    } else {
      setSelectedDocuments(new Set());
    }
  };

  // Add this function to handle archiving
  const handleArchiveDocuments = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document.",
        variant: "destructive",
      });
      return;
    }

    setIsArchiving(true);
    setArchiveProgress(0);

    try {
      const zip = new JSZip();

      // CHANGEMENT ICI: utiliser documents au lieu de filteredDocuments
      // Ainsi, on récupère tous les documents, même ceux des autres pages
      const selectedDocs = documents.filter((doc) =>
        selectedDocuments.has(doc.id)
      );

      // Generate PDFs for each document
      for (let i = 0; i < selectedDocs.length; i++) {
        const doc = selectedDocs[i];

        // Create a temporary div for rendering
        const tempDiv = document.createElement("div");
        tempDiv.style.width = "210mm"; // A4 width
        tempDiv.style.padding = "0";
        tempDiv.style.backgroundColor = "white";
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        // Get formatted date for display
        const formattedDate = doc.createdAt
          ? new Date(doc.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A";

        // Create a professional HTML template based on document type
        let detailsHTML = "";

        // Handle different document types with specific layouts
        switch (doc.type) {
          case "responsibility-waiver":
            const waiverData = doc.data;
            detailsHTML = `
              <div class="details-section">
                <h2>Informations du joueur</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  waiverData.playerLastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  waiverData.playerFirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Date de naissance:</span> ${
                  waiverData.playerBirthDate
                    ? new Date(waiverData.playerBirthDate).toLocaleDateString(
                        "fr-FR"
                      )
                    : "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Club actuel:</span> ${
                  waiverData.currentClub || "Non spécifié"
                }</div>
                
                <h2>Informations du responsable légal</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  waiverData.parentLastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  waiverData.parentFirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  waiverData.parentEmail || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  waiverData.parentPhone || "Non spécifié"
                }</div>
                
                <h2>Décharge</h2>
                <p class="waiver-text">
                  Je soussigné(e), ${waiverData.parentFirstName || ""} ${
              waiverData.parentLastName || ""
            }, 
                  représentant légal du joueur ${
                    waiverData.playerFirstName || ""
                  } ${waiverData.playerLastName || ""}, 
                  né le ${
                    waiverData.playerBirthDate
                      ? new Date(waiverData.playerBirthDate).toLocaleDateString(
                          "fr-FR"
                        )
                      : ""
                  }, 
                  et affilié au club ${
                    waiverData.currentClub || ""
                  }, décharge la RWDM Academy de toute responsabilité 
                  en cas d'accident pouvant survenir au cours des entraînements et/ou matchs amicaux auxquels le joueur 
                  pourrait participer à partir de ce jour.
                </p>
                
                <div class="signature-section">
                  <div class="detail-row"><span>Date:</span> ${
                    waiverData.signatureDate
                      ? new Date(waiverData.signatureDate).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Non spécifiée"
                  }</div>
                  <div class="detail-row"><span>Mention:</span> ${
                    waiverData.approvalText || "Non spécifiée"
                  }</div>
                  ${
                    waiverData.signature
                      ? '<div class="signature"><span>Signature:</span><img src="' +
                        waiverData.signature +
                        '" alt="Signature" /></div>'
                      : ""
                  }
                </div>
              </div>
            `;
            break;

          case "registration":
            const regData = doc.data;
            detailsHTML = `
              <div class="details-section">
                <h2>Informations du joueur</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  regData.lastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  regData.firstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Date de naissance:</span> ${
                  regData.birthDate
                    ? new Date(regData.birthDate).toLocaleDateString("fr-FR")
                    : "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Lieu de naissance:</span> ${
                  regData.birthPlace || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Adresse:</span> ${
                  regData.address || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Code postal:</span> ${
                  regData.postalCode || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Ville:</span> ${
                  regData.city || "Non spécifiée"
                }</div>
                
                <h2>Inscription</h2>
                <div class="detail-row"><span>Saison:</span> ${
                  regData.season || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Académie:</span> ${
                  regData.academy || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Catégorie:</span> ${
                  regData.category || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Club actuel:</span> ${
                  regData.currentClub || "Non spécifié"
                }</div>
                
                <h2>Responsable principal</h2>
                <div class="detail-row"><span>Type:</span> ${
                  regData.parent1Type || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Nom:</span> ${
                  regData.parent1LastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  regData.parent1FirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  regData.parent1Email || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  regData.parent1Phone || "Non spécifié"
                }</div>
                
                ${
                  regData.parent2LastName
                    ? `
                <h2>Responsable secondaire</h2>
                <div class="detail-row"><span>Type:</span> ${
                  regData.parent2Type || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Nom:</span> ${
                  regData.parent2LastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  regData.parent2FirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  regData.parent2Email || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  regData.parent2Phone || "Non spécifié"
                }</div>
                `
                    : ""
                }
                
                <h2>Consentement</h2>
                <div class="detail-row"><span>Consentement à l'image:</span> ${
                  regData.imageConsent ? "Oui" : "Non"
                }</div>
                ${
                  regData.signature
                    ? '<div class="signature"><span>Signature:</span><img src="' +
                      regData.signature +
                      '" alt="Signature" /></div>'
                    : ""
                }
              </div>
            `;
            break;

          case "accident-report":
            const accidentData = doc.data;
            detailsHTML = `
              <div class="details-section">
                <h2>Informations de l'accident</h2>
                <div class="detail-row"><span>Club:</span> ${
                  accidentData.clubName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Date de l'accident:</span> ${
                  accidentData.accidentDate
                    ? new Date(accidentData.accidentDate).toLocaleDateString(
                        "fr-FR"
                      )
                    : "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Code dossier:</span> ${
                  accidentData.codeDossier || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Type de document:</span> ${
                  accidentData.documentLabel || "Non spécifié"
                }</div>
                
                <h2>Informations du joueur</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  accidentData.playerLastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  accidentData.playerFirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  accidentData.email || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  accidentData.phone || "Non spécifié"
                }</div>
                
                <h2>Description de l'accident</h2>
                <div class="description-box">${
                  accidentData.description || "Non spécifiée"
                }</div>
                
                ${
                  accidentData.signature
                    ? '<div class="signature"><span>Signature:</span><img src="' +
                      accidentData.signature +
                      '" alt="Signature" /></div>'
                    : ""
                }
              </div>
            `;
            break;

          case "selection-tests":
            const testData = doc.data;
            detailsHTML = `
              <div class="details-section">
                <h2>Informations du joueur</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  testData.lastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  testData.firstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Date de naissance:</span> ${
                  testData.birthDate
                    ? new Date(testData.birthDate).toLocaleDateString("fr-FR")
                    : "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  testData.email || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  testData.phone || "Non spécifié"
                }</div>
                
                <h2>Test technique</h2>
                <div class="detail-row"><span>Académie:</span> ${
                  testData.academy || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Catégorie:</span> ${
                  testData.category || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Position:</span> ${
                  testData.position || "Non spécifiée"
                }</div>
                <div class="detail-row"><span>Club actuel:</span> ${
                  testData.currentClub || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Club précédent:</span> ${
                  testData.previousClub || "Non spécifié"
                }</div>
                
                <h2>Informations du responsable</h2>
                <div class="detail-row"><span>Nom:</span> ${
                  testData.parentLastName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Prénom:</span> ${
                  testData.parentFirstName || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Email:</span> ${
                  testData.parentEmail || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Téléphone:</span> ${
                  testData.parentPhone || "Non spécifié"
                }</div>
                <div class="detail-row"><span>Relation:</span> ${
                  testData.parentRelation || "Non spécifiée"
                }</div>
                
                ${
                  testData.signature
                    ? '<div class="signature"><span>Signature:</span><img src="' +
                      testData.signature +
                      '" alt="Signature" /></div>'
                    : ""
                }
              </div>
            `;
            break;

          default:
            // Fallback for any unhandled document types
            detailsHTML = `
              <div class="details-section">
                <pre class="json-data">${JSON.stringify(
                  doc.data,
                  null,
                  2
                )}</pre>
              </div>
            `;
        }

        // Complete HTML template with styling
        tempDiv.innerHTML = `
          <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; padding: 30px; position: relative;">
            <style>
              h1, h2, h3 { font-family: 'Segoe UI', Roboto, sans-serif; color: #003B70; }
              h1 { font-size: 24px; text-align: center; margin-top: 40px; margin-bottom: 30px; text-transform: uppercase; }
              h2 { font-size: 18px; margin-top: 25px; margin-bottom: 15px; border-bottom: 1px solid #003B70; padding-bottom: 5px; }
              .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #003B70; margin-bottom: 30px; }
              .header-logo { max-height: 70px; }
              .document-id { font-size: 14px; color: #666; }
              .main-info { margin-bottom: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .detail-row { margin-bottom: 8px; display: flex; }
              .detail-row span { font-weight: bold; min-width: 150px; color: #003B70; }
              .details-section { margin-top: 20px; }
              .waiver-text { line-height: 1.6; text-align: justify; background: #f8f9fa; padding: 15px; border-left: 4px solid #003B70; margin: 20px 0; }
              .signature-section { margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc; }
              .signature { margin-top: 15px; }
              .signature img { max-width: 200px; max-height: 80px; border-bottom: 1px solid #999; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; padding-top: 10px; border-top: 1px solid #ccc; }
              .description-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; line-height: 1.6; }
              .json-data { white-space: pre-wrap; font-family: Consolas, monospace; font-size: 12px; background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
              .rwdm-logo { position: absolute; top: 20px; right: 20px; width: 80px; opacity: 0.1; }
            </style>
            
            <!-- Watermark -->
            <img class="rwdm-logo" src="/logo.png" alt="RWDM" />
            
            <!-- Header -->
            <div class="header">
              <div>
                <img class="header-logo" src="/logo.png" alt="RWDM Academy" />
              </div>
              <div class="document-id">
                <strong>Référence:</strong> ${formatRequestId(doc.id)}<br>
                <strong>Date:</strong> ${formattedDate}<br>
                <strong>Administrateur:</strong> ${
                  doc.assignedAdmin || "Non assigné"
                }
              </div>
            </div>
            
            <!-- Title -->
            <h1>${translateDocumentType(doc.type)}</h1>
            
            <!-- Main Info -->
            <div class="main-info">
              <div class="detail-row"><span>Nom:</span> ${doc.name} ${
          doc.surname
        }</div>
              <div class="detail-row"><span>Email:</span> ${doc.email}</div>
              <div class="detail-row"><span>Date de création:</span> ${formattedDate}</div>
            </div>
            
            <!-- Details -->
            ${detailsHTML}
            
            <!-- Footer -->
            <div class="footer">
              <p>Document généré automatiquement par la plateforme RWDM Academy — ${new Date().toLocaleDateString(
                "fr-FR"
              )}</p>
            </div>
          </div>
        `;

        // Wait a bit to ensure DOM rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // Generate canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            allowTaint: true,
          });

          // Generate PDF from canvas
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

          // Add to zip
          const fileName = `${doc.name}_${doc.surname}_${doc.type}.pdf`;
          zip.file(fileName, pdf.output("blob"));
        } catch (error) {
          console.error(
            `Erreur lors de la génération du PDF pour ${doc.id}:`,
            error
          );

          // Continue with other documents even if this one fails
          toast({
            title: "Avertissement",
            description: `Impossible de générer le PDF pour ${doc.id}. On continue avec les autres documents.`,
          });
        }

        // Clean up
        document.body.removeChild(tempDiv);

        // Update progress
        setArchiveProgress(Math.round(((i + 1) / selectedDocs.length) * 100));
      }

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `documents_archives_${
        new Date().toISOString().split("T")[0]
      }.zip`;
      link.click();

      // Delete documents from database
      for (const docId of selectedDocuments) {
        await fetch(`http://localhost:5000/api/requests/${docId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      // Reset selection and refresh
      setSelectedDocuments(new Set());
      fetchCompletedDocuments();

      toast({
        title: "Archive créée avec succès",
        description: `${selectedDocuments.size} documents ont été archivés et supprimés.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'archivage :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'archivage.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
      setArchiveMode(false);
    }
  };

  // Ajouter cette fonction au début du composant Documents
  const getPlayerName = (details: any) => {
    // Ordre de priorité pour le prénom: playerFirstName, firstName, parentFirstName
    let firstName = "";
    if (details.playerFirstName) {
      firstName = details.playerFirstName;
    } else if (details.firstName) {
      firstName = details.firstName;
    }

    // Ordre de priorité pour le nom: playerLastName, lastName, parentLastName
    let lastName = "";
    if (details.playerLastName) {
      lastName = details.playerLastName;
    } else if (details.lastName) {
      lastName = details.lastName;
    }

    return { firstName, lastName };
  };

  return (
    <AdminLayout newRequestsCount={newRequestsCount}>
      <Tabs defaultValue="completed" className="w-full">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
                {t("page_docs_title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t("page_docs_desc")}
              </p>
            </div>

            <div className="flex gap-2">
              {["owner", "superadmin"].includes(userRole) && (
                <Button
                  variant={archiveMode ? "default" : "outline"}
                  className={
                    archiveMode ? "bg-amber-600 hover:bg-amber-700" : ""
                  }
                  onClick={() => {
                    setArchiveMode(!archiveMode);
                    setSelectedDocuments(new Set());
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {archiveMode ? t("exitArchiveMode") : t("archiveMode")}
                </Button>
              )}

              <Button
                className="bg-rwdm-blue"
                onClick={() => window.open("/?tab=create-request", "_blank")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("button_create_request")}
              </Button>
            </div>
          </motion.div>

          {/* Onglets entre le sous-titre et les filtres */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="w-full max-w-lg grid grid-cols-3">
              <TabsTrigger value="completed">
                {t("completedRequests")}
              </TabsTrigger>
              <TabsTrigger value="statistics">{t("statistics")}</TabsTrigger>
              <TabsTrigger value="database">{t("database")}</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="completed">
            {/* Filtres */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                adminFilter={adminFilter}
                setAdminFilter={setAdminFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                uniqueAdmins={uniqueAdmins}
              />
            </motion.div>

            {/* Tableau */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <CardTitle>
                      {t("documents")} ({filteredDocuments.length})
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {filteredDocuments.length === 0 ? (
                      <motion.div
                        className="text-center py-8 text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p>{t("noDocumentsMatch")}</p>
                      </motion.div>
                    ) : (
                      <>
                        {archiveMode && (
                          <div className="flex justify-between items-center mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={
                                  selectedDocuments.size ===
                                    filteredDocuments.length &&
                                  filteredDocuments.length > 0
                                }
                                onCheckedChange={(checked) =>
                                  toggleSelectAll(!!checked)
                                }
                                id="select-all"
                              />
                              <label
                                htmlFor="select-all"
                                className="text-sm font-medium"
                              >
                                {t("selectAll")} ({filteredDocuments.length})
                              </label>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedDocuments(new Set())}
                                disabled={selectedDocuments.size === 0}
                              >
                                {t("deselectAll")}
                              </Button>

                              <Button
                                variant="default"
                                className="bg-amber-600 hover:bg-amber-700"
                                size="sm"
                                onClick={handleArchiveDocuments}
                                disabled={selectedDocuments.size === 0}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {t("archiveSelected")} ({selectedDocuments.size}
                                )
                              </Button>
                            </div>
                          </div>
                        )}

                        {isArchiving && (
                          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border">
                            <p className="text-sm font-medium mb-2">
                              {t("archivingInProgress")} ({archiveProgress}%)
                            </p>
                            <Progress value={archiveProgress} className="h-2" />
                          </div>
                        )}

                        <DocumentsTable
                          documents={modalRequests as any}
                          formatRequestId={formatRequestId}
                          archiveMode={archiveMode} // Vérifiez que cette prop est bien passée
                          selectedDocuments={selectedDocuments}
                          onToggleSelection={toggleDocumentSelection}
                          onViewDetails={(req) => {
                            console.log("onViewDetails called with:", req);
                            // Create a new object with the correct shape
                            const requestForModal = {
                              id: req.id,
                              type: req.type as any, // Use type assertion
                              name: req.name,
                              email: req.email,
                              date: new Date(req.date),
                              status: req.status,
                              assignedTo: req.assignedTo,
                              details: req.details,
                            };
                            setSelectedRequest(requestForModal as any); // Cast to any to bypass type checking
                            console.log(
                              "selectedRequest set to:",
                              requestForModal
                            );
                            setIsModalOpen(true);
                            console.log("isModalOpen set to:", true);
                          }}
                          onEditRequest={(req) => {
                            // Create a compatible object
                            const editableRequest = {
                              id: req.id,
                              type: req.type as any, // Use type assertion
                              name: req.name,
                              email: req.email,
                              date: new Date(req.date),
                              status: req.status,
                              assignedTo: req.assignedTo,
                              details: req.details,
                            };
                            setEditRequest(editableRequest as any); // Cast to any
                            setIsEditOpen(true);
                          }}
                          onRevertRequest={(id) => setConfirmRevertId(id)}
                          onGeneratePDF={(req) => {
                            // Create a compatible object
                            const pdfRequest = {
                              id: req.id,
                              type: req.type as any, // Use type assertion
                              name: req.name,
                              email: req.email,
                              date: new Date(req.date),
                              status: req.status,
                              assignedTo: req.assignedTo,
                              details: req.details,
                            };
                            setConfirmPDFRequest(pdfRequest as any); // Cast to any
                          }}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="statistics">
            <motion.div
              className="p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AdminMonthlyChart
                requests={documents.map((doc) => ({
                  id: doc.id,
                  type: doc.type,
                  name: `${doc.name} ${doc.surname}`,
                  email: doc.email,
                  date: (doc.createdAt || new Date()).toISOString(),
                  status: "completed",
                  assignedTo: doc.assignedAdmin,
                }))}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="database">
            <motion.div
              className="p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <DatabaseUsageChart />
            </motion.div>
          </TabsContent>
        </motion.div>

        {/* Modales avec animations */}
        <AnimatePresence>
          {confirmPDFRequest && (
            <motion.div
              key="confirm-pdf-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConfirmationDialog
                open={true}
                onClose={() => setConfirmPDFRequest(null)}
                onConfirm={() => {
                  setSelectedRequest(confirmPDFRequest);
                  setIsModalOpen(true);
                  waitForRefThenGeneratePDF();
                  setConfirmPDFRequest(null);
                }}
                title={t("generatePdfTitle")}
                message={t("generatePdfMessage")}
              />
            </motion.div>
          )}

          {confirmRevertId && (
            <motion.div
              key="confirm-revert-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConfirmationDialog
                open={true}
                onClose={() => setConfirmRevertId(null)}
                onConfirm={() => {
                  handleRevertStatus(confirmRevertId);
                  setConfirmRevertId(null);
                }}
                title={t("revertToInProgressTitle")}
                message={t("revertToInProgressMessage")}
              />
            </motion.div>
          )}

          {editRequest && (
            <motion.div
              key="edit-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EditRequestModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                request={editRequest}
                onSaved={(updated) => {
                  // Extraire le nom du joueur en priorité des détails mis à jour
                  const playerName = getPlayerName(updated.details);
                  const playerFirstName = playerName.firstName;
                  const playerLastName = playerName.lastName;

                  // Mettre à jour la liste complète des documents
                  setDocuments((docs) =>
                    docs.map((d) =>
                      d.id === updated.id
                        ? {
                            ...d,
                            details: updated.details,
                            name: playerFirstName || d.name,
                            surname: playerLastName || d.surname,
                            email: updated.email || d.email,
                            data: updated.details,
                          }
                        : d
                    )
                  );

                  // Mettre à jour également les documents filtrés
                  setFilteredDocuments((docs) =>
                    docs.map((d) =>
                      d.id === updated.id
                        ? {
                            ...d,
                            details: updated.details,
                            name: playerFirstName || d.name,
                            surname: playerLastName || d.surname,
                            email: updated.email || d.email,
                            data: updated.details,
                          }
                        : d
                    )
                  );

                  // Force le rafraîchissement de la liste après mise à jour
                  setTimeout(() => {
                    // Rafraîchir les documents depuis le serveur pour assurer la cohérence des données
                    fetchCompletedDocuments();
                  }, 100);
                }}
              />
            </motion.div>
          )}

          {isTestDialogOpen && (
            <motion.div
              key="test-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dialog
                open={isTestDialogOpen}
                onOpenChange={setIsTestDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test Dialog</DialogTitle>
                  </DialogHeader>
                  <div>
                    This is a test dialog to verify the component works.
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RequestDetailsModal Direct Rendering */}
        {isModalOpen && selectedRequest && (
          <RequestDetailsModal
            isOpen={true}
            onClose={() => setIsModalOpen(false)}
            request={selectedRequest}
            ref={modalRef}
          />
        )}
      </Tabs>
    </AdminLayout>
  );
};

export default Documents;
