import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight, Eye, Send, Pencil } from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface Admin {
  id: string;
  name: string;
}

const formatRequestId = (id: string | number): string => {
  const numericId = typeof id === "number" ? id : parseInt(id, 10);
  return `DEM-${numericId.toString().padStart(3, "0")}`;
};

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
  admins?: Admin[];
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
  const [selectedIdToSend, setSelectedIdToSend] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("federation@rbfa.be");
  const [newEmail, setNewEmail] = useState(recipientEmail);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const groupedByCode = pendingAccidents.reduce((acc, request) => {
    const dossierCode = request.details?.codeDossier || `NO_CODE_${request.id}`;

    if (!acc[dossierCode]) acc[dossierCode] = [];
    acc[dossierCode].push(request);
    return acc;
  }, {} as Record<string, Request[]>);

  if (pendingAccidents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex justify-between items-center w-full">
          <CardTitle>
            Déclarations d'accident en attente ({pendingAccidents.length})
          </CardTitle>

          {/* Bouton pour modifier l'email de l'Union Belge */}
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l’email de l’Union Belge</DialogTitle>
              </DialogHeader>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Nouveau destinataire"
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    setRecipientEmail(newEmail);
                    setEmailDialogOpen(false);
                  }}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date d'accident</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Destinataires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedByCode).map(([code, requests]) => {
                const declaration = requests.find(
                  (r) => r.details?.documentLabel === "Déclaration d'accident"
                );
                const healing = requests.find(
                  (r) => r.details?.documentLabel === "Certificat de guérison"
                );

                if (!declaration) return null;

                return (
                  <React.Fragment key={code}>
                    {/* Déclaration principale */}
                    <TableRow
                      onClick={() => onViewDetails(declaration)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <TableCell>{formatRequestId(declaration.id)}</TableCell>
                      <TableCell>
                        {declaration.details?.accidentDate
                          ? new Date(
                              declaration.details.accidentDate
                            ).toLocaleDateString("fr-BE")
                          : ""}
                      </TableCell>
                      <TableCell>{declaration.name}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-500 text-white">
                          En cours
                        </div>
                      </TableCell>
                      <TableCell>
                        {admins?.find((a) => a.id === declaration.assignedTo)
                          ?.name || "Non assigné"}
                      </TableCell>
                      <TableCell>
                        {getDeadlineInfo(declaration.details?.accidentDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(declaration);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIdToSend(declaration.id);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{recipientEmail}</TableCell>
                    </TableRow>

                    {/* Certificat lié */}
                    {healing && (
                      <TableRow
                        onClick={() => onViewDetails(healing)}
                        className="bg-gray-50 dark:bg-gray-900 text-sm"
                      >
                        <TableCell>{formatRequestId(healing.id)}</TableCell>
                        <TableCell>
                          {healing.details?.accidentDate
                            ? new Date(
                                healing.details.accidentDate
                              ).toLocaleDateString("fr-BE")
                            : ""}
                        </TableCell>
                        <TableCell className="italic text-gray-500">
                          Certificat de guérison reçu
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(healing);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIdToSend(healing.id);
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{recipientEmail}</TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* Confirmation d'envoi */}
      <ConfirmationDialog
        open={!!selectedIdToSend}
        onClose={() => setSelectedIdToSend(null)}
        onConfirm={() => {
          if (selectedIdToSend) {
            onSendToFederation(selectedIdToSend);
            setSelectedIdToSend(null);
          }
        }}
        title="Envoyer à l'Union belge"
        message="Êtes-vous sûr de vouloir envoyer cette déclaration d'accident à l'Union belge de football ?"
      />
    </Card>
  );
};

export default PendingAccidentsCard;
