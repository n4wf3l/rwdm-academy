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
import { Eye, Clock, Check, X, Calendar } from "lucide-react"; // Importer l'icône Calendar

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
  | "responsibility-waiver";

interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  date: Date;
  status: RequestStatus;
  assignedTo?: string | null;
  rejectedAt?: Date;
}

interface Admin {
  id: string;
  name: string;
}

export interface RequestsTableProps {
  requests: Request[];
  admins: Admin[];
  onAssignRequest: (requestId: string, adminId: string) => void;
  onUpdateStatus: (requestId: string, newStatus: RequestStatus) => void;
  onViewDetails: (request: Request) => void;
  onOpenAppointmentDialog: (request: Request) => void; // Nouvelle prop
}

/**
 * Fonction utilitaire pour traduire le type de demande
 */
export function translateRequestType(type: RequestType): string {
  switch (type) {
    case "registration":
      return "Inscription à l'académie";
    case "selection-tests":
      return "Tests de sélection";
    case "accident-report":
      return "Déclaration d'accident";
    case "responsibility-waiver":
      return "Décharge de responsabilité";
    default:
      return type;
  }
}

/**
 * Retourne le Badge correspondant au statut
 */
export function getStatusBadge(status: RequestStatus) {
  switch (status) {
    case "new":
      return <Badge className="bg-blue-500">Nouveau</Badge>;
    case "assigned":
      return <Badge className="bg-purple-500">Assigné</Badge>;
    case "in-progress":
      return <Badge className="bg-yellow-500">En cours</Badge>;
    case "completed":
      return <Badge className="bg-green-500">Terminé</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rejeté</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
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
}) => {
  const [pendingDeletion, setPendingDeletion] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [now, setNow] = useState(new Date());

  const handleUpdateStatus = (requestId: string, newStatus: RequestStatus) => {
    if (newStatus === "rejected") {
      const timeout = setTimeout(() => {
        fetch(`http://localhost:5000/api/requests/${requestId}`, {
          method: "DELETE",
        }).then(() => {
          // Optionnel : tu peux ici aussi appeler un callback pour mettre à jour l'état global
        });
      }, 10000);

      setPendingDeletion((prev) => ({
        ...prev,
        [requestId]: timeout,
      }));
    }

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

  function formatRemainingTime(
    rejectedAt: Date | undefined,
    now: Date
  ): string {
    if (!rejectedAt || isNaN(rejectedAt.getTime())) return "--:--";

    const deletionDeadline = new Date(rejectedAt);
    deletionDeadline.setHours(deletionDeadline.getHours() + 24);

    const diffMs = deletionDeadline.getTime() - now.getTime();
    if (diffMs <= 0) return "00:00";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "rejected") return 1;
    if (b.status === "rejected") return -1;
    return 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Assigné à</TableHead>
          <TableHead className="text-center border-l">Rendez-vous</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedRequests.map((request) => {
          // Si request.assignedTo est null ou undefined, on affiche "none"
          const assignedValue = request.assignedTo ?? "none";
          if (request.status === "rejected") {
            console.log("⏰ request.rejectedAt:", request.rejectedAt);
          }
          return (
            <TableRow
              key={request.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onViewDetails(request)}
            >
              <TableCell className="font-medium">
                {formatRequestId(request.id)}
              </TableCell>
              <TableCell>{translateRequestType(request.type)}</TableCell>
              <TableCell>
                <div>
                  <div>{request.name}</div>
                  <div className="text-xs text-gray-500">{request.email}</div>
                </div>
              </TableCell>
              <TableCell>{formatElapsedTime(request.date)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <Select
                  value={assignedValue}
                  onValueChange={(value) => {
                    onAssignRequest(request.id, value);
                  }}
                >
                  <SelectTrigger
                    className="w-[180px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue placeholder="Assigner à" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non assigné</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell className="text-center border-l">
                {request.type === "registration" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAppointmentDialog(request);
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell className="text-center">
                {request.status === "rejected" ? (
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-red-600 text-center leading-tight w-full">
                      <div>Suppression dans</div>
                      <div className="font-semibold">
                        {formatRemainingTime(request.rejectedAt, now)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 text-yellow-600 border-yellow-600 hover:bg-yellow-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(request.id, "in-progress");
                      }}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(request);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(request.id, "in-progress");
                      }}
                      disabled={request.status === "in-progress"}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(request.id, "completed");
                      }}
                      disabled={request.status === "completed"}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mémorise l'heure exacte du rejet

                        handleUpdateStatus(request.id, "rejected");
                      }}
                      disabled={
                        request.status === ("rejected" as RequestStatus)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default RequestsTable;
