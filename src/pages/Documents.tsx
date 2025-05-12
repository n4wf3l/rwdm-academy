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
  RequestStatus,
} from "@/components/RequestDetailsModal";
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
import StatisticsCard from "@/components/documents/StatisticsCard";

// Types pour les documents
type DocumentType =
  | "registration"
  | "selection-tests"
  | "responsibility-waiver"
  | "accident-report";

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

      const formattedDocuments: Document[] = completedDocuments.map(
        (doc: any) => {
          const parsedData = JSON.parse(doc.data || "{}");

          return {
            id: doc.id,
            type: doc.type,
            name:
              parsedData.parent1FirstName ||
              parsedData.parentFirstName || // Ajout de parentFirstName comme fallback
              parsedData.playerFirstName ||
              "Inconnu",
            surname:
              parsedData.parent1LastName ||
              parsedData.parentLastName || // Ajout de parentLastName comme fallback
              parsedData.playerLastName ||
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

  const modalRequests: ModalRequest[] = filteredDocuments.map((doc) => ({
    id: doc.id,
    type: doc.type,
    name: `${doc.name} ${doc.surname}`,
    email: doc.email,
    date: doc.createdAt || new Date(),
    status: mapStatus(doc.status),
    assignedTo: doc.assignedAdmin,
    details: doc.data,
  }));

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
                Gestion des documents
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Retrouvez les documents des membres
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="bg-rwdm-blue"
                onClick={() => window.open("/?tab=create-request", "_blank")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une demande
              </Button>
            </div>
          </motion.div>

          {/* Onglets entre le sous-titre et les filtres */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="w-full max-w-md grid grid-cols-2">
              <TabsTrigger value="completed">Demandes terminées</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
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
                      Documents ({filteredDocuments.length})
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
                        <p>Aucun document ne correspond à vos critères.</p>
                      </motion.div>
                    ) : (
                      <DocumentsTable
                        documents={modalRequests}
                        formatRequestId={formatRequestId}
                        translateDocumentType={translateDocumentType}
                        onViewDetails={(req) => {
                          setSelectedRequest(req);
                          setIsModalOpen(true);
                        }}
                        onEditRequest={(req) => {
                          setEditRequest(req);
                          setIsEditOpen(true);
                        }}
                        onRevertRequest={(id) => setConfirmRevertId(id)}
                        onGeneratePDF={(req) => {
                          setConfirmPDFRequest(req);
                        }}
                      />
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="stats">
            <motion.div
              className="p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <StatisticsCard
                requests={documents.map((doc) => ({
                  id: doc.id,
                  type: doc.type,
                  name: `${doc.name} ${doc.surname}`,
                  email: doc.email,
                  date: (doc.createdAt || new Date()).toISOString(), // <- ici
                  status: "completed",
                  assignedTo: doc.assignedAdmin,
                }))}
              />
            </motion.div>
          </TabsContent>
        </motion.div>

        {/* Modales avec animations */}
        <AnimatePresence>
          {isModalOpen && selectedRequest && (
            <motion.div
              key="details-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RequestDetailsModal
                isOpen={true}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                ref={modalRef}
              />
            </motion.div>
          )}

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
                title="Générer le PDF"
                message="Souhaitez-vous vraiment générer le PDF de cette demande ?"
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
                title="Remettre en cours"
                message="Voulez-vous vraiment remettre cette demande au statut 'En cours' ?"
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
                  setDocuments((docs) =>
                    docs.map((d) =>
                      d.id === updated.id
                        ? { ...d, details: updated.details }
                        : d
                    )
                  );
                  setFilteredDocuments((docs) =>
                    docs.map((d) =>
                      d.id === updated.id
                        ? { ...d, details: updated.details }
                        : d
                    )
                  );
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </AdminLayout>
  );
};

export default Documents;
