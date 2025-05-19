import React, { useEffect, useState } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Pencil,
  Info,
} from "lucide-react";
import { Request } from "@/components/RequestDetailsModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";

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
  onSendDeclaration: (requestId: string) => void; // ✅ AJOUTER ICI
  onSendHealingCertificate: (requestId: string) => void; // ✅ AJOUTER ICI
  admins?: Admin[];
}

const PendingAccidentsCard: React.FC<PendingAccidentsCardProps> = ({
  pendingAccidents,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
  onSendDeclaration,
  onSendHealingCertificate,
  admins,
}) => {
  const [selectedIdToSend, setSelectedIdToSend] = useState<string | null>(null);
  const [selectedHealingIdToSend, setSelectedHealingIdToSend] = useState<
    string | null
  >(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const { t, lang } = useTranslation();
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/email-recipients/accident-report"
        );
        setRecipientEmail(response.data.email);
        setNewEmail(response.data.email);
      } catch (error) {
        console.error(
          "Erreur lors du chargement de l’email du destinataire",
          error
        );
      }
    };

    fetchEmail();
  }, []);

  const groupedByCode = pendingAccidents.reduce((acc, request) => {
    const dossierCode = request.details?.codeDossier || `NO_CODE_${request.id}`;

    // 🔁 Appel au backend pour récupérer l'email actuel

    if (!acc[dossierCode]) acc[dossierCode] = [];
    acc[dossierCode].push(request);
    return acc;
  }, {} as Record<string, Request[]>);

  if (pendingAccidents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b p-4 grid grid-cols-2">
        <div className="flex flex-col">
          <CardTitle>{t("pending_accidents_title")}</CardTitle>
          <div className="mt-1 flex items-center mt-3">
            <Info className="mr-1 h-4 w-4 text-gray-500" />
            <p className="text-xs text-gray-500">
              {t("pending_accidents_info")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-100 ring-1 ring-green-300" />
          <span className="text-gray-600 text-sm">
            {t("valid_accidents_label")}
          </span>
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("dialog_edit_federation_email_title")}
                </DialogTitle>
              </DialogHeader>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("placeholder_new_recipient")}
              />
              <DialogFooter>
                <Button
                  onClick={async () => {
                    try {
                      await axios.put(
                        "http://localhost:5000/api/email-recipients/accident-report",
                        { email: newEmail }
                      );
                      setRecipientEmail(newEmail);
                      setEmailDialogOpen(false);
                    } catch (err) {
                      console.error(
                        "Erreur lors de l’enregistrement de l’email :",
                        err
                      );
                      // Vous pouvez également afficher une notification ici
                    }
                  }}
                >
                  {t("button_save")}
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
                <TableHead>{t("table_header_id")}</TableHead>
                <TableHead>{t("table_header_accident_date")}</TableHead>
                <TableHead>{t("table_header_name")}</TableHead>
                <TableHead>{t("table_header_status")}</TableHead>
                <TableHead>{t("table_header_assigned_to")}</TableHead>
                <TableHead>{t("table_header_deadline")}</TableHead>
                <TableHead>{t("table_header_actions")}</TableHead>
                <TableHead>{t("table_header_recipients")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedByCode).map(([code, requests]) => {
                // 1) trier les deux (ou une) request(s) du même dossier par date
                const sorted = [...requests].sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                // 2) la première est la déclaration, la seconde (s’il y en a) le certificat
                const declaration = sorted[0];
                const healing = sorted.length > 1 ? sorted[1] : undefined;

                const isDeclarationSent = Boolean(
                  (declaration as any)?.sent_at
                );
                const isHealingSent = Boolean(
                  healing && (healing as any).sent_at
                );

                // s’il n’y a même pas de déclaration, on skip
                if (!declaration) return null;

                const duoBg = healing ? "bg-green-100" : "";

                return (
                  <React.Fragment key={code}>
                    {/* Déclaration principale */}
                    {declaration && (
                      <TableRow
                        onClick={() => onViewDetails(declaration)}
                        className={`${duoBg} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
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
                            {t("badge_label_in_progress")}
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
                              disabled={isDeclarationSent}
                              className={cn(
                                "border-yellow-600",
                                isDeclarationSent
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-yellow-600 hover:bg-yellow-600"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDeclarationSent) {
                                  setSelectedIdToSend(declaration.id);
                                  // Set request type for email
                                  declaration.type = "accident-report";
                                }
                              }}
                            >
                              {isDeclarationSent ? (
                                "Déjà envoyé"
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{recipientEmail}</TableCell>
                      </TableRow>
                    )}
                    {/* Certificat lié */}
                    {healing && (
                      <TableRow
                        onClick={() => onViewDetails(healing)}
                        className={`${duoBg} bg-opacity-50 dark:bg-opacity-50 text-sm`}
                      >
                        <TableCell>{formatRequestId(healing.id)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="italic text-gray-500">
                          {t("healing_certificate_received")}
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
                              disabled={isHealingSent}
                              className={cn(
                                "border-yellow-600",
                                isHealingSent
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-yellow-600 hover:bg-yellow-100"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isHealingSent) {
                                  setSelectedHealingIdToSend(healing.id);
                                  // Type assertion pour contourner la vérification TypeScript
                                  (healing as any).type = "healing-notify";
                                  healing.details = {
                                    ...healing.details,
                                    documentLabel: "Certificat de guérison",
                                  };
                                }
                              }}
                            >
                              {isHealingSent ? (
                                "Déjà envoyé"
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
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

        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-gray-600">
            {t("pagination_prefix")}
            {page}
            {t("pagination_separator")}
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
      </CardContent>

      {/* Confirmation d'envoi */}
      <ConfirmationDialog
        open={!!selectedIdToSend}
        onClose={() => setSelectedIdToSend(null)}
        onConfirm={() => {
          if (selectedIdToSend) {
            onSendDeclaration(selectedIdToSend);
            setSelectedIdToSend(null);
          }
        }}
        title={t("confirm_send_declaration_title")}
        message={t("confirm_send_declaration_message")}
      />

      <ConfirmationDialog
        open={!!selectedHealingIdToSend}
        onClose={() => setSelectedHealingIdToSend(null)}
        onConfirm={() => {
          if (selectedHealingIdToSend) {
            onSendHealingCertificate(selectedHealingIdToSend);
            setSelectedHealingIdToSend(null);
          }
        }}
        title={t("confirm_send_healing_title")}
        message={t("confirm_send_healing_message")}
      />
    </Card>
  );
};

export default PendingAccidentsCard;
