import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Clock,
  Check,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Mail,
} from "lucide-react"; // Importer l'icône Calendar
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { io } from "socket.io-client";

// Types localement
export type RequestStatus =
  | "new"
  | "assigned"
  | "in-progress"
  | "completed"
  | "rejected";

export type RequestType =
  | "registration"
  | "selection-tests"
  | "accident-report"
  | "responsibility-waiver"
  | "healing-certificate"; // Add this if needed

export interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  date: Date;
  status: RequestStatus;
  assignedTo?: string | null;
  rejectedAt?: Date;
  details?: any;
  assignedAdminName?: string | null;
}

interface Admin {
  id: string;
  name: string;
  deleted?: number; // Optional property to indicate deletion status
}

export interface RequestsTableProps {
  requests: Request[];
  admins: Admin[];
  onAssignRequest: (requestId: string, adminId: string) => void;
  onUpdateStatus: (requestId: string, newStatus: RequestStatus) => void;
  onViewDetails: (request: Request) => void;
  onOpenAppointmentDialog: (request: Request) => void;
  onRequestDeleted?: (requestId: string) => void;
  currentUserRole: "admin" | "superadmin" | "owner";
  currentAdminId: string;
  currentUserFirstName: string;
  currentUserLastName: string;
  assignedAdminFilter: string;
  statusFilter: RequestStatus | "all";
  typeFilter: RequestType | "all";
  searchQuery: string;
}

/**
 * Fonction utilitaire pour traduire le type de demande
 */
export function translateRequestType(type: RequestType, t: any): string {
  switch (type) {
    case "registration":
      return t("request_type_registration");
    case "selection-tests":
      return t("request_type_selection_tests");
    case "accident-report":
      return t("request_type_accident_report");
    case "responsibility-waiver":
      return t("request_type_responsibility_waiver");
    default:
      return type;
  }
}

/**
 * Retourne le Badge correspondant au statut
 */
export function getStatusBadge(status: RequestStatus, t: any) {
  const baseClass = "whitespace-nowrap";

  switch (status) {
    case "new":
      return (
        <Badge className={`${baseClass} bg-blue-500`}>{t("status_new")}</Badge>
      );
    case "assigned":
      return (
        <Badge className={`${baseClass} bg-purple-500`}>
          {t("status_assigned")}
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className={`bg-yellow-500 whitespace-nowrap`}>
          {t("status_in_progress")}
        </Badge>
      );
    case "completed":
      return (
        <Badge className={`${baseClass} bg-green-500`}>
          {t("status_completed")}
        </Badge>
      );
    case "rejected":
      return (
        <Badge className={`${baseClass} bg-red-500`}>
          {t("status_rejected")}
        </Badge>
      );
    default:
      return <Badge className={baseClass}>{t("status_unknown")}</Badge>;
  }
}

