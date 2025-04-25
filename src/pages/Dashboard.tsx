import React, { useEffect, useMemo, useState } from "react";
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
import {
  Appointment,
  AppointmentType,
  getAvailableTimeSlotsForDate,
} from "@/components/planning/planningUtils";
import AddAppointmentDialog from "@/components/planning/AddAppointmentDialog";
import axios from "axios";
import { motion } from "framer-motion";

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
  const [assignedAdminFilter, setAssignedAdminFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completedRequestsPage, setCompletedRequestsPage] = useState(1);
  const completedRequestsPerPage = 5;
  const [pendingAccidentReportsPage, setPendingAccidentReportsPage] =
    useState(1);
  const pendingAccidentReportsPerPage = 5;
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] =
    useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<
    Date | undefined
  >(undefined);
  const [newAppointmentTime, setNewAppointmentTime] = useState("");
  const [newAppointmentType, setNewAppointmentType] =
    useState<AppointmentType>("registration");
  const [newAppointmentPerson, setNewAppointmentPerson] = useState("");
  const [newAppointmentEmail, setNewAppointmentEmail] = useState("");
  const [newAppointmentAdmin, setNewAppointmentAdmin] = useState("");
  const [newAppointmentNotes, setNewAppointmentNotes] = useState("");
  const [pendingDeletion, setPendingDeletion] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<{
    id: string; // <= IL MANQUE CELUI-CI
    firstName: string;
    lastName: string;
    role: "admin" | "superadmin" | "owner";
  }>({
    id: "", // <= valeur initiale
    firstName: "",
    lastName: "",
    role: "admin",
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await fetch("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      console.log("Données des rendez-vous :", data); // Ajoutez ce log
      const formattedAppointments = data.map((appointment: any) => ({
        ...appointment,
        date: new Date(appointment.date),
        time: appointment.time,
      }));

      setAppointments(formattedAppointments);
    };

    fetchAppointments();
  }, []);

  // Calculer les créneaux horaires disponibles pour la date sélectionnée
  const availableTimeSlots = useMemo(() => {
    if (!newAppointmentDate) return [];
    return getAvailableTimeSlotsForDate(appointments, newAppointmentDate);
  }, [appointments, newAppointmentDate]);

  const assignedAdminOptions = admins.map((a) => ({ id: a.id, name: a.name }));

  const scheduleDeletion = (requestId: string) => {
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/requests/${requestId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          toast({
            title: "Demande supprimée",
            description: "La demande a été supprimée définitivement.",
          });
        }
      } catch (error) {
        console.error("Erreur de suppression différée :", error);
      }
    }, 10000); // 10 secondes

    setPendingDeletion((prev) => ({ ...prev, [requestId]: timeout }));
  };

  const cancelScheduledDeletion = (requestId: string) => {
    if (pendingDeletion[requestId]) {
      clearTimeout(pendingDeletion[requestId]);
      setPendingDeletion((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    }
  };

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
          rejectedAt: req.rejected_at
            ? new Date(req.rejected_at.replace(" ", "T"))
            : undefined,

          details: dataParsed, // <= c'est le plus important
        };
      });

      setRequests(formattedRequests);
      // 🔁 Vérifier si des demandes déjà "rejected" doivent être supprimées automatiquement
      formattedRequests.forEach((req) => {
        if (
          req.status === "rejected" &&
          req.rejectedAt &&
          !pendingDeletion[req.id]
        ) {
          const now = new Date();
          const rejectedAt = new Date(req.rejectedAt);
          const deletionDeadline = new Date(
            rejectedAt.getTime() + 24 * 60 * 60 * 1000
          );
          const timeLeft = deletionDeadline.getTime() - now.getTime();

          if (timeLeft > 0) {
            // Planifie la suppression exactement à la fin des 24h
            const timeout = setTimeout(async () => {
              try {
                const res = await fetch(
                  `http://localhost:5000/api/requests/${req.id}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (res.ok) {
                  setRequests((prev) => prev.filter((r) => r.id !== req.id));
                  toast({
                    title: "Demande supprimée automatiquement",
                    description: `La demande ${req.id} a été supprimée après 24h.`,
                  });
                }
              } catch (err) {
                console.error("Erreur suppression auto :", err);
              }
            }, timeLeft);

            setPendingDeletion((prev) => ({ ...prev, [req.id]: timeout }));
          } else {
            // 24h déjà passées, suppression immédiate
            fetch(`http://localhost:5000/api/requests/${req.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              if (res.ok) {
                setRequests((prev) => prev.filter((r) => r.id !== req.id));
                toast({
                  title: "Demande supprimée automatiquement",
                  description: `La demande ${req.id} a été supprimée après 24h.`,
                });
              }
            });
          }
        }
      });
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

      const formattedAdmins: Admin[] = data.map((user: any) => ({
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok)
          throw new Error("Impossible de récupérer l'utilisateur");

        const userData = await response.json();
        console.log("👤 Utilisateur connecté :", userData);
        setUser(userData); // ici, il doit inclure un champ 'role'
      } catch (error) {
        console.error("Erreur utilisateur :", error);
      }
    };

    fetchCurrentUser();
  }, [token]);

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

  const newRequestsCount = requests.filter((r) => r.status === "new").length;

  const completedRequests = requests.filter((r) => r.status === "completed");

  const totalCompletedPages = Math.ceil(
    completedRequests.length / completedRequestsPerPage
  );

  const paginatedCompletedRequests = completedRequests.slice(
    (completedRequestsPage - 1) * completedRequestsPerPage,
    completedRequestsPage * completedRequestsPerPage
  );
  const pendingAccidentReports = requests.filter(
    (r) =>
      r.type === "accident-report" &&
      r.status !== "completed" &&
      r.status !== "rejected"
  );

  const totalPendingAccidentPages = Math.ceil(
    pendingAccidentReports.length / pendingAccidentReportsPerPage
  );
  const paginatedPendingAccidents = pendingAccidentReports.slice(
    (pendingAccidentReportsPage - 1) * pendingAccidentReportsPerPage,
    pendingAccidentReportsPage * pendingAccidentReportsPerPage
  );

  const handleRequestDeleted = (id: string) => {
    console.log("🗑️ Suppression dans Dashboard pour ID :", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAssignRequest = async (requestId: string, adminId: string) => {
    try {
      const newStatus: RequestStatus = adminId === "none" ? "new" : "assigned";

      const bodyToSend = { assignedTo: adminId === "none" ? null : adminId };
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(bodyToSend),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de l'assignation");

      // ✅ Mise à jour du statut selon adminId
      await handleUpdateStatus(requestId, newStatus);

      // ✅ Message utilisateur
      const assignedAdmin = admins.find((admin) => admin.id === adminId);
      const adminFullName =
        assignedAdmin && adminId !== "none"
          ? `${assignedAdmin.firstName} ${assignedAdmin.lastName}`
          : null;

      toast({
        title: "Demande assignée",
        description:
          adminId === "none"
            ? `La demande ${requestId} a été désassignée et repassée en "Nouveau".`
            : `La demande ${requestId} a été assignée à ${
                adminFullName ?? "cet admin"
              }.`,
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

      // ❌ On NE planifie PAS ici la suppression directe, car le rejectedAt n’est pas encore enregistré
      // ✅ On attend que la réponse PATCH soit terminée

      const response = await fetch(
        `http://localhost:5000/api/requests/${requestId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(bodyToSend),
        }
      );

      if (!response.ok) throw new Error("Erreur de mise à jour");

      // ✅ Maintenant que rejectedAt est bien défini dans la DB, on recharge les données
      await fetchRequests(); // cette fonction relancera la logique de setTimeout automatiquement avec le bon rejectedAt

      // ✅ Si on annule un rejet => annuler le timer
      if (newStatus === "in-progress") {
        cancelScheduledDeletion(requestId);
      }

      toast({
        title: "Statut mis à jour",
        description: `Le statut a été changé en "${dbStatus}".`,
      });
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut.",
        variant: "destructive",
      });
    }
  };

  const sendAccidentToFederation = async (requestId: string) => {
    try {
      // 1. Appel backend pour envoyer l'email
      const response = await axios.post(
        `http://localhost:5000/api/email-recipients/send-request/${requestId}`
      );

      console.log("✅ Email envoyé:", response.data);

      // 2. Mise à jour du statut
      handleUpdateStatus(requestId, "completed");

      // 3. Affichage toast
      toast({
        title: "Déclaration envoyée",
        description:
          "La déclaration d'accident a été transmise à l'Union Belge.",
      });
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi :", error);
      toast({
        title: "Échec de l'envoi",
        description:
          "Une erreur est survenue lors de l’envoi de l’email. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const sendAccidentDeclaration = async (requestId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/email-recipients/send-request/${requestId}`
      );
      toast({
        title: "Déclaration envoyée",
        description: "La déclaration d'accident a été transmise.",
      });
      // ❌ NE PAS changer le statut ici !
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la déclaration.",
        variant: "destructive",
      });
    }
  };

  // Quand on clique sur "Send" du certificat : envoyer l'email ET marquer les deux comme terminés
  const sendHealingCertificate = async (requestId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/email-recipients/send-request/${requestId}`
      );

      // 1. Trouver les deux demandes (décla + certificat) avec le même codeDossier
      const healingRequest = requests.find((r) => r.id === requestId);
      const code = healingRequest?.details?.codeDossier;

      if (!code) throw new Error("Code dossier manquant.");

      const toMarkCompleted = requests.filter(
        (r) => r.details?.codeDossier === code && r.type === "accident-report"
      );

      for (const req of toMarkCompleted) {
        await handleUpdateStatus(req.id, "completed");
      }

      toast({
        title: "Certificat envoyé",
        description:
          "Les deux documents ont été transmis et marqués comme terminés.",
      });
    } catch (error) {
      console.error("Erreur certificat :", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du certificat.",
        variant: "destructive",
      });
    }
  };

  const openRequestDetails = (req: Request) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleAppointmentTypeSelection = (type: "test" | "secretariat") => {
    if (!selectedRequest) return;

    if (type === "secretariat") {
      // Ouvrir le modal AddAppointmentDialog
      setIsAppointmentDialogOpen(false); // Fermer le premier modal
      setIsAddAppointmentDialogOpen(true);

      // Préremplir les champs avec les infos de la demande
      setNewAppointmentPerson(selectedRequest.name);
      setNewAppointmentEmail(selectedRequest.email);
      setNewAppointmentType("registration");
    } else if (type === "test") {
      // Afficher une notification pour le test technique
      toast({
        title: "Test technique sélectionné",
        description: "Un email devra être envoyé aux coordinateurs plus tard.",
      });
    }

    // Fermer le modal AppointmentDialog après sélection
    setIsAppointmentDialogOpen(false);
  };

  const openAppointmentDialog = (request: Request) => {
    console.log("Ouverture du modal pour la demande", request.id, request.type);
    // Ici, vous pouvez éventuellement vérifier que request.type === "registration"
    setSelectedRequest(request);
    setIsAppointmentDialogOpen(true);
  };

  const closeAppointmentDialog = () => {
    setSelectedRequest(null);
    setIsAppointmentDialogOpen(false);
  };
  return (
    <AdminLayout newRequestsCount={newRequestsCount}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
                assignedAdminFilter={assignedAdminFilter}
                onSearchChange={setSearchQuery}
                onStatusFilterChange={setStatusFilter}
                onTypeFilterChange={setTypeFilter}
                onAssignedAdminFilterChange={setAssignedAdminFilter}
                assignedAdminOptions={assignedAdminOptions}
              />

              <Card>
                <CardHeader className="flex flex-row items-start justify-between p-4">
                  <CardTitle className="m-0 p-0">
                    Liste des demandes ({filteredRequests.length})
                  </CardTitle>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-3 w-3 rounded-sm bg-blue-50 ring-1 ring-blue-300 dark:bg-red-900 dark:ring-red-800" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Mes assignations
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <RequestsTable
                      requests={filteredRequests}
                      admins={admins}
                      onAssignRequest={handleAssignRequest}
                      onUpdateStatus={handleUpdateStatus}
                      onViewDetails={openRequestDetails}
                      onOpenAppointmentDialog={openAppointmentDialog}
                      onRequestDeleted={handleRequestDeleted}
                      currentUserRole={user.role}
                      currentAdminId={user.id}
                      currentUserFirstName={user.firstName}
                      currentUserLastName={user.lastName}
                      searchQuery={searchQuery}
                      statusFilter={statusFilter}
                      typeFilter={typeFilter}
                      assignedAdminFilter={assignedAdminFilter}
                    />
                    <AppointmentDialog
                      isOpen={isAppointmentDialogOpen}
                      onClose={closeAppointmentDialog}
                      onSelectAppointmentType={handleAppointmentTypeSelection}
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
                admins={admins}
                onSendDeclaration={sendAccidentDeclaration}
                onSendHealingCertificate={sendHealingCertificate}
              />

              <CompletedRequestsCard
                completedRequests={paginatedCompletedRequests}
                totalCompletedCount={completedRequests.length}
                page={completedRequestsPage}
                admins={admins}
                totalPages={totalCompletedPages}
                onPageChange={setCompletedRequestsPage}
                onViewDetails={openRequestDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            </TabsContent>

            <TabsContent value="stats">
              <StatisticsCard requests={requests} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <RequestDetailsModal
        isOpen={isModalOpen}
        onClose={closeRequestDetails}
        request={selectedRequest}
      />

      <AddAppointmentDialog
        isOpen={isAddAppointmentDialogOpen}
        setIsOpen={setIsAddAppointmentDialogOpen}
        newAppointmentDate={newAppointmentDate}
        setNewAppointmentDate={setNewAppointmentDate}
        newAppointmentTime={newAppointmentTime}
        setNewAppointmentTime={setNewAppointmentTime}
        newAppointmentType={newAppointmentType}
        setNewAppointmentType={setNewAppointmentType}
        newAppointmentPerson={newAppointmentPerson}
        setNewAppointmentPerson={setNewAppointmentPerson}
        newAppointmentEmail={newAppointmentEmail}
        setNewAppointmentEmail={setNewAppointmentEmail}
        newAppointmentAdmin={newAppointmentAdmin}
        setNewAppointmentAdmin={setNewAppointmentAdmin}
        newAppointmentNotes={newAppointmentNotes}
        setNewAppointmentNotes={setNewAppointmentNotes}
        appointments={appointments} // Assurez-vous que ce tableau est correctement peuplé
        availableTimeSlots={availableTimeSlots} // Passer les créneaux horaires disponibles
        addAppointmentToState={(appointment) => {
          console.log("🔄 Ajout dans Dashboard :", appointment);
          toast({
            title: "Rendez-vous planifié",
            description: `Un rendez-vous a été ajouté pour ${appointment.personName}.`,
          });
          setIsAddAppointmentDialogOpen(false);
        }}
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
