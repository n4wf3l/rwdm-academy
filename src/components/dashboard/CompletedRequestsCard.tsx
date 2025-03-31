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
import { ChevronLeft, Eye, RotateCcw, File } from "lucide-react";
import { Request, RequestStatus } from "@/components/RequestDetailsModal";
import { translateRequestType, getStatusBadge } from "./RequestsTable";

export interface Admin {
  id: string;
  name: string;
}

interface CompletedRequestsCardProps {
  completedRequests: Request[]; // La liste paginée (max 5)
  totalCompletedCount: number; // Le nombre total de demandes terminées dans la DB
  page: number;
  totalPages: number;
  admins?: Admin[]; // Liste des admins pour afficher le nom/prénom (optionnel)
  onPageChange: (page: number) => void;
  onViewDetails: (request: Request) => void;
}

// Fonction pour formater l'ID de la demande
const formatRequestId = (id: string | number): string => {
  const numericId = typeof id === "number" ? id : parseInt(id, 10);
  return `DEM-${numericId.toString().padStart(3, "0")}`;
};

// Fonction interne pour mettre à jour le statut
const updateStatus = async (requestId: string, newStatus: RequestStatus) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Token manquant");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/requests/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du statut");
    }
    console.log("Statut mis à jour avec succès pour la demande", requestId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
  }
};

const CompletedRequestsCard: React.FC<CompletedRequestsCardProps> = ({
  completedRequests,
  totalCompletedCount,
  page,
  totalPages,
  admins,
  onPageChange,
  onViewDetails,
}) => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          Demandes récentes terminées ({completedRequests.length} affichées sur{" "}
          {totalCompletedCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {completedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune demande terminée pour le moment.
            </div>
          ) : (
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
                {completedRequests.map((request) => {
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
                  return (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => onViewDetails(request)}
                    >
                      <TableCell className="font-medium">
                        {formatRequestId(request.id)}
                      </TableCell>
                      <TableCell>
                        {translateRequestType(request.type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{request.name}</div>
                          <div className="text-xs text-gray-500">
                            {request.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.date.toLocaleDateString("fr-BE")}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{assignedName}</TableCell>
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
                              updateStatus(request.id, "in-progress");
                            }}
                            disabled={request.status === "in-progress"}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {completedRequests.length > 5 && (
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
            </div>
          </div>
        )}

        <div className="flex justify-center py-4">
          <Button onClick={() => (window.location.href = "/documents")}>
            <File className="h-4 w-4 mr-2" />
            Voir les {totalCompletedCount} demandes terminées
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedRequestsCard;
