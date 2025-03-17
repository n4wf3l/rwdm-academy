// RequestsTable.tsx
import React from "react";
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
import { Eye, Clock, Check, X } from "lucide-react";

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
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune demande ne correspond à vos critères de recherche.
      </div>
    );
  }

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
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {requests.map((request) => {
          // Si request.assignedTo est null ou undefined, on affiche "none"
          const assignedValue = request.assignedTo ?? "none";

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
              <TableCell>{request.date.toLocaleDateString("fr-BE")}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <Select
                  value={assignedValue}
                  onValueChange={(value) => {
                    // Si "none" est sélectionné, le statut doit redevenir "new"
                    if (value === "none") {
                      onAssignRequest(request.id, value);
                      // Vous pouvez gérer le changement de statut dans le callback parent
                    } else {
                      onAssignRequest(request.id, value);
                    }
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
              <TableCell>
                <div className="flex gap-2">
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
                      onUpdateStatus(request.id, "in-progress");
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
                      if (request.type === "accident-report") {
                        onUpdateStatus(request.id, "in-progress");
                      } else {
                        onUpdateStatus(request.id, "completed");
                      }
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
                      onUpdateStatus(request.id, "rejected");
                    }}
                    disabled={request.status === "rejected"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default RequestsTable;
