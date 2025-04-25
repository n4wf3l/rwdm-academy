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
import { Search, RefreshCcw, FileText, Eye, RotateCcw } from "lucide-react";
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

// Importation de la modale et de ses types
import RequestDetailsModal, {
  Request as ModalRequest,
  RequestStatus,
} from "@/components/RequestDetailsModal";
import html2canvas from "html2canvas";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

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

      const formattedDocuments: Document[] = completedDocuments.map(
        (doc: any) => {
          const parsedData = JSON.parse(doc.data || "{}");
          return {
            id: doc.id,
            type: doc.type,
            name: parsedData.firstName || "Inconnu",
            surname: parsedData.lastName || "Inconnu",
            email: parsedData.parent1Email || "Non spécifié",
            phone: parsedData.parent1Phone || "Non spécifié",
            documentUrl: doc.documentUrl || "#",
            status: doc.status,
            // Utilise les colonnes admin_firstName et admin_lastName si présentes, sinon fallback
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

  return (
    <AdminLayout newRequestsCount={newRequestsCount}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Gestion des documents
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Retrouvez les documents des membres
            </p>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres de recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher par nom, prénom, email ou téléphone..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={adminFilter}
                onValueChange={(value) => setAdminFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Assigné à" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les admins</SelectItem>
                  {uniqueAdmins.map((admin) => (
                    <SelectItem key={admin} value={admin}>
                      {admin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as DocumentType | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="registration">Inscriptions</SelectItem>
                  <SelectItem value="selection-tests">
                    Tests techniques
                  </SelectItem>
                  <SelectItem value="responsibility-waiver">
                    Décharges de responsabilité
                  </SelectItem>
                  <SelectItem value="accident-report">
                    Déclarations d'accident
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun document ne correspond à vos critères de recherche.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleViewDetails(doc)}
                    >
                      <TableCell className="font-medium">
                        {formatRequestId(doc.id)}
                      </TableCell>
                      <TableCell>
                        {translateDocumentType(doc.type)}
                        {doc.type === "accident-report" &&
                          doc.data?.documentLabel ===
                            "Déclaration d'accident" &&
                          " (1/2)"}
                        {doc.type === "accident-report" &&
                          doc.data?.documentLabel ===
                            "Certificat de guérison" &&
                          " (2/2)"}
                      </TableCell>

                      <TableCell>
                        {doc.name} {doc.surname}
                      </TableCell>
                      <TableCell>{doc.email}</TableCell>
                      <TableCell>{doc.phone}</TableCell>
                      <TableCell>
                        <span className="bg-green-500 text-white py-1 px-2 rounded">
                          {doc.status}
                        </span>
                      </TableCell>
                      <TableCell>{doc.assignedAdmin}</TableCell>
                      <TableCell>
                        {doc.createdAt
                          ? doc.createdAt.toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleViewDetails(doc, e)}
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmPDFRequest({
                                id: doc.id,
                                type: doc.type,
                                name: `${doc.name} ${doc.surname}`,
                                email: doc.email,
                                date: doc.createdAt
                                  ? doc.createdAt
                                  : new Date(),
                                status: mapStatus(doc.status),
                                assignedTo: doc.assignedAdmin,
                                details: doc.data,
                              });
                            }}
                            title="Générer PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRevertId(doc.id);
                            }}
                            title="Mettre en cours"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modale des détails */}
      {selectedRequest && (
        <RequestDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          request={selectedRequest}
          ref={modalRef}
        />
      )}

      <ConfirmationDialog
        open={!!confirmPDFRequest}
        onClose={() => setConfirmPDFRequest(null)}
        onConfirm={() => {
          if (confirmPDFRequest) {
            setSelectedRequest(confirmPDFRequest);
            setIsModalOpen(true);
            waitForRefThenGeneratePDF();
            setConfirmPDFRequest(null);
          }
        }}
        title="Générer le PDF"
        message="Souhaitez-vous vraiment générer le PDF de cette demande ?"
      />

      <ConfirmationDialog
        open={!!confirmRevertId}
        onClose={() => setConfirmRevertId(null)}
        onConfirm={() => {
          if (confirmRevertId) {
            handleRevertStatus(confirmRevertId);
            setConfirmRevertId(null);
          }
        }}
        title="Remettre en cours"
        message="Voulez-vous vraiment remettre cette demande au statut 'En cours' ?"
      />
    </AdminLayout>
  );
};

export default Documents;
