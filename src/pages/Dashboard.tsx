import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

// Types et composants
import RequestDetailsModal, {
  Request,
  RequestType,
  RequestStatus,
} from "@/components/RequestDetailsModal";
import SearchFilters from "@/components/dashboard/SearchFilters";
import RequestsTable from "@/components/dashboard/RequestsTable";
import CompletedRequestsCard from "@/components/dashboard/CompletedRequestsCard";
import PendingAccidentsCard from "@/components/dashboard/PendingAccidentsCard";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import AppointmentDialog from "@/components/dashboard/AppointmentDialog";

// Définition locale du type Admin
export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  functionTitle: string;
  description: string;
  role: string;
  name: string;
}

const Dashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pagination / modales
  const [completedRequestsPage, setCompletedRequestsPage] = useState(1);
  const completedRequestsPerPage = 5;
  const [pendingAccidentReportsPage, setPendingAccidentReportsPage] =
    useState(1);
  const pendingAccidentReportsPerPage = 5;
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Récupération du token depuis le localStorage (stocké après login)
  const token = localStorage.getItem("token");

  // 1) Récupérer les demandes depuis l'API
  useEffect(() => {
    fetchRequests();
  }, [token]);

  async function fetchRequests() {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5000/api/requests", {
        headers,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des demandes");
      }
      const rows = await response.json();
      console.log("✅ Rows récupérées :", rows);

      // On transforme chaque ligne en un objet "Request"
      const formattedRequests: Request[] = rows.map((req: any) => {
        // On parse la colonne data (JSON)
        const dataParsed = JSON.parse(req.data || "{}");

        // On détermine name / email (simplifié ici)
        let nameFromData = "inconnu";
        let emailFromData = "Non spécifié";

        switch (req.type) {
          case "registration":
          case "selection-tests":
            if (dataParsed.lastName && dataParsed.firstName) {
              nameFromData = `${dataParsed.lastName} ${dataParsed.firstName}`;
            }
            emailFromData =
              dataParsed.parent1Email || dataParsed.email || "Non spécifié";
            break;

          case "accident-report":
            if (dataParsed.playerLastName && dataParsed.playerFirstName) {
              nameFromData = `${dataParsed.playerLastName} ${dataParsed.playerFirstName}`;
            }
            emailFromData = dataParsed.email || "Non spécifié";
            break;

          case "responsibility-waiver":
            if (dataParsed.playerLastName && dataParsed.playerFirstName) {
              nameFromData = `${dataParsed.playerLastName} ${dataParsed.playerFirstName}`;
            }
            emailFromData = dataParsed.parentEmail || "Non spécifié";
            break;

          default:
            break;
        }

        // On stocke tout le JSON dans `details` :
        // (ainsi RequestDetailsModal aura access à request.details)
        return {
          id: req.id.toString(),
          type: req.type,
          name: nameFromData,
          email: emailFromData,
          // si besoin : phone: dataParsed.phone ?? dataParsed.parent1Phone ?? null,
          date: new Date(req.created_at),
          status: mapDbStatus(req.status),
          assignedTo: req.admin_id ? req.admin_id.toString() : "none",
          details: dataParsed, // <= c'est le plus important
        };
      });

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  }

  // 2) Récupérer la liste des admins (ex: seulement superadmin)
  useEffect(() => {
    fetchAdmins();
  }, [token]);

  async function fetchAdmins() {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("http://localhost:5000/api/admins", {
        headers,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des administrateurs");
      }
      const data = await response.json();
      console.log("✅ Admins récupérés :", data);

      // Filtrer si besoin => superadmin
      const onlySuperAdmins = data.filter((u: any) => u.role === "superadmin");

      const formattedAdmins: Admin[] = onlySuperAdmins.map((user: any) => ({
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        functionTitle: user.functionTitle,
        description: user.description,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      }));

      setAdmins(formattedAdmins);
    } catch (error) {
      console.error("Erreur admins:", error);
    }
  }

  // Convertir un statut DB => TS
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

  // Convertir un statut TS => DB
  function reverseMapStatus(tsStatus: RequestStatus): string {
    switch (tsStatus) {
      case "new":
        return "Nouveau";
      case "assigned":
        return "Assigné";
      case "in-progress":
        return "En cours";
      case "completed":
        return "Terminé";
      case "rejected":
        return "Rejeté";
      default:
        return "Nouveau";
    }
  }

  // 3) Filtrage local
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? req.status !== "completed"
        : req.status === statusFilter;

    const matchesType = typeFilter === "all" || req.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // tri pour "completed" + pagination
  const completedRequests = requests.filter((r) => r.status === "completed");
  const totalCompletedPages = Math.ceil(
    completedRequests.length / completedRequestsPerPage
  );
  const paginatedCompletedRequests = completedRequests.slice(
    (completedRequestsPage - 1) * completedRequestsPerPage,
    completedRequestsPage * completedRequestsPerPage
  );

  // tri pour "accident-report" en cours
  const pendingAccidentReports = requests.filter(
    (r) => r.type === "accident-report" && r.status === "in-progress"
  );
  const totalPendingAccidentPages = Math.ceil(
    pendingAccidentReports.length / pendingAccidentReportsPerPage
  );
  const paginatedPendingAccidents = pendingAccidentReports.slice(
    (pendingAccidentReportsPage - 1) * pendingAccidentReportsPerPage,
    pendingAccidentReportsPage * pendingAccidentReportsPerPage
  );

  // 4) Callbacks (assign / status)
  const handleAssignRequest = async (requestId: string, adminId: string) => {
    try {
      // si "none", on repasse le statut => "new"
      const newStatus: RequestStatus = adminId === "none" ? "new" : "assigned";
      // on met à jour le statut côté serveur
      await handleUpdateStatus(requestId, newStatus);

      // ensuite, on PATCH l'assignation
      const bodyToSend = { assignedTo: adminId === "none" ? null : adminId };
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(bodyToSend),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de l'assignation");
      }
      toast({
        title: "Demande assignée",
        description:
          adminId === "none"
            ? `La demande ${requestId} a été désassignée et repassée en "Nouveau".`
            : `La demande ${requestId} a été assignée à l'admin ${adminId}.`,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Erreur d'assignation :", error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner la demande.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: RequestStatus
  ) => {
    try {
      const dbStatus = reverseMapStatus(newStatus);
      const bodyToSend = { status: dbStatus };
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(bodyToSend),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      toast({
        title: "Statut mis à jour",
        description: `Le statut a été changé en "${dbStatus}".`,
      });
      await fetchRequests();
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de la demande.",
        variant: "destructive",
      });
    }
  };

  const sendAccidentToFederation = (requestId: string) => {
    handleUpdateStatus(requestId, "completed");
    toast({
      title: "Déclaration envoyée",
      description: "La déclaration d'accident a été transmise à l'Union Belge.",
    });
  };

  // 5) Modales
  const openRequestDetails = (req: Request) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };
  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleAppointmentTypeSelection = (type: "test" | "secretariat") => {
    setIsAppointmentDialogOpen(false);
    // ...
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les demandes et suivez leur progression
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/planning">
              <Button className="bg-rwdm-blue">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Voir le planning
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <SearchFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onTypeFilterChange={setTypeFilter}
            />
            <Card>
              <CardHeader>
                <CardTitle>
                  Liste des demandes ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <RequestsTable
                    requests={filteredRequests}
                    admins={admins}
                    onAssignRequest={handleAssignRequest}
                    onUpdateStatus={handleUpdateStatus}
                    onViewDetails={openRequestDetails}
                  />
                </div>
              </CardContent>
            </Card>

            <PendingAccidentsCard
              pendingAccidents={paginatedPendingAccidents}
              page={pendingAccidentReportsPage}
              totalPages={totalPendingAccidentPages}
              onPageChange={setPendingAccidentReportsPage}
              onViewDetails={openRequestDetails}
              onSendToFederation={sendAccidentToFederation}
            />

            <CompletedRequestsCard
              completedRequests={paginatedCompletedRequests}
              page={completedRequestsPage}
              totalPages={totalCompletedPages}
              onPageChange={setCompletedRequestsPage}
              onViewDetails={openRequestDetails}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatisticsCard requests={requests} />
          </TabsContent>
        </Tabs>
      </div>

      <RequestDetailsModal
        isOpen={isModalOpen}
        onClose={closeRequestDetails}
        request={selectedRequest}
      />

      <AppointmentDialog
        isOpen={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        onSelectAppointmentType={handleAppointmentTypeSelection}
      />
    </AdminLayout>
  );
};

export default Dashboard;