const formatRequestId = (id: string | number): string => {
  const numericId = typeof id === "number" ? id : parseInt(id, 10);
  return `DEM-${numericId.toString().padStart(3, "0")}`;
};

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  admins,
  onAssignRequest,
  onUpdateStatus,
  onViewDetails,
  onOpenAppointmentDialog,
  onRequestDeleted,
  currentUserRole,
  currentAdminId,
  currentUserFirstName,
  currentUserLastName,
  assignedAdminFilter,
  statusFilter,
  typeFilter,
  searchQuery,
}) => {
  const [pendingDeletion, setPendingDeletion] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [now, setNow] = useState(new Date());
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "accept" | "reject";
    request: Request;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, lang } = useTranslation();
  const [isConnected, setIsConnected] = useState(false); // Exemple d'indicateur de connexion

  const handleUpdateStatus = (requestId: string, newStatus: RequestStatus) => {
    // Rien ici pour "rejected", car la suppression est gérée dans Dashboard

    if (newStatus === "in-progress" && pendingDeletion[requestId]) {
      clearTimeout(pendingDeletion[requestId]);
      setPendingDeletion((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    }

    onUpdateStatus(requestId, newStatus);
  };

  function formatElapsedTime(past: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "À l’instant";
    if (minutes < 60)
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    if (days < 3) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;

    return past.toLocaleDateString("fr-BE");
  }

  const assignedValue = "none"; // Define a default value for assignedValue
  const selectedAdmin = admins.find((a) => a.id === assignedValue);
  if (selectedAdmin && Number(selectedAdmin.deleted) === 1) {
    toast({
      title: t("toast_assign_inactive_title"),
      description: t("toast_assign_inactive_description"),
      variant: "destructive",
    });
    return;
  }

  function formatRejectedTime(rejectedAt: Date | undefined, now: Date): string {
    if (!rejectedAt || isNaN(rejectedAt.getTime())) return "Rejeté";

    const diffMs = now.getTime() - rejectedAt.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);

    if (totalMinutes < 59) {
      return "Rejeté il y a quelques minutes";
    } else {
      const hours = Math.floor(totalMinutes / 60);
      return `Rejeté il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
  }

  function formatRemainingTime(
    rejectedAt: Date | undefined,
    now: Date
  ): string {
    if (!rejectedAt || isNaN(rejectedAt.getTime())) return "--:--";

    // Calcul de la date limite de suppression : 24h après rejectedAt
    const deletionDeadline = new Date(rejectedAt);
    deletionDeadline.setHours(deletionDeadline.getHours() + 24);

    const diffMs = deletionDeadline.getTime() - now.getTime();
    if (diffMs <= 0) {
      // La demande est supprimée définitivement, on affiche le temps écoulé depuis la suppression
      const elapsedMs = now.getTime() - deletionDeadline.getTime();
      const hours = Math.floor(elapsedMs / 3600000);
      const minutes = Math.floor((elapsedMs % 3600000) / 60000);

      // Exemple de format : "Supprimé il y a 3 heures et 15 minutes"
      if (hours > 0) {
        return `Supprimé il y a ${hours} heure${hours > 1 ? "s" : ""}${
          minutes > 0 ? ` et ${minutes} minute${minutes > 1 ? "s" : ""}` : ""
        }`;
      } else {
        return `Supprimé il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
      }
    }

    // Sinon, on affiche le compte à rebours au format HH:MM
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    // Simulation de chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [requests]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tableVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatRequestId(req.id).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    const matchesType = typeFilter === "all" || req.type === typeFilter;

    const matchesAdmin =
      assignedAdminFilter === "all" ||
      (assignedAdminFilter === "none" && !req.assignedTo) ||
      req.assignedTo === assignedAdminFilter;

    return matchesSearch && matchesStatus && matchesType && matchesAdmin;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const getPriority = (status: RequestStatus) => {
      if (status === "rejected") return 3;
      if (status === "in-progress") return 2;
      return 1;
    };

    return getPriority(a.status) - getPriority(b.status);
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sendConfirmationEmail = async (
    request: Request,
    decision: "accepted" | "rejected"
  ) => {
    try {
      // Mappings des types de demandes vers les templates d'emails
      const mappings = {
        accepted: {
          registration: "registration_confirmed",
          "selection-tests": "selection_confirmed",
          "accident-report": "accident_confirmed",
          healing: "healing_confirmed",
          "responsibility-waiver": "waiver_confirmed",
        },
        rejected: {
          registration: "refus_registration",
          "selection-tests": "refus_selection",
          "accident-report": "refus_accident",
          healing: "refus_healing",
          "responsibility-waiver": "refus_waiver",
        },
      };

      // Sélectionner le template approprié selon la décision
      const template = mappings[decision][request.type];
      console.log("📧 Type de template utilisé:", template);

      const response = await fetch(
        "http://localhost:5000/api/form-mail/send-decision-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            formData: request.details,
            requestId: request.id,
            decision,
            requestType: request.type,
            template,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur serveur:", errorData);
        throw new Error(errorData.message || "Échec de l'envoi");
      }

      const data = await response.json();
      toast({
        title:
          decision === "accepted" ? "Confirmation envoyée" : "Refus envoyé",
        description: `L'email de ${
          decision === "accepted" ? "confirmation" : "refus"
        } a été envoyé avec succès.`,
      });
    } catch (error) {
      console.error("❌ Erreur envoi email:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer l'email de ${
          decision === "accepted" ? "confirmation" : "refus"
        }.`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={tableVariants}>
        <Table>
          <thead>
            <TableRow>
              <TableHead>{t("table_id")}</TableHead>
              <TableHead>{t("table_type")}</TableHead>
              <TableHead>{t("table_name")}</TableHead>
              <TableHead>{t("table_status")}</TableHead>
              <TableHead>{t("table_assigned_to")}</TableHead>
              <TableHead>{t("table_date")}</TableHead>
              <TableHead className="text-center border-l">
                {t("table_appointment")}
              </TableHead>
              <TableHead className="text-center">
                {t("table_actions")}
              </TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {isLoading ? (
              // Skeleton loader pendant le chargement
              Array.from({ length: 5 }).map((_, index) => (
                <motion.tr
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.8 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1,
                  }}
                  className="h-16"
                >
                  <TableCell>
                    <motion.div className="h-4 bg-gray-200 rounded w-3/4" />
                  </TableCell>
                  <TableCell>
                    <motion.div className="h-4 bg-gray-200 rounded w-1/2" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <motion.div className="h-3 bg-gray-200 rounded w-full" />
                      <motion.div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <motion.div className="h-6 bg-gray-200 rounded-full w-16" />
                  </TableCell>
                  <TableCell>
                    <motion.div className="h-4 bg-gray-200 rounded w-24" />
                  </TableCell>
                  <TableCell>
                    <motion.div className="h-4 bg-gray-200 rounded w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <motion.div className="h-8 bg-gray-200 rounded-full w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 4 }).map((_, btnIndex) => (
                        <motion.div
                          key={`btn-skeleton-${btnIndex}`}
                          className="h-8 w-8 bg-gray-200 rounded-full"
                        />
                      ))}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            ) : paginatedRequests.length === 0 ? (
              // Aucun résultat
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  {t("table_no_results")}
                </TableCell>
              </TableRow>
            ) : (
              // Affichage des données
              paginatedRequests.map((request) => {
                const assignedValue = request.assignedTo ?? "none";
                const adminRecord = admins?.find(
                  (a) => Number(a.id) === Number(request.assignedTo)
                );
                const assignedName =
                  !request.assignedTo || request.assignedTo === "none"
                    ? "Non assigné"
                    : adminRecord
                    ? adminRecord.name
                    : request.assignedAdminName || "Inconnu";
                const assignedAdminName = admins.find(
                  (a) => a.id === assignedValue
                )?.name;
                const isAssignedToCurrentUser =
                  assignedAdminName ===
                  `${currentUserFirstName} ${currentUserLastName}`;

                return (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, backgroundColor: "#e3f2fd" }}
                    animate={{ opacity: 1, backgroundColor: "#ffffff" }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
                      isAssignedToCurrentUser &&
                        "bg-blue-50 hover:bg-blue-100 dark:bg-red-900"
                    )}
                    onClick={() => onViewDetails(request)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatRequestId(request.id)}
                    </TableCell>

                    <TableCell>
                      {translateRequestType(request.type, t)}
                      {request.type === "accident-report" &&
                        request.details?.documentLabel ===
                          "Déclaration d'accident" &&
                        " (1/2)"}
                      {request.type === "accident-report" &&
                        request.details?.documentLabel ===
                          "Certificat de guérison" &&
                        " (2/2)"}
                    </TableCell>

                    <TableCell>
                      <div>
                        <div>{request.name}</div>
                        <div className="text-xs text-gray-500">
                          {request.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(request.status, t)}</TableCell>
                    <TableCell>
                      {["owner", "superadmin"].includes(currentUserRole) ? (
                        <Select
                          value={assignedValue}
                          onValueChange={(value) => {
                            if (
                              value === "none" &&
                              request.status === "assigned"
                            ) {
                              onUpdateStatus(request.id, "new");
                              return;
                            }
                            const selectedAdmin = admins.find(
                              (a) => a.id === value
                            );
                            if (selectedAdmin?.deleted === 1) {
                              toast({
                                title: t("toast_assign_inactive_title"),
                                description: t(
                                  "toast_assign_inactive_description"
                                ),
                                variant: "destructive",
                              });
                              return;
                            }
                            onAssignRequest(request.id, value);
                          }}
                        >
                          <SelectTrigger
                            className="w-[180px] text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue placeholder="Assigner à" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {t("select_unassigned")}
                            </SelectItem>
                            {admins.map((admin) => (
                              <SelectItem key={admin.id} value={admin.id}>
                                {admin.name}{" "}
                                {admin.deleted === 1 && (
                                  <span className="hover:text-white">
                                    {t("label_inactive")}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        // Pour les admins, affichage statique
                        <span className="text-sm">
                          {!request.assignedTo || request.assignedTo === "none"
                            ? t("select_unassigned")
                            : admins?.find(
                                (a) =>
                                  Number(a.id) === Number(request.assignedTo)
                              )
                            ? admins.find(
                                (a) =>
                                  Number(a.id) === Number(request.assignedTo)
                              )!.name
                            : request.assignedAdminName || "Inconnu"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{formatElapsedTime(request.date)}</TableCell>

                    <TableCell className="text-center border-l-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            title={t("button_actions_title")}
                            className="data-[state=open]:bg-gray-200 data-[state=open]:text-gray-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuPortal>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-56 bg-gray-100 shadow-md rounded-md transition-all duration-200 ease-in-out py-2 cursor-pointer border-none"
                          >
                            {/* Voir la demande */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(request);
                              }}
                              title={t("dropdown_view_request")}
                              className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                            >
                              <Eye className="h-5 w-5 text-gray-600" />
                              <span className="text-sm text-gray-800">
                                {t("dropdown_view_request")}
                              </span>
                            </DropdownMenuItem>

                            {/* Envoyer un email */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                const mailtoLink = `mailto:${
                                  request.email
                                }?subject=Daring Brussels Academy - ${translateRequestType(
                                  request.type,
                                  t
                                )}`;
                                window.location.href = mailtoLink;
                              }}
                              title={t("dropdown_send_email")}
                              className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                            >
                              <Mail className="h-5 w-5 text-gray-600" />
                              <span className="text-sm text-gray-800">
                                {t("dropdown_send_email")}
                              </span>
                            </DropdownMenuItem>

                            {/* Rendez-vous (si inscription) */}
                            {request.type === "registration" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAppointmentDialog(request);
                                }}
                                title={t("dropdown_appointment")}
                                className="flex items-center gap-3 hover:bg-gray-200 transition-all duration-200 ease-in-out px-4 py-2"
                              >
                                <Calendar className="h-5 w-5 text-gray-600" />
                                <span className="text-sm text-gray-800">
                                  {t("dropdown_appointment")}
                                </span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="text-center border-l">
                      {request.status === "rejected" ? (
                        <div className="flex justify-between items-center w-full">
                          <div className="text-xs text-red-600 text-center leading-tight w-full">
                            <div className="font-semibold">
                              {formatRejectedTime(request.rejectedAt, now)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (assignedValue === "none") {
                                toast({
                                  title: t("toast_assign_required_title"),
                                  description: t(
                                    "toast_accept_assign_required_desc"
                                  ),
                                  variant: "destructive",
                                });
                                return;
                              }

                              // Vérification améliorée avec conversion en string
                              if (
                                request.assignedTo &&
                                String(request.assignedTo) !==
                                  String(currentAdminId)
                              ) {
                                console.log(
                                  "Debug - AssignedTo:",
                                  request.assignedTo,
                                  "CurrentAdminId:",
                                  currentAdminId
                                );
                                toast({
                                  title: t("error"),
                                  description:
                                    "Vous ne pouvez accepter que les demandes qui vous sont assignées.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              setPendingAction({ type: "accept", request });
                              setConfirmOpen(true);
                            }}
                            disabled={request.status === "completed"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (assignedValue === "none") {
                                toast({
                                  title: t("toast_assign_required_title"),
                                  description: t(
                                    "toast_reject_assign_required_desc"
                                  ),
                                  variant: "destructive",
                                });
                                return;
                              }

                              // Vérification améliorée avec conversion en string
                              if (
                                request.assignedTo &&
                                String(request.assignedTo) !==
                                  String(currentAdminId)
                              ) {
                                toast({
                                  title: t("error"),
                                  description:
                                    "Vous ne pouvez rejeter que les demandes qui vous sont assignées.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              setPendingAction({ type: "reject", request });
                              setConfirmOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t px-4 py-3">
            <span className="text-sm text-gray-600">
              {t("pagination_page_prefix")}
              {currentPage}
              {t("pagination_page_separator")}
              {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <ConfirmationDialog
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setPendingAction(null);
          }}
          onConfirm={(sendEmail) => {
            if (!pendingAction) return;

            const { request, type } = pendingAction;

            /* 1. Mise à jour du statut */
            handleUpdateStatus(
              request.id,
              type === "accept"
                ? request.type === "accident-report"
                  ? "in-progress"
                  : "completed"
                : "rejected"
            );

            /* 2. Envoi d'email si la case est cochée */
            if (sendEmail) {
              const decision = type === "accept" ? "accepted" : "rejected";
              sendConfirmationEmail(request, decision);
            }

            /* 3. Fermeture du dialogue */
            setConfirmOpen(false);
            setPendingAction(null);
          }}
          message={`Êtes-vous sûr de vouloir ${
            pendingAction?.type === "accept" ? "accepter" : "rejeter"
          } cette demande ? ${
            pendingAction?.type === "accept"
              ? "Un email de confirmation sera envoyé au demandeur."
              : "Un email de refus sera envoyé au demandeur."
          }`}
          showEmailCheckbox
        />
      </motion.div>
    </>
  );
};

export default RequestsTable;
