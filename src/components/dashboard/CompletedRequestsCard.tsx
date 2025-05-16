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
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

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
  onUpdateStatus: (requestId: string, newStatus: RequestStatus) => void;
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
  onUpdateStatus,
}) => {
  const { t, lang } = useTranslation();
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          {t("completed_requests_title_prefix")}
          {completedRequests.length}
          {t("completed_requests_title_separator")}
          {totalCompletedCount}
          {t("completed_requests_title_suffix")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {completedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("no_completed_requests")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table_header_id")}</TableHead>
                  <TableHead>{t("table_header_type")}</TableHead>
                  <TableHead>{t("table_header_name")}</TableHead>
                  <TableHead>{t("table_header_status")}</TableHead>
                  <TableHead>{t("table_header_assigned_to")}</TableHead>
                  <TableHead>{t("table_header_date")}</TableHead>
                  <TableHead>{t("table_header_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedRequests.map((request) => {
                  const adminRecord = admins?.find(
                    (admin) => Number(admin.id) === Number(request.assignedTo)
                  );
                  const assignedName =
                    !request.assignedTo || request.assignedTo === "none"
                      ? "Non assigné"
                      : adminRecord
                      ? adminRecord.name
                      : "Inconnu";

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

                      <TableCell>{getStatusBadge(request.status)}</TableCell>

                      <TableCell>{assignedName}</TableCell>

                      <TableCell>
                        {request.date.toLocaleDateString("fr-BE")}
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
              {t("pagination_page_prefix")}
              {page}
              {t("pagination_page_separator")}
              {totalPages}
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
          <Link to="/documents">
            <Button>
              <File className="h-4 w-4 mr-2" />
              {t("button_view_completed_prefix")}
              {totalCompletedCount}
              {t("button_view_completed_suffix")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedRequestsCard;
