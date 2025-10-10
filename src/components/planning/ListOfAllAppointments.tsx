import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { API_BASE, fetchConfig } from "@/lib/api-config";
import { fr } from "date-fns/locale";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { Appointment } from "./planningUtils";

interface ListOfAllAppointmentsProps {
  appointments: Appointment[];
  onExitArchiveMode: () => void;
  getAppointmentBadge: (type: string) => JSX.Element;
  onAppointmentsDeleted?: (deletedIds: string[]) => void; // Ajout de cette prop
}

const ITEMS_PER_PAGE = 10;

const ListOfAllAppointments: React.FC<ListOfAllAppointmentsProps> = ({
  appointments,
  onExitArchiveMode,
  getAppointmentBadge,
  onAppointmentsDeleted, // Nouveau callback
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState(0);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  // Récupérer les rendez-vous pour la page actuelle
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handler pour la sélection d'un rendez-vous
  const toggleAppointmentSelection = (id: string, selected?: boolean) => {
    setSelectedAppointments((prev) => {
      const newSelection = new Set(prev);
      if (selected !== undefined) {
        selected ? newSelection.add(id) : newSelection.delete(id);
      } else {
        prev.has(id) ? newSelection.delete(id) : newSelection.add(id);
      }
      return newSelection;
    });
  };

  // Handler pour sélectionner/désélectionner tous les rendez-vous
  const toggleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(
        paginatedAppointments.map((appointment) => appointment.id)
      );
      setSelectedAppointments(allIds);
    } else {
      setSelectedAppointments(new Set());
    }
  };

  // Fonction pour archiver les rendez-vous sélectionnés
  const handleArchiveAppointments = async () => {
    if (selectedAppointments.size === 0) {
      toast({
        title: "Aucun rendez-vous sélectionné",
        description: "Veuillez sélectionner au moins un rendez-vous.",
        variant: "destructive",
      });
      return;
    }

    setIsArchiving(true);
    setArchiveProgress(0);

    try {
      const zip = new JSZip();
      const selectedAppts = appointments.filter((appt) =>
        selectedAppointments.has(appt.id)
      );

      // Générer les PDFs pour chaque rendez-vous
      for (let i = 0; i < selectedAppts.length; i++) {
        const appt = selectedAppts[i];

        // Créer un PDF pour le rendez-vous avec une orientation portrait
        const pdf = new jsPDF("p", "mm", "a4");

        // Ajouter un fond blanc (par défaut)
        pdf.setFillColor(255, 255, 255);

        // Titre du document avec style professionnel
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 59, 112);
        pdf.text("RWDM ACADEMY", 105, 15, { align: "center" });

        pdf.setFontSize(14);
        pdf.text("CONFIRMATION DE RENDEZ-VOUS", 105, 23, { align: "center" });

        // Ligne horizontale séparatrice
        pdf.setDrawColor(0, 59, 112);
        pdf.setLineWidth(0.5);
        pdf.line(10, 30, 200, 30);

        // Référence du document
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Référence: RDV-${String(appt.id)}`, 10, 38);
        pdf.text(
          `Généré le: ${format(new Date(), "dd/MM/yyyy à HH:mm")}`,
          200,
          38,
          { align: "right" }
        );

        // Informations du rendez-vous
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Détails du rendez-vous", 10, 50);

        // Encadré pour les infos principales
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(10, 55, 190, 55, 2, 2);

        // Colonnes d'informations
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        // Colonne gauche
        pdf.text("Date:", 15, 65);
        pdf.text("Heure:", 15, 75);
        pdf.text("Type:", 15, 85);
        pdf.text("Administrateur:", 15, 95);

        // Colonne droite (valeurs)
        pdf.setFont("helvetica", "bold");
        pdf.text(format(appt.date, "dd/MM/yyyy", { locale: fr }), 50, 65);
        pdf.text(String(appt.time || format(appt.date, "HH:mm")), 50, 75);

        // Formatter le type plus professionnellement
        const typeLabel =
          {
            registration: "Inscription à l'académie",
            "selection-tests": "Tests de sélection",
            "accident-report": "Déclaration d'accident",
            "responsibility-waiver": "Décharge de responsabilité",
            other: "Autre",
          }[appt.type] || appt.type;

        pdf.text(typeLabel, 50, 85);
        pdf.text(`${appt.adminFirstName} ${appt.adminLastName}`, 50, 95);

        // Informations du joueur
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Informations du participant", 10, 125);

        // Encadré pour les infos du joueur
        pdf.roundedRect(10, 130, 190, 40, 2, 2);

        // Données du joueur
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text("Nom complet:", 15, 140);
        pdf.text("Email:", 15, 150);
        pdf.text("ID:", 15, 160);

        pdf.setFont("helvetica", "bold");
        pdf.text(appt.personName, 50, 140);
        pdf.text(appt.email || "Non spécifié", 50, 150);
        pdf.text(String(appt.id), 50, 160);

        // Notes
        if (appt.notes) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Notes", 10, 185);

          pdf.roundedRect(10, 190, 190, 60, 2, 2);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          const splitNotes = pdf.splitTextToSize(appt.notes, 180);
          pdf.text(splitNotes, 15, 200);
        }

        // Pied de page
        pdf.setDrawColor(0, 59, 112);
        pdf.setLineWidth(0.5);
        pdf.line(10, 270, 200, 270);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          "RWDM Academy - Rue Charles Malis 61, 1080 Molenbeek-Saint-Jean",
          105,
          275,
          { align: "center" }
        );
        pdf.text(
          "Ce document a été généré automatiquement et ne nécessite pas de signature.",
          105,
          280,
          { align: "center" }
        );
        pdf.text("www.rwdmacademy.be", 105, 285, { align: "center" });

        // Format de nom de fichier: NOM_PRENOM_DATE.pdf
        // Extraire le nom et prénom
        const fullName = appt.personName.trim();
        let lastName = "",
          firstName = "";

        if (fullName.includes(" ")) {
          const parts = fullName.split(" ");
          lastName = parts[0].toUpperCase();
          firstName = parts.slice(1).join(" ");
        } else {
          lastName = fullName.toUpperCase();
        }

        const formattedDate = format(appt.date, "yyyy-MM-dd");
        const fileName = `${lastName}_${firstName}_${formattedDate}.pdf`;

        // Ajouter au zip
        zip.file(fileName, pdf.output("blob"));

        // Mettre à jour la progression
        setArchiveProgress(Math.round(((i + 1) / selectedAppts.length) * 100));
      }

      // Générer le fichier zip
      const content = await zip.generateAsync({ type: "blob" });

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rendez-vous_archives_${
        new Date().toISOString().split("T")[0]
      }.zip`;
      link.click();

      // Nettoyer
      URL.revokeObjectURL(url);

      // Supprimer les rendez-vous archivés de la base de données
      try {
        // Convertir tous les IDs en nombres si nécessaire
        const deletedIds = Array.from(selectedAppointments);

        try {
          const deletionPromises = deletedIds.map(async (apptId) => {
            const response = await fetch(
              `${API_BASE}/api/appointments/${apptId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(
                `Échec de suppression du rendez-vous ${apptId}: ${response.statusText}`
              );
            }

            return apptId;
          });

          // Attendre que toutes les suppressions soient terminées
          await Promise.all(deletionPromises);

          // Mettre à jour l'état local IMMÉDIATEMENT
          // Filtrer directement les rendez-vous archivés de l'affichage
          appointments = appointments.filter(
            (appt) => !selectedAppointments.has(appt.id)
          );

          // Maintenant appeler le callback pour mettre à jour l'état du parent
          if (onAppointmentsDeleted) {
            onAppointmentsDeleted(deletedIds);
          }

          // Réinitialiser la sélection
          setSelectedAppointments(new Set());

          console.log(
            `✅ ${deletedIds.length} rendez-vous supprimés avec succès`
          );

          toast({
            title: "Archive créée avec succès",
            description: `${deletedIds.length} rendez-vous ont été archivés et supprimés.`,
          });
        } catch (error) {
          console.error(
            "Erreur lors de la suppression des rendez-vous:",
            error
          );
          toast({
            title: "Attention",
            description:
              "Les rendez-vous ont été archivés mais certains n'ont pas pu être supprimés.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'archivage :", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'archivage.",
          variant: "destructive",
        });
      } finally {
        setIsArchiving(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'archivage :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'archivage.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {t("appointments_archive_mode")}
        </h2>
        <Button variant="outline" className="gap-2" onClick={onExitArchiveMode}>
          <X className="h-4 w-4" />
          {t("exitArchiveMode")}
        </Button>
      </div>

      {/* Barre de sélection des actions */}
      <div className="flex justify-between items-center mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={
              paginatedAppointments.length > 0 &&
              paginatedAppointments.every((appt) =>
                selectedAppointments.has(appt.id)
              )
            }
            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {t("selectAll")} ({paginatedAppointments.length})
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setSelectedAppointments(new Set())}
            disabled={selectedAppointments.size === 0}
          >
            {t("deselectAll")}
          </Button>

          <Button
            variant="default"
            className="bg-amber-600 hover:bg-amber-700"
            size="sm"
            onClick={handleArchiveAppointments}
            disabled={selectedAppointments.size === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("archiveSelected")} ({selectedAppointments.size})
          </Button>
        </div>
      </div>

      {/* Barre de progression lors de l'archivage */}
      {isArchiving && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border">
          <p className="text-sm font-medium mb-2">
            {t("archivingInProgress")} ({archiveProgress}%)
          </p>
          <Progress value={archiveProgress} className="h-2" />
        </div>
      )}

      {/* Table des rendez-vous */}
      <Table>
        <TableHeader>
          <TableRow>
            <motion.th
              className="w-12 px-4 py-2 text-left font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t("select")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              ID
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {t("appointment_date")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {t("appointment_time")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t("appointment_type")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {t("appointment_client")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t("appointment_email")}
            </motion.th>
            <motion.th
              className="px-4 py-2 text-left font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {t("appointment_admin")}
            </motion.th>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {paginatedAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t("no_appointments")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedAppointments.map((appointment, idx) => (
                <motion.tr
                  key={appointment.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedAppointments.has(appointment.id)
                      ? "bg-amber-50 dark:bg-amber-900/20"
                      : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <TableCell className="w-12">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAppointmentSelection(appointment.id);
                      }}
                    >
                      <Checkbox
                        checked={selectedAppointments.has(appointment.id)}
                        className="cursor-pointer"
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </TableCell>

                  <TableCell>{appointment.id}</TableCell>

                  <TableCell>
                    {format(appointment.date, "dd/MM/yyyy", { locale: fr })}
                  </TableCell>

                  <TableCell>
                    {appointment.time || format(appointment.date, "HH:mm")}
                  </TableCell>

                  <TableCell>{getAppointmentBadge(appointment.type)}</TableCell>

                  <TableCell>{appointment.personName}</TableCell>

                  <TableCell>{appointment.email || "-"}</TableCell>

                  <TableCell>
                    {`${appointment.adminFirstName} ${appointment.adminLastName}`}
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            {t("previous")}
          </Button>
          <span className="text-sm text-gray-600">
            {t("page")}&nbsp;{currentPage}&nbsp;{t("of")}&nbsp;{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ListOfAllAppointments;
