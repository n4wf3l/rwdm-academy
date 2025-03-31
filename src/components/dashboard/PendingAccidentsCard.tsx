import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye, Send } from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";

export interface Admin {
  id: string;
  name: string;
}

// Fonction pour formater l'ID de la demande sous forme DEM-XXX
const formatRequestId = (id: string | number): string => {
  const numericId = typeof id === "number" ? id : parseInt(id, 10);
  return `DEM-${numericId.toString().padStart(3, "0")}`;
};

// Fonction pour calculer le délai restant (ou le retard) en jours
// On considère que 21 jours après l'accident constitue la deadline.
const getDeadlineInfo = (accidentDateString?: string): string => {
  if (!accidentDateString) return "N/A";
  const accidentDate = new Date(accidentDateString);
  const deadlineDate = new Date(accidentDate);
  deadlineDate.setDate(accidentDate.getDate() + 21);
  const diffTime = deadlineDate.getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} jour(s) restants`;
  else if (diffDays === 0) return "Deadline aujourd'hui";
  else return `En retard de ${Math.abs(diffDays)} jour(s)`;
};

interface PendingAccidentsCardProps {
  pendingAccidents: Request[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (request: Request) => void;
  onSendToFederation: (requestId: string) => void;
  admins?: Admin[]; // Pour afficher le nom/prénom de l'admin assigné
}

const PendingAccidentsCard: React.FC<PendingAccidentsCardProps> = ({
  pendingAccidents,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
  onSendToFederation,
  admins,
}) => {
  if (pendingAccidents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          Déclarations d'accident en attente ({pendingAccidents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date d'accident</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAccidents.map((request) => {
                // Récupération de la date d'accident depuis les détails (stockée en JSON)
                const accidentDateStr =
                  request.details && "accidentDate" in request.details
                    ? request.details.accidentDate
                    : null;
                // Récupération du nom de l'admin assigné ou affichage "Non assigné"
                const assignedName =
                  !request.assignedTo || request.assignedTo === "none"
                    ? "Non assigné"
                    : (admins &&
                        admins.find(
                          (admin) =>
                            admin.id.toString() ===
                            request.assignedTo.toString()
                        )?.name) ||
                      "Inconnu";
                // Récupération du chemin du PDF
                const certificateLink =
                  request.details && "filePath" in request.details
                    ? request.details.filePath
                    : null;
                return (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => onViewDetails(request)}
                  >
                    <TableCell className="font-medium">
                      {formatRequestId(request.id)}
                    </TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>
                      {accidentDateStr
                        ? new Date(accidentDateStr).toLocaleDateString("fr-BE")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{assignedName}</TableCell>
                    <TableCell>{getDeadlineInfo(accidentDateStr)}</TableCell>
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
                          className="text-blue-600 border-blue-600 hover:bg-blue-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendToFederation(request.id);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          <span>Envoyer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {pendingAccidents.length > 5 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingAccidentsCard;
