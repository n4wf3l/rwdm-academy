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

  if (pendingAccidents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex justify-between items-center w-full">
          <CardTitle>
            Déclarations d'accident en attente ({pendingAccidents.length})
          </CardTitle>
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
              {pendingAccidents.map((request) => {
                const accidentDateStr = request.details?.accidentDate || null;

                const assignedName =
                  !request.assignedTo || request.assignedTo === "none"
                    ? "Non assigné"
                    : admins?.find(
                        (admin) =>
                          admin.id.toString() === request.assignedTo?.toString()
                      )?.name || "Inconnu";

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
                      {accidentDateStr
                        ? new Date(accidentDateStr).toLocaleDateString("fr-BE")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-500 text-white">
                        En cours
                      </div>
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
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIdToSend(request.id);
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-700">
                        {recipientEmail}
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
